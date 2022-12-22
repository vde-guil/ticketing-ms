import { Subjects } from '@vdeguiltickets/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../model/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('return a 404 if the ticket id does not exist', async () => {
	const id = new mongoose.Types.ObjectId();
	await request(app)
		.put(`/api/tickets/${id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'ticket title',
			price: 20,
		})
		.expect(404);
});

it('returns a 401/not authenticated error if we are not logged in', async () => {
	const id = new mongoose.Types.ObjectId();
	await request(app)
		.put(`/api/tickets/${id}`)
		.send({
			title: 'ticket title',
			price: 20,
		})
		.expect(401);
});

it('return a 401/not authorized if the ticket does not belong to then logged in user', async () => {
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: 'ticket title',
			price: 20,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'new title',
			price: 25,
		})
		.expect(401);

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send()
		.expect(200);

	expect(ticketResponse.body.title).toEqual('ticket title');
	expect(ticketResponse.body.price).toEqual(20);
});

it('return a 400/bad request if user provides invalid title or price', async () => {
	const cookie = global.signin();

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'ticket title',
			price: 20,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: '',
			price: 25,
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'new title',
			price: -25,
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			price: 25,
		})
		.expect(400);
});

it('it updates a ticket provided valid title/price', async () => {
	const cookie = global.signin();

	const updatedTitle = 'new title';
	const updatedPrice = 44;

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'ticket title',
			price: 20,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: updatedTitle,
			price: updatedPrice,
		})
		.expect(200);

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send()
		.expect(200);

	expect(ticketResponse.body.title).toEqual(updatedTitle);
	expect(ticketResponse.body.price).toEqual(updatedPrice);
});

it('publishes an event', async () => {
	const cookie = global.signin();

	const updatedTitle = 'new title';
	const updatedPrice = 44;

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'ticket title',
			price: 20,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: updatedTitle,
			price: updatedPrice,
		})
		.expect(200);

		expect(natsWrapper.client.publish).toHaveBeenLastCalledWith(Subjects.TicketUpdated, expect.anything(), expect.anything());
});

it('rejects updates if the ticket is reserved', async () => {
	const cookie = global.signin();

	const updatedTitle = 'new title';
	const updatedPrice = 44;

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'ticket title',
			price: 20,
		})
		.expect(201);

		const ticket = await Ticket.findById(response.body.id);
		if (!ticket)
			throw new Error()

		ticket.orderId = new mongoose.Types.ObjectId().toHexString();
		await ticket.save();

		await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: updatedTitle,
			price: updatedPrice,
		})
		.expect(400);

	})