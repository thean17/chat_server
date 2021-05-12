import FileType from 'file-type';
import Message, { MessageType } from '../database/model/message';
import Room from '../database/model/room';
import RoomMember from '../database/model/roomMember';
import Player from '../database/model/user';
import minio from '../minio';
import { v4 as uuid } from 'uuid';

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

					let filePath = null;
					if ([MessageType.Image, MessageType.Voice].includes(type)) {
						const file = Buffer.from(message);
						const fileType = await FileType.fromBuffer(file);

						const objectName = `${id}/${uuid()}.${fileType.ext}`;

						await minio().putObject('chat', objectName, file);

						filePath = '/chat/' + objectName;
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
						filePath,
					}).then(async (doc) => {
						const image =
							doc.filePath !== null
								? await minio().presignedGetObject(
										doc.filePath.split('/')[0],
										doc.filePath.split('/').slice(1).join('/')
								  )
								: null;

						return {
							id: doc.uid,
							message: doc.content,
							dateTime: doc.createdAt,
							image,
							sender: {
								Id: player.playerName,
								UserName: player.playerName,
								Name: player.playerName,
								AvatarFileName:
									'https://www.thewrap.com/wp-content/uploads/2021/03/Invincible.jpeg',
								IsBlackList: false,
								IsFriend: false,
							},
						};
					});

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
		});

		socket.on('set_typing', () => {});

		socket.on('unset_typing', () => {});

		socket.on('get_active_users', () => {});
	};

	io.on('connection', handleConnection);

	io.on('disconnect', (reason) => {
		console.log('disconnected: ', reason);

		delete users[socket.id];
	});

	return io;
}
