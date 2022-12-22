import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../model/ticket';

// should be mocked
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for post request', async () => {
	const response = await request(app).post('/api/tickets').send({});

	expect(response.status).not.toBe(404);
});

it('can only be accessed if the user is signed in', async () => {
	await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns a status other than 401 if user is signed in', async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({});

	expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: '',
			price: 10,
		})
		.expect(400);

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			price: 10,
		})
		.expect(400);
});

it('returns an error if an invalid price is provided', async () => {
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: 'ticket name',
			price: -10,
		})
		.expect(400);

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: 'ticket name',
		})
		.expect(400);
});

it('creates a ticket with valid input', async () => {
	let tickets = await Ticket.find({});
	expect(tickets.length).toEqual(0);

	const title = 'fsdfsadfasdf';
	const price = 20;

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title,
			price,
		})
		.expect(201);

	tickets = await Ticket.find({});
	expect(tickets.length).toEqual(1);
	expect(tickets[0].title).toEqual(title);
	expect(tickets[0].price).toEqual(price);
});

it('publishes an event', async () => {
	const title = 'fsdfsadfasdf';
	const price = 20;

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title,
			price,
		})
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
