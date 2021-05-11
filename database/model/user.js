import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

const PlayerSchema = new Schema({
	playerId: {
		type: Schema.Types.Number,
		required: true,
	},
	playerName: {
		type: Schema.Types.String,
		required: true,
    unique: true,
	},
	password: {
		type: Schema.Types.String,
		required: true,
	},
});

autoIncrement.initialize(mongoose.connection);

PlayerSchema.plugin(autoIncrement.plugin, {
	model: 'Player',
	field: 'playerId',
	startAt: 10000,
	incrementBy: 1,
});

const Player = mongoose.model('Player', PlayerSchema);

export default Player;
