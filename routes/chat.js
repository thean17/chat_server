import express from 'express';
import Message from '../database/model/message';
import Room from '../database/model/room';
import RoomMember from '../database/model/roomMember';
import Player from '../database/model/user';

const router = express.Router();

/* GET users listing. */
router.get('/getAllChatInfo', async function (req, res, next) {
	try {
		console.log(req.headers);
		const player = await Player.findOne({ playerName: 'thean1' });
		const rooms = await RoomMember.find({ player: player._id })
			.populate('room')
			.lean();

		const room = await Promise.all(
			rooms.map(async (roomMember) => {
				const latestMessage = await Message.findOne({ room: roomMember._id });

				return {
					id: roomMember.room.uid,
					type: roomMember.room.type,
					name: roomMember.room.roomId,
					image:
						'https://yt3.ggpht.com/ytc/AAUvwniT7szegth7wkEIudUBi875G5qEIcR2TO5IgKuJ=s900-c-k-c0x00ffffff-no-rj',
					latestMessage: latestMessage
						? {
								id: latestMessage.uid,
								message: latestMessage.content,
								dateTime: latestMessage.createdAt,
						  }
						: null,
				};
			})
		);

		res.json(room);
	} catch (error) {
		next(error);
	}
});

router.get('/getAllMessages/:id', async function (req, res, next) {
	try {
		console.log(req.headers);
		const [room, player] = await Promise.all([
			Room.findOne({ uid: req.params.id }),
			Player.findOne({ playerName: 'thean1' }),
		]);
		const isMemberOfRoom = await RoomMember.count({
			room: room._id,
			player: player._id,
		}).then((count) => count > 0);

		if (!isMemberOfRoom) return res.status(404).json('Room Not Found');

		const messages = await Message.find({
			room: room._id,
		})
			.sort('-_id')
			.populate('player')
			.then((messages) =>
				messages.map((message) => {
					return {
						id: message.uid,
						message: message.content,
						dateTime: message.createdAt,
						sender: {
							Id: message.player.playerName,
							UserName: message.player.playerName,
							Name: message.player.playerName,
							AvatarFileName:
								'https://www.thewrap.com/wp-content/uploads/2021/03/Invincible.jpeg',
							IsBlackList: false,
							IsFriend: false,
						},
					};
				})
			);

		res.json(messages);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
