const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneId = mongoose.Types.ObjectId();
const userOne = {
	_id: userOneId,
	name: 'Mohamed',
	email: 'mohamed@bousni.com',
	password: 'bousni123!',
	tokens: [
		{
			token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
		}
	]
};

const userTwoId = mongoose.Types.ObjectId();
const userTwo = {
	_id: userTwoId,
	name: 'Othman',
	email: 'othman@frksni.com',
	password: 'frksni666',
	tokens: [
		{
			token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
		}
	]
};

const taskOne = {
	_id: mongoose.Types.ObjectId(),
	description: 'First task',
	completed: false,
	owner: userOneId
};

const taskTwo = {
	_id: mongoose.Types.ObjectId(),
	description: 'Second task',
	completed: true,
	owner: userOneId
};

const taskThree = {
	_id: mongoose.Types.ObjectId(),
	description: 'Third task',
	completed: true,
	owner: userTwoId
};

const populateDB = async () => {
	await Task.deleteMany();
	await User.deleteMany();
	await new User(userOne).save();
	await new User(userTwo).save();
	await new Task(taskOne).save();
	await new Task(taskTwo).save();
	await new Task(taskThree).save();
};

module.exports = {
	userOneId,
	userOne,
	userTwoId,
	userTwo,
	taskOne,
	taskTwo,
	taskThree,
	populateDB
};
