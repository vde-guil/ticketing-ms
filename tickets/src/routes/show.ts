import { NotFoundError } from '@vdeguiltickets/common';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Ticket } from '../model/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
	const { id } = req.params;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new NotFoundError();
    }
    return res.status(200).send(ticket);

});

export { router as showTicketRouter };
