import { Publisher, Subjects, OrderCreatedEvent } from "@vdeguiltickets/common";


export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}