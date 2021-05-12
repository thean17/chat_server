import { Client } from 'minio';
import Configuration from '../config';

/**
 *
 * @param {Client} minio
 */
const makeBuckets = async (minio) => {
	const bucketExists = await minio.bucketExists('chat');

	if (!bucketExists) {
		await minio.makeBucket('chat', 'my_region');
	}
};

/**
 * @type {Client}
 */
let _minio = null;

export const connectMinio = () => {
	if (_minio) return minio;

	_minio = new Client({
		endPoint: Configuration.minio.endPoint,
		port: Configuration.minio.port,
		accessKey: Configuration.minio.accessKey,
		secretKey: Configuration.minio.secretKey,
		useSSL: false,
	});

	makeBuckets(_minio);

	return _minio;
};

export default () => {
	return _minio;
};
