import axios from 'axios';
import FormData from 'form-data';

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

	const convertMessage = ({
		channelId,
		createdBy,
		createdDt,
		filePath,
		messageContent,
		messageType,
		playerId,
		playerName,
		timeToken,
	}) => {
		return {
			ChannelId: channelId,
			CreatedBy: createdBy,
			CreatedDt: createdDt,
			FilePath: filePath,
			IsRead: true,
			MessageContent: messageContent,
			MessageType: messageType,
			PlayerId: playerId,
			PlayerName: playerName,
			TimeToken: timeToken,
			TimeTokenDt: new Date(timeToken).toISOString(),
		};
	};

	/**
	 *
	 * @param {import('socket.io').Socket} socket
	 */
	const handleConnection = (socket) => {
		console.log('new connection');

		users[socket.id] = { username: socket.id, connectedAt: new Date() };

		socket.on('join_room', async (channelId) => {
			socket.join(channelId);
		});

		socket.on(
			'send_message_to_room',
			async (
				channelId,
				messageContent,
				messageType = 'TEXT',
				filePath,
				playerId,
				timeToken,
				filename
			) => {
				try {
					console.log({
						'socket.handshake.headers': socket.handshake.headers,
						message: messageContent,
						type: messageType,
						filename,
					});
					if (socket.rooms.has(channelId)) {
						const isText = messageType === 'TEXT';
						let data = {
							channelId,
							filePath,
							messageContent,
							messageType,
							playerId,
							timeToken,
						};

						if (!isText) {
							const form = new FormData();

							for (var key in data) {
								if (key !== 'messageContent') {
									form.append(key, data[key]);
								} else {
									form.append('file0', Buffer.from(data[key]), { filename });
									form.append('messageContent', '');
								}
							}

							data = form;
						}

						const message = await axios.post(
							`https://machine-bo.azurewebsites.net/api/mapichat/${
								isText ? 'LogChat' : 'LogFile'
							}`,
							data,
							{
								headers: {
									authorization: socket.handshake.headers.authorization,
									lang: socket.handshake.headers.lang,
									...(!isText
										? {
												'Content-Type': `multipart/form-data; boundary=${data.getBoundary()}`,
										  }
										: {}),
								},
							}
						);

						socket.emit(
							'receive_message_from_room',
							convertMessage(message.data),
							messageType
						);
						socket
							.to(channelId)
							.emit(
								'receive_message_from_room',
								convertMessage(message.data),
								messageType
							);
					} else {
						console.log('room not found');
					}
				} catch (error) {
					console.error('send_message_to_room error: ');
					if (error.isAxiosError) {
						console.error(error.response);
					} else {
						console.error(error);
					}
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
