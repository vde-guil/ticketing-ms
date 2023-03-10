import express, { Request, Response } from 'express';
import { requireAuth, validateRequest } from '@vdeguiltickets/common';
import { body } from 'express-validator';
import { Ticket } from '../model/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
	'/api/tickets',
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

		const newTicket = Ticket.build({title, price, userId: req.currentUser.id})
		await newTicket.save();

		await new TicketCreatedPublisher(natsWrapper.client).publish({
			id: newTicket.id,
			title: newTicket.title,
			price: newTicket.price,
			userId: newTicket.userId,
			version: newTicket.version
		});

		res.status(201).send(newTicket);
	},
);

export { router as createTicketRouter };
