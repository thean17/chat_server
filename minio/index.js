import Minio from 'minio';
import Configuration from '../config';

/**
 * @type {Minio.Client}
 */
let minio;

export const connectMinio = () => {
	if (!!minio) return minio;

	minio = new Minio.Client({
		endPoint: Configuration.minio.endPoint,
		port: Configuration.minio.port,
		accessKey: Configuration.minio.accessKey,
		secretKey: Configuration.minio.secretKey,
	});

	return minio;
};

export default minio;
