import { OrderStatus, OrderCancelledEvent } from "@vdeguiltickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId =  new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: orderId,
    price: 99,
    status: OrderStatus.Created,
    userId: 'dafsdf',
    version: 0,
  })

  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 1,
    ticket: {
      id: 'fsdafsd'
    }
  }
// @ts-ignore
  const msg:Message = {
    ack: jest.fn()
  }

  return {listener, order, data, msg}
}

it("updates the status of the order to Cancelled", async () => {
  const {listener, order, data, msg} = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(data.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

})

it("acks the message", async () => {
  const {listener, order, data, msg} = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();

})