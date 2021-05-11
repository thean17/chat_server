import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

export const MessageType = {
	Text: 1,
	Image: 2,
	Voice: 3,
};

const MessageSchema = new Schema({
	uid: {
		type: Schema.Types.Number,
		required: true,
		unique: true,
	},
	player: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'Player',
	},
	playerId: {
		type: Schema.Types.Number,
		required: true,
	},
	playerName: {
		type: Schema.Types.String,
		required: true,
	},
	room: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'Room',
	},
	roomId: {
		type: Schema.Types.String,
		required: true,
		index: true,
	},
	type: {
		type: Schema.Types.Number,
		required: true,
		default: MessageType.Text,
	},
	content: {
		type: Schema.Types.String,
		required: true,
	},
	createdBy: {
		type: Schema.Types.Number,
		required: true,
	},
	createdAt: {
		type: Schema.Types.Date,
		required: true,
		default: Date.now,
	},
	filePath: {
		type: Schema.Types.String,
	},
});

autoIncrement.initialize(mongoose.connection);
MessageSchema.plugin(autoIncrement.plugin, {
	model: 'Message',
	field: 'uid',
	startAt: 10000,
	incrementBy: 1,
});

const Message = mongoose.model('Message', MessageSchema);

export default Message;
