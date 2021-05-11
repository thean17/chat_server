import mongoose, { Schema } from 'mongoose';

const RoomMemberSchema = new Schema({
	roomId: {
		type: Schema.Types.String,
		required: true,
	},
	playerId: {
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

const RoomMember = mongoose.model('RoomMember', RoomMemberSchema);

export default RoomMember;
