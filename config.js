const Configuration = {
	mongo: {
		connectionURL: 'mongodb://admin:password@localhost:27017',
		dbName: 'game_app_chat',
	},
	minio: {
		endPoint: '192.168.0.136',
		port: 9000,
		accessKey: 'minioadmin',
		secretKey: 'minioadmin',
	},
};

export default Configuration;
