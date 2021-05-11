import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

export const RoomType = {
	Private: 1,
	Group: 2,
};

const RoomSchema = new Schema({
	uid: {
		type: Schema.Types.Number,
		required: true,
		unique: true,
	},
	roomId: {
		type: Schema.Types.String,
		required: true,
		index: true,
	},
	type: {
		type: Schema.Types.Number,
		required: true,
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'Player',
	},
	createdAt: {
		type: Schema.Types.Date,
		required: true,
		default: Date.now,
	},
});

autoIncrement.initialize(mongoose.connection);
RoomSchema.plugin(autoIncrement.plugin, {
	model: 'Room',
	field: 'uid',
	startAt: 10000,
	incrementBy: 1,
});

const Room = mongoose.model('Room', RoomSchema);

export default Room;
