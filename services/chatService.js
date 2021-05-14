import { Document } from 'mongoose';
import Message from '../database/model/message';
import Room from '../database/model/room';
import RoomMember from '../database/model/roomMember';
import Player from '../database/model/user';
import minio from '../minio';

class Result {
	/**
	 *
	 * @param {boolean} success
	 * @param {any} payload
	 * @param {any?} error
	 */
	constructor(success, payload, error) {
		this.success = success;
		this.payload = payload;
		this.error = error;
	}

	get failed() {
		return !this.success;
	}

	static createSuccess(payload) {
		return new Result(true, payload, null);
	}

	static createFailure(error) {
		return new Result(false, null, error);
	}
}

class ChatService {
	/**
	 *
	 * @param {Document<any, {}>} player
	 * @param {Document<any, {}>} member
	 * @returns
	 */
	async isPlayerMemberOfRoom(player, room) {
		const count = await RoomMember.count({
			room: room._id,
			player: player._id,
		});
		return count > 0;
	}

	async getChatRooms(playerName) {
		const player = await Player.findOne({ playerName: 'thean1' });
		const rooms = await RoomMember.find({ player: player._id })
			.populate('room')
			.lean();

		const room = await Promise.all(
			rooms.map(async (roomMember) => {
				const latestMessage = await Message.findOne({ room: roomMember._id });

				return {
					...this.mapChatRoom(roomMember.room),
					latestMessage: latestMessage ? this.mapMessage(latestMessage) : null,
				};
			})
		);

		return Result.createSuccess(room);
	}

	async getMessages(playerName, roomUid) {
		const [room, player] = await Promise.all([
			Room.findOne({ uid: roomUid }),
			Player.findOne({ playerName: 'thean1' }),
		]);

		const isMemberOfRoom = await this.isPlayerMemberOfRoom(
			player._id,
			room._id
		);

		if (!isMemberOfRoom) return Result.createFailure('Room Not Found');

		const messages = await Message.find({
			room: room._id,
		})
			.sort('-_id')
			.populate('player')
			.then((messages) => Promise.all(messages.map(this.mapMessage)));

		return Result.createSuccess(messages);
	}

	async getFileURL(filePath) {
		let paths = filePath.split('/');
		if (paths[0] === '') paths = paths.slice(1);
		const bucketName = paths[0];

		return await minio().presignedGetObject(
			bucketName,
			paths.slice(1).join('/')
		);

		return null;
	}

	async getMessageFileURL(message) {
		return message.filePath ? await this.getFileURL(message.filePath) : null;
	}

	mapChatRoom(room) {
		return {
			id: room.uid,
			type: room.type,
			name: room.roomId,
			image:
				'https://yt3.ggpht.com/ytc/AAUvwniT7szegth7wkEIudUBi875G5qEIcR2TO5IgKuJ=s900-c-k-c0x00ffffff-no-rj',
		};
	}

	mapMessageSender(player) {
		return {
			Id: player.playerName,
			UserName: player.playerName,
			Name: player.playerName,
			AvatarFileName:
				'https://www.thewrap.com/wp-content/uploads/2021/03/Invincible.jpeg',
			IsBlackList: false,
			IsFriend: false,
		};
	}

	mapMessage = async (message) => {
		return {
			id: message.uid,
			message: message.content,
			dateTime: message.createdAt,
			type: message.type,
			filePath: await this.getMessageFileURL(message),
			sender: message.player ? this.mapMessageSender(message.player) : nul,
		};
	};
}

const instance = new ChatService();

Object.freeze(instance);

export default instance;
