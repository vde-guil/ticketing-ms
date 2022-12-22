import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from "@vdeguiltickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-groups-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order)
      throw new Error('Order not found')

    order.set({status: OrderStatus.Complete})


    await order.save();
    
    msg.ack();
  };
}