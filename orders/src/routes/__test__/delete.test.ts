import request from 'supertest';
import { app } from '../../app';
import { buildTicket } from '../../test/setup';
import { OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it.todo('get error 401 if not logged in');
it.todo("get error 401 if order doesn't belong to user");
it.todo('get error 404 if order not found');

it('changes the status of an order to cancelled', async () => {
	// create ticket
	const ticket = await buildTicket(10, 'ticket');
	// create order
	const user = global.signin();
	const { body: createdOrder } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	// delete the order
	await request(app)
		.delete(`/api/orders/${createdOrder.id}`)
		.set('Cookie', user)
		.expect(200);

	const { body: deletedOrder } = await request(app)
		.get(`/api/orders/${createdOrder.id}`)
		.set('Cookie', user)
		.expect(200);

	// check if status correctly updated
	expect(deletedOrder.status).toEqual(OrderStatus.Cancelled);
});

it('emits a order cancelled event', async () => {
	// create ticket
	const ticket = await buildTicket(10, 'ticket');
	// create order
	const user = global.signin();
	const { body: createdOrder } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	// delete the order
	await request(app)
		.delete(`/api/orders/${createdOrder.id}`)
		.set('Cookie', user)
		.expect(200);

	await request(app)
		.get(`/api/orders/${createdOrder.id}`)
		.set('Cookie', user)
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});
