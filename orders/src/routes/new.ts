import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { body } from 'express-validator';

import { Order } from '../models/order';
import { Ticket } from '../models/ticket';

import {
	validateRequest,
	requireAuth,
	NotFoundError,
	OrderStatus,
	BadRequestError,
} from '@vdeguiltickets/common';

import { natsWrapper } from '../nats-wrapper';

import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();

// 15 minutes
const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
	'/api/orders',
	requireAuth,
	[
		body('ticketId')
			.not()
			.isEmpty()
			.custom((input: string) => {
				return mongoose.Types.ObjectId.isValid(input);
			})
			.withMessage('ticketId must be provided'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body;
		// Find the ticket the user is trying to order in the database

		const ticket = await Ticket.findById(ticketId);

		if (!ticket) {
			throw new NotFoundError();
		}
		// Make sure that this ticket is not already reserved
		// run query to look at all roders. Find an order where the ticket is the ticket we just found
		// and the order status is not cancelled

		const isReserved = await ticket.isReserved()

		// if we find something: the ticket *is* reserved
		if (isReserved) {
			throw new BadRequestError('Ticket is already reserved');
		}

		// Calculate an expiration date for this order

		const expiration = new Date();
		expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

		// Build the order and save it to the database

		const order = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			expiresAt: expiration,
			ticket,
		})

		await order.save();
		
		// publish an event saying that an order was created

		new OrderCreatedPublisher(natsWrapper.client).publish({
			id: order.id,
			status: order.status,
			userId: order.userId,
			expiresAt: order.expiresAt.toISOString(),
			version: order.version,
			ticket: {
				price: order.ticket.price,
				id: order.ticket.id,
			}

		})

		res.status(201).send(order);
	},
);

export { router as createOrderRouter };
