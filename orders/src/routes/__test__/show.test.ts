import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { buildTicket } from '../../test/setup';

it('get a 404/not found if the orderId is wrong', async () => {
	// create a ticket
	const ticket = await buildTicket(25, 'my ticket');

	// make request to build an order with ticket
	const user = global.signin();

	await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	// generate a fake objectid

	const fakeId = new mongoose.Types.ObjectId();
	// make request to fetch order
	const { body: fetchedOrder } = await request(app)
		.get(`/api/orders/${fakeId}`)
		.set('Cookie', user)
		.expect(404);
});

it("get a 401/ not authorized if we try to get an order that doesn't belong to us", async () => {
	// create a ticket
	const ticket = await buildTicket(25, 'my ticket');

	// make request to build an order with ticket
	const user = global.signin();

	const { body: createdOrder } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	// make request to fetch order with other user
	await request(app)
		.get(`/api/orders/${createdOrder.id}`)
		.set('Cookie', global.signin())
		.expect(401);
});

it('fetches the order', async () => {
	// create a ticket
	const ticket = await buildTicket(25, 'my ticket');

	// make request to build an order with ticket
	const user = global.signin();

	const { body: createdOrder } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	// make request to fetch order
	const { body: fetchedOrder } = await request(app)
		.get(`/api/orders/${createdOrder.id}`)
		.set('Cookie', user)
		.expect(200);

	expect(fetchedOrder.id).toEqual(createdOrder.id);
	expect(fetchedOrder.ticket.id).toEqual(createdOrder.ticket.id);
});
