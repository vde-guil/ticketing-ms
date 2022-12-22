import {Publisher, Subjects, TicketCreatedEvent} from '@vdeguiltickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}