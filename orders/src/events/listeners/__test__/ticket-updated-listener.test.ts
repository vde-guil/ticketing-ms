import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@vdeguiltickets/common';

import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { Ticket } from '../../../models/ticket';
import { buildTicket } from '../../../test/setup';

const setup = async () => {
	// create a listener
	const listener = new TicketUpdatedListener(natsWrapper.client);

	// create and save a ticket into collection
	const ticket = await buildTicket(78, 'Concert');
	// create a fake data object
	const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    price: 100,
    title: 'updated title',
    userId: new mongoose.Types.ObjectId().toHexString()
  };
	//create a fake msg object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

	//return all
  return {listener, data, msg}
};
it('it finds, updates and saves a ticket', async () => {
  const {listener, data, msg} = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(data.id);

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const {listener, data, msg} = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async() => {
  const {listener, data, msg} = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);

  } catch (error) {
  }
  
  expect(msg.ack).not.toHaveBeenCalled();
})