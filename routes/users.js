import express from 'express';
import User from '../database/model/user';

const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
	res.send('respond with a resource');
});
router.post('/login', async function (req, res, next) {
	try {
		const { playerName, password } = req.body;

		const user = await User.findOne({ playerName, password });

		if (!user) {
			return res.status(400).json({
				status: false,
				message: 'Incorrect player name or passwor',
			});
		}

		return res.json({
			status: true,
			message: 'Login successfully',
		});
	} catch (error) {
		next(error);
	}
});

router.post('/register', async function (req, res, next) {
	try {
		const { playerName, password } = req.body;

		const user = await User.create({ playerName, password });

		return res.json({
			status: true,
			message: 'Register successfully',
      user
		});
	} catch (error) {
		next(error);
	}
});

module.exports = router;
