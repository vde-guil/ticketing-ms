import { OrderCreatedEvent, OrderStatus } from '@vdeguiltickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../model/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
	// create an instance of a listener

	const listener = new OrderCreatedListener(natsWrapper.client);

	// create a ticket
	const ticket = Ticket.build({
		price: 99.99,
		title: 'My concert',
		userId: new mongoose.Types.ObjectId().toHexString(),
	});

	await ticket.save();

	// create data object  with fake orderId

	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		expiresAt: new Date().toISOString(),
		status: OrderStatus.Created,
		userId: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		ticket: {
			id: ticket.id,
			price: ticket.price,
		},
	};

	//create message object with fake ack
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};
	// return everything

	return { ticket, msg, listener, data };
};

it('update successfully the ticket with order id when the ticket gets ordered', async () => {
	const { msg, listener, data } = await setup();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(data.ticket.id);
	expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the events successfully when the ticket get updated', async () => {
	const { msg, listener, data } = await setup();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
	const { msg, listener, data } = await setup();
	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();

	// how to access mock function parameters
	expect((natsWrapper.client.publish as jest.Mock).mock.calls[0][0]).toEqual(
		'ticket:updated',
	);

	const ticketUpdatedData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
	);
	expect(data.id).toEqual(ticketUpdatedData.orderId);
});
