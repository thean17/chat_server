module.exports = {
	apps: [
		{
			name: 'socket-chat-server-debug',
			script: 'index.js',
			env: {
				DEBUG: 'socket-io-chat:*',
			},
			exp_backoff_restart_delay: 100,
      max_restarts: 10
		},
	],
};
