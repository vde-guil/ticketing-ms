import { ExpirationCompleteEvent, Publisher, Subjects } from "@vdeguiltickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}