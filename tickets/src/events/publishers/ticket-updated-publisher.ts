import {Publisher, Subjects, TicketUpdatedEvent} from '@vdeguiltickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}