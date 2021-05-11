import express from 'express';

const router = express.Router();

/* GET users listing. */
router.get('/getAllChatInfo', function (req, res, next) {
	console.log(req.headers);

	res.json([
		{
			id: 1,
			name: 'Test',
			image:
				'https://yt3.ggpht.com/ytc/AAUvwniT7szegth7wkEIudUBi875G5qEIcR2TO5IgKuJ=s900-c-k-c0x00ffffff-no-rj',
			latestMessage: {
        id: 1,
        message: 'Test Message',
        dateTime: '2021-05-09T14:02:34+0000'
      },
		},
	]);
});

module.exports = router;
