import mongoose from 'mongoose';
import Player from './model/user';
import Configuration from '../config';
import { v4 as uuid } from 'uuid';
import Room, { RoomType } from './model/room';
import RoomMember from './model/roomMember';

const connectDatabase = async () => {
	await mongoose.connect(Configuration.mongo.connectionURL);

	const users = [
		{
			playerName: 'thean1',
			password: '12345678',
		},
		{
			playerName: 'thean2',
			password: '12345678',
		},
	];

	const rooms = [
		{
			roomId: uuid(),
			type: RoomType.Private,
			createdBy: users[0].playerName,
			members: users.map((user) => user.playerName),
		},
	];

	await Promise.all(
		users.map(async (user) => {
			const count = await Player.count({ playerName: user.playerName });

			if (count <= 0) {
				return Player.create(user);
			}
		})
	);

	const roomCount = await Room.count();
	if (roomCount <= 0) {
		rooms.map(async (room) => {
			const [createdBy, members] = await Promise.all([
				Player.findOne({
					playerName: room.createdBy,
				}),
				Promise.all(
					room.members.map((member) =>
						Player.findOne({
							playerName: member,
						})
					)
				),
			]);
			return Room.create({
				roomId: room.roomId,
				createdBy: createdBy._id,
				type: room.type,
			}).then((room) => {
				return Promise.all(
					members.map((member) =>
						RoomMember.create({
							roomId: room.roomId,
							playerId: member._id,
						})
					)
				);
			});
		});
	}
};

export default connectDatabase;
