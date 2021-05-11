import express from 'express';
import Message from '../database/model/message';
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
			rooms.map(async (room) => {
				const latestMessage = await Message.findOne({ room: room._id });
				
				return {
					id: room.uid,
					name: room.roomId,
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

module.exports = router;
