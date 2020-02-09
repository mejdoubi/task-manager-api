const request = require('supertest');
const _ = require('lodash');
const app = require('../src/app');
const Task = require('../src/models/task');
const {
	userOne,
	userTwo,
	taskOne,
	taskTwo,
	populateDB
} = require('./fixtures/db');

beforeEach(populateDB);

test('Should create task for user', async () => {
	const response = await request(app)
		.post('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({ description: 'From my test' })
		.expect(201);

	const task = await Task.findById(response.body._id);
	expect(task).not.toBeNull();
	expect(task.completed).toBe(false);
});

test('Should not create task with invalid description', async () => {
	await request(app)
		.post('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({ description: null })
		.expect(400);
});

test('Should fetch all tasks', async () => {
	const response = await request(app)
		.get('/tasks')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	expect(response.body.length).toBe(2);
});

test('Should fetch user task by id', async () => {
	const response = await request(app)
		.get(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	expect(response.body.description).toBe(taskOne.description);
});

test('Should not fetch user task by id if unauthenticated', async () => {
	await request(app)
		.get(`/tasks/${taskOne._id}`)
		.send()
		.expect(401);
});

test('Should not fetch other users task by id', async () => {
	await request(app)
		.get(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
		.send()
		.expect(404);
});

test('Should fetch only completed tasks', async () => {
	const response = await request(app)
		.get('/tasks?completed=true')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	response.body.forEach(task => expect(task.completed).toBe(true));
});

test('Should fetch only incompleted tasks', async () => {
	const response = await request(app)
		.get('/tasks?completed=false')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	response.body.forEach(task => expect(task.completed).toBe(false));
});

test('Should sort tasks by description', async () => {
	const response = await request(app)
		.get('/tasks?sortBy=description:asc')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	const sortedTasks = _.sortBy(response.body, 'description');

	expect(response.body).toStrictEqual(sortedTasks);
});

test('Should sort tasks by completed', async () => {
	const response = await request(app)
		.get('/tasks?sortBy=completed:asc')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	const sortedTasks = _.sortBy(response.body, 'completed');

	expect(response.body).toStrictEqual(sortedTasks);
});

test('Should sort tasks by createdAt', async () => {
	const response = await request(app)
		.get('/tasks?sortBy=createdAt:asc')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	const sortedTasks = _.sortBy(response.body, 'createdAt');

	expect(response.body).toStrictEqual(sortedTasks);
});

test('Should sort tasks by updatedAt', async () => {
	const response = await request(app)
		.get('/tasks?sortBy=updatedAt:asc')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	const sortedTasks = _.sortBy(response.body, 'updatedAt');

	expect(response.body).toStrictEqual(sortedTasks);
});

test('Should fetch page of tasks', async () => {
	const response = await request(app)
		.get('/tasks?limit=1&skip=1')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	expect(response.body[0].description).toBe(taskTwo.description);
});

test('Should update task', async () => {
	await request(app)
		.patch(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({ completed: true })
		.expect(200);
});

test('Should not update task with invalid description', async () => {
	await request(app)
		.patch(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({ description: null })
		.expect(400);
});

test('Should not update a task of another user', async () => {
	await request(app)
		.patch(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
		.send()
		.expect(404);

	const task = await Task.findById(taskOne._id);
	expect(task).not.toBeNull();
});

test('Should not delete task if unauthenticated', async () => {
	await request(app)
		.delete(`/tasks/${taskTwo._id}`)
		.send()
		.expect(401);
});

test('Should delete user task', async () => {
	await request(app)
		.delete(`/tasks/${taskTwo._id}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	const task = await Task.findById(taskTwo._id);
	expect(task).toBeNull();
});

test('Should not delete a task of another user', async () => {
	await request(app)
		.delete(`/tasks/${taskOne._id}`)
		.set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
		.send()
		.expect(404);

	const task = await Task.findById(taskOne._id);
	expect(task).not.toBeNull();
});
