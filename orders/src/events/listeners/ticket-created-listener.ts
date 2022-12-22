import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketCreatedEvent } from '@vdeguiltickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-groups-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
	readonly queueGroupName = queueGroupName;

	async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
		const { id, title, price } = data;

		const ticket = Ticket.build({ title, price, id });
		await ticket.save();

		msg.ack();
	}
}
