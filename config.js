const Configuration = {
	mongo: {
		connectionURL: 'mongodb://admin:password@localhost:27017',
		dbName: 'game_app_chat',
	},
	minio: {
		endPoint: 'http://127.0.0.1',
		port: 9000,
		accessKey: 'minioadmin',
		secretKey: 'minioadmin',
	},
};

export default Configuration;
