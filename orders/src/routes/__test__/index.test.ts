import request from 'supertest';

import { app } from '../../app';

import { buildTicket } from '../../test/setup';

it('gets a 404 if trying to access a random route', async () => {
	await request(app).get('/api/orders/false/route').send().expect(404);
});

it('fetches orders for a particular user', async () => {
	// Create 3 tickets
	const ticket1 = await buildTicket(20, 'ticket 1');
	const ticket2 = await buildTicket(20, 'ticket 2');
	const ticket3 = await buildTicket(20, 'ticket 3');

	// Create 1 order as User #1
	const user1 = global.signin();
	await request(app)
		.post('/api/orders')
		.set('Cookie', user1)
		.send({ ticketId: ticket1.id })
		.expect(201);

	// Create 2 orders as User #2
	const user2 = global.signin();
	const { body: order1 } = await request(app)
		.post('/api/orders')
		.set('Cookie', user2)
		.send({ ticketId: ticket2.id })
		.expect(201);

	const { body: order2 } = await request(app)
		.post('/api/orders')
		.set('Cookie', user2)
		.send({ ticketId: ticket3.id })
		.expect(201);
	// request to fetch orders from user #2

	const response = await request(app)
		.get('/api/orders')
		.set('Cookie', user2)
		.send()
		.expect(200);

	// Make sure we only get orders from user #2
	expect(response.body.length).toEqual(2);
	expect(response.body[0].id).toEqual(order1.id);
	expect(response.body[1].id).toEqual(order2.id);
	expect(response.body[0].ticket.id).toEqual(order1.ticket.id);
	expect(response.body[1].ticket.id).toEqual(order2.ticket.id);
});
