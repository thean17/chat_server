import log4js from 'log4js';

const date = new Date();
const components = [
	date.getFullYear(),
	date.getMonth(),
	date.getDay(),
	date.getHours(),
	date.getMinutes(),
	date.getSeconds(),
	date.getMilliseconds(),
];

const filename =
	components[0] +
	components
		.slice(1, 3)
		.map((c) => c.toString().padStart(2, '0'))
		.join('') +
	'_' +
	components
		.slice(3, 6)
		.map((c) => c.toString().padStart(2, '0'))
		.join('') +
	'_' +
	components[6];

log4js.configure({
	appenders: {
		console: { type: 'console' },
		file: {
			type: 'file',
			filename: `logs/${filename}.log`,
		},
	},
	categories: {
		default: { appenders: ['file', 'console'], level: 'debug' },
	},
});

const logger = log4js.getLogger('socket-io-chat:server');

export const debug = logger.debug.bind(logger);

export default logger;
