import log4js from 'log4js';

log4js.configure({
	appenders: {
		'socket-io-chat:server': {
			type: 'file',
			filename: `logs/${Date.now()}.log`,
		},
	},
	categories: {
		default: { appenders: ['socket-io-chat:server'], level: 'debug' },
	},
});

const logger = log4js.getLogger('socket-io-chat:server');

export const debug = logger.debug.bind(logger);

export default logger;
