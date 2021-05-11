import mongoose, { Schema } from 'mongoose';

export const MessageType = {
	Text: 1,
	Image: 2,
	Voice: 3,
};

const MessageSchema = new Schema({
	playerId: {
		type: Schema.Types.Number,
		required: true,
	},
	playerName: {
		type: Schema.Types.String,
		required: true,
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

const Message = mongoose.model('Message', MessageSchema);

export default Message;
