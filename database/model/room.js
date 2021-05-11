import mongoose, { Schema } from 'mongoose';

export const RoomType = {
	Private: 1,
	Group: 2,
};

const RoomSchema = new Schema({
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

const Room = mongoose.model('Room', RoomSchema);

export default Room;
