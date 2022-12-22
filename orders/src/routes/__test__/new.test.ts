import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';

import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import { buildTicket } from '../../test/setup';

// ADD test for bad request body or not authenticated etc...

it('returns an error if the ticket does not exists', async () => {
	const ticketId = new mongoose.Types.ObjectId();

	const res = await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId })
		.expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
	// make sure some tickets are into the db

	const ticket = await buildTicket(20, 'concert');

	const order = Order.build({
		userId: 'lfksadjgsdh',
		status: OrderStatus.Created,
		expiresAt: new Date(),
		ticket,
	});

	await order.save();

	const res = await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(400);
});

it('reserve a ticket', async () => {
	// make sure some tickets are into the db
	
	const ticket = await buildTicket(20, 'concert');

	const res = await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(201);

	// create expects to make sure we get a reponse with correct params
});

it('emits an order created event', async () => {
	// make sure some tickets are into the db
	
	const ticket = await buildTicket(20, 'concert');

	const res = await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
