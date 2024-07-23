const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const actorSchema = new Schema({
	name: String,
	lastName: String,
	country: String,
	birthday: String,
});

const Actor = mongoose.model('actors', actorSchema);

module.exports = Actor;
