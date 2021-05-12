import Message, { MessageType } from '../database/model/message';
import Player from '../database/model/user';
import Room from '../database/model/room';
import RoomMember from '../database/model/roomMember';
import fs from 'fs';
import FileType from 'file-type';

/**
 *
 * @param {import('http').Server} server
 * @returns
 */
export default function (server) {
	/**
	 * @type {import('socket.io').Server}
	 */
	const io = require('socket.io')(server, {
		cors: {
			origin: '*',
		},
	});

	const users = {};
	const groups = {};

	const getSocketIdByUsername = (username) =>
		Object.keys(users).find((key) => users[key].username === username);

	const getUsernameBySocketId = (socketId) => users[socketId].username;

	const getGroups = () =>
		Object.keys(groups).map((key) =>
			Object.assign({}, groups[key], { name: key })
		);

	const isGroupParticipant = (groupName, socketId) =>
		groups[groupName] && groups[groupName].participants[socketId];

	/**
	 *
	 * @param {import('socket.io').Socket} socket
	 */
	const handleConnection = (socket) => {
		console.log('new connection');

		users[socket.id] = { username: socket.id, connectedAt: new Date() };

		socket.on('join_room', async (id) => {
			console.log('join_room: ', id);

			const [room, player] = await Promise.all([
				Room.findOne({ uid: id }),
				Player.findOne({ playerName: 'thean1' }),
			]);
			const roomMember = await RoomMember.findOne({
				room: room._id,
				// player: socket.handshake.headers.id,
				player: player._id,
			});

			console.log({
				room,
				player,
				roomMember,
			});

			if (roomMember) {
				socket.join(room.uid);

				// socket.emit('receive_message_from_room', 'Test', { something: 'Something' });

				// socket
				// 	.to(room.uid)
				// 	.emit('receive_message_from_room', 'Test', { something: 'Something' });
			} else {
				socket.emit('join_room', null);
			}
		});

		socket.on(
			'send_message_to_room',
			async (id, message, type = MessageType.Text) => {
				if (socket.rooms.has(id)) {
					console.log(socket.handshake.headers);

					console.log({
						message,
						type,
					});
					if (type === MessageType.Image) {
						const file = Buffer.from(message);
						const fileType = await FileType.fromBuffer(file);
					}

					const [room, player] = await Promise.all([
						Room.findOne({ uid: id }),
						Player.findOne({ playerName: socket.handshake.headers.playername }),
					]);
					const msg = await Message.create({
						player: player._id,
						playerId: player.playerId,
						playerName: player.playerName,
						room: room._id,
						roomId: room.roomId,
						type,
						content: type === MessageType.Image ? 'image' : message,
						createdBy: player.playerId,
					}).then((doc) => ({
						id: doc.uid,
						message: doc.content,
						dateTime: doc.createdAt,
						sender: {
							Id: player.playerName,
							UserName: player.playerName,
							Name: player.playerName,
							AvatarFileName:
								'https://www.thewrap.com/wp-content/uploads/2021/03/Invincible.jpeg',
							IsBlackList: false,
							IsFriend: false,
						},
					}));

					socket.emit('receive_message_from_room', msg, type);
					socket.to(id).emit('receive_message_from_room', msg, type);
				}
			}
		);

		socket.on('disconnect', async () => {
			delete users[socket.id];

			// if (socket.roomId) {
			// 	const matchingSockets = await io.in(socket.roomId).allSockets();
			// 	const isDisconnected = matchingSockets.size === 0;
			// 	if (isDisconnected) {
			// 		// notify other users
			// 		socket.broadcast.emit('user disconnected', socket.userID);
			// 		// update the connection status of the session
			// 		sessionStore.saveSession(socket.sessionID, {
			// 			userID: socket.userID,
			// 			username: socket.username,
			// 			connected: false,
			// 		});
			// 	}
			// }

			io.emit('get_active_users', Object.values(users));
		});

		socket.on('set_username', (username, func) => {
			if (Object.values(users).find((user) => user.username === username)) {
				if (typeof func === 'function') return func('username_exists');

				return;
			}

			users[socket.id].username = username;

			if (typeof func === 'function') func();

			io.emit('get_active_users', Object.values(users));
		});

		socket.on('get_groups', () => {
			console.log('get_groups: ', getGroups());
			socket.emit('set_groups', getGroups());
		});
		socket.on('create_group', (groupName) => {
			groups[groupName] = {
				createdBy: users[socket.id].username,
				participants: {},
			};

			console.log(groups);

			io.emit('set_groups', getGroups());
		});
		socket.on('join_group', (groupName) => {
			if (groups[groupName]) {
				const joined = isGroupParticipant(groupName, socket.id);

				console.log('join_group: ', joined);
				if (!joined) {
					groups[groupName].participants[socket.id] = users[socket.id];

					socket.join(groupName);
					socket.emit('joined_group', groupName);
				}
			}
		});
		socket.on('send_group_message', (groupName, message) => {
			console.log('send_group_message', groupName, groups[groupName]);
			if (isGroupParticipant(groupName, socket.id)) {
				io.to(groupName).emit(
					'receive_group_message#' + groupName,
					users[socket.id].username,
					message
				);
			} else {
				console.log('not group participant');
			}
		});
		socket.on('set_typing', (groupName) => {
			if (isGroupParticipant(groupName, socket.id)) {
				socket
					.to(groupName)
					.emit('is_typing#' + groupName, getUsernameBySocketId(socket.id));
			}
		});
		socket.on('unset_typing', (groupName) => {
			if (isGroupParticipant(groupName, socket.id)) {
				io.to(groupName).emit('is_typing#' + groupName, null);
			}
		});

		socket.on('message', (to, message, type) => {
			io.to(getSocketIdByUsername(to)).emit(
				'message',
				users[socket.id].username,
				message,
				type
			);
		});

		socket.broadcast.emit('get_active_users', Object.values(users));
		socket.on('get_active_users', () => {
			socket.emit('get_active_users', Object.values(users));
		});

		socket.on('my_ping', () => {
			console.log('ping');
			socket.emit('my_pong');
		});

		socket.emit('message', 'WELCOME');
	};

	io.on('connection', handleConnection);

	io.on('disconnect', (reason) => {
		console.log('disconnected: ', reason);

		delete users[socket.id];
	});

	return io;
}
