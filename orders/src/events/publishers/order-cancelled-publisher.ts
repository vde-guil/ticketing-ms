import { Publisher, Subjects, OrderCancelledEvent } from "@vdeguiltickets/common";


export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}