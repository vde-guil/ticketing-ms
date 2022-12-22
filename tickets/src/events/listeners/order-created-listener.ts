import { Listener, OrderCreatedEvent, Subjects } from '@vdeguiltickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../model/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const orderId = data.id;
		const ticketId = data.ticket.id;

		const ticket = await Ticket.findById(ticketId);
    if (!ticket)
      throw new Error('Ticket not found');

    ticket.set({orderId});

    // should add transaction  in case publish fails to rollback the ticket save
    await ticket.save();
    
    await new TicketUpdatedPublisher(this.client).publish({
      id:ticket.id,
      price: ticket.price,
      userId: ticket.userId,
      title: ticket.title,
      version: ticket.version,
      orderId: ticket.orderId,
    })

    msg.ack();
  }
}
