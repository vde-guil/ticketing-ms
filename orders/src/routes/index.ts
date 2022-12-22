import express, { Request, Response } from 'express';
import { requireAuth, OrderStatus } from '@vdeguiltickets/common';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
	const orders = await Order.find({
		userId: req.currentUser.id,
	}).populate('ticket');

	res.send(orders);
});

export { router as showAllOrdersRouter };
