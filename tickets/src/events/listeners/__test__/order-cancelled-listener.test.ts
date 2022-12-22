import { OrderCancelledEvent } from '@vdeguiltickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../model/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
	// create a new cancelled listener instance
	const listener = new OrderCancelledListener(natsWrapper.client);

	// create a ticket

	const ticket = Ticket.build({
		price: 99,
		title: 'myTicket',
		userId: 'fsfa',
	});

	ticket.set({ orderId: new mongoose.Types.ObjectId().toHexString() });

	await ticket.save();

	const data: OrderCancelledEvent['data'] = {
		id: ticket.orderId!,
		version: 1,
		ticket: {
			id: ticket.id,
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { ticket, msg, data, listener };
};

it('unsets orderId on order cancellation on the ticket', async () => {
	const { msg, data, listener } = await setup();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(data.ticket.id);

	expect(updatedTicket!.orderId).toBeUndefined();
});

it('acks the event after successful cancellation', async () => {
	const { msg, data, listener } = await setup();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket:updated event on success', async () => {
  const { msg, data, listener } = await setup();

	await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  expect((natsWrapper.client.publish as jest.Mock).mock.calls[0][0]).toEqual('ticket:updated')
})