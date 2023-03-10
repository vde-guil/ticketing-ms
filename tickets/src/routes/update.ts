import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import {
	NotFoundError,
	requireAuth,
	NotAuthorizedError,
	validateRequest,
	BadRequestError,
} from '@vdeguiltickets/common';

import { Ticket } from '../model/ticket';

import { natsWrapper } from '../nats-wrapper';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';

const router = express.Router();

router.put(
	'/api/tickets/:id',
	requireAuth,
  [
    body('title')
    .not()
    .isEmpty()
    .withMessage('Title is required'),
  body('price')
    .isFloat({ gt: 0})
    .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
	async (req: Request, res: Response) => {
    const {title, price} = req.body;

		let ticket = await Ticket.findById(req.params.id);
		if (!ticket) {
			throw new NotFoundError();
		}

		if (ticket.orderId) {
			throw new BadRequestError('Cannot edit a reserved ticket');
		}

    if (ticket.userId !== req.currentUser.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({... req.body})

    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version
		});

		res.send(ticket);
	},
);

export { router as updateTicketRouter };
