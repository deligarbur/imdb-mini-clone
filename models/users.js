const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	user: String,
	password: String,
	name: String,
	email: String,
	plan_details: String,
});

const User = mongoose.model('users', userSchema);

module.exports = User;
