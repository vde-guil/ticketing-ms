import { PaymentCreatedEvent, Publisher, Subjects } from "@vdeguiltickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}