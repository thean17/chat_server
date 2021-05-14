import express from 'express';
import ChatService from '../services/chatService';

const router = express.Router();

router.get('/getAllChatInfo', async function (req, res, next) {
	try {
		console.log(req.headers);

		const result = await ChatService.getChatRooms('thean1');

		if (result.failed) {
			return res.status(400).json({
				status: false,
				message: result.error,
			});
		}

		console.log(result);

		return res.json(result.payload);
	} catch (error) {
		next(error);
	}
});

router.get('/getAllMessages/:id', async function (req, res, next) {
	try {
		console.log(req.headers);

		const result = await ChatService.getMessages('thean1', req.params.id);

		if (result.failed) {
			return res.status(400).json({
				status: false,
				message: result.error,
			});
		}

		return res.json(result.payload);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
