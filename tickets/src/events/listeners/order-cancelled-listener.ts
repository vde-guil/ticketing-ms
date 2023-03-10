import { Listener, OrderCancelledEvent, Subjects } from "@vdeguiltickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../model/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'] , msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket)
      throw new Error('Ticket not found');

    ticket.orderId = undefined;
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id:ticket.id,
      price: ticket.price,
      userId: ticket.userId,
      title: ticket.title,
      version: ticket.version,
    })

    msg.ack();
  }
}