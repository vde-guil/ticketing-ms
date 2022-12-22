import { ExpirationCompleteEvent } from '@vdeguiltickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order, OrderStatus } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';

const setup = async () => {
	// new expiration listener instance

	const listener = new ExpirationCompleteListener(natsWrapper.client);

	// order to be cancelled
	const ticketId = new mongoose.Types.ObjectId().toHexString();

	const ticket = Ticket.build({
		id: ticketId,
		price: 99,
		title: 'concert',
	});

	await ticket.save();

	const order = Order.build({
		userId: 'fsdafasdf',
		expiresAt: new Date(),
		status: OrderStatus.AwaitingPayment,
		ticket,
	});

	await order.save();

	// create data object
	const data: ExpirationCompleteEvent['data'] = {
		orderId: order.id,
	};
	// create message object
	//@ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg, ticket, order };
};

it('update the orderStatus of the order to Cancelled when expiration event is received', async () => {
	const { listener, data, msg } = await setup();

	await listener.onMessage(data, msg);

	const updatedOrder = await Order.findById(data.orderId);

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});


it('emits an OrderCancelled event and send the correct data in the event', async () => {
  const { listener, data, msg } = await setup();
  
	await listener.onMessage(data, msg);
	expect(natsWrapper.client.publish).toHaveBeenCalled();
  
  const publishedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(publishedData.id).toEqual(data.orderId);

});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});