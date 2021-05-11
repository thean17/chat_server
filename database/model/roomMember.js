import mongoose, { Schema } from 'mongoose';

const RoomMemberSchema = new Schema({
	room: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'Room',
	},
	roomId: {
		type: Schema.Types.String,
		required: true,
	},
	player: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'Player',
	},
	joinedAt: {
		type: Schema.Types.Date,
		required: true,
		default: Date.now,
	},
});

RoomMemberSchema.index({ room: 1, player: 1 }, { unique: true });

const RoomMember = mongoose.model('RoomMember', RoomMemberSchema);

export default RoomMember;
