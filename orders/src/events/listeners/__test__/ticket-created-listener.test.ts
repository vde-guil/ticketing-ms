import { TicketCreatedEvent } from '@vdeguiltickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';

const setup = async () => {
	// create an instance of the listener
	const listener = new TicketCreatedListener(natsWrapper.client);

	// create a fake data event

	const ticketId = new mongoose.Types.ObjectId().toHexString();
	const userId = new mongoose.Types.ObjectId().toHexString();

	const data: TicketCreatedEvent['data'] = {
		id: ticketId,
		price: 99,
		title: 'Concert',
		userId,
		version: 0,
	};

	// create a fake Message object
	
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {listener, data, msg}
};

it('creates and saves a ticket', async () => {
	//setup the test
  const {listener, data, msg} = await setup();
	// call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)
	// write assertions to make sure a ticket was created

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);

});

it('acks the message', async () => {
  const {listener, data, msg} = await setup();

	// call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)
	// write assertion to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
