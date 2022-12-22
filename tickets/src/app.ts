import express from 'express';
import 'express-async-errors';

// Routes
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { showAllTicketsRouter } from './routes';

// MiddleWares
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError, currentUser } from '@vdeguiltickets/common';
import { updateTicketRouter } from './routes/update';


const app = express();

app.set('trust proxy', true);

// APPLYING MIDDLEWARES

app.use(express.json());
app.use(cookieSession({
	signed: false,
	secure: process.env.NODE_ENV !== 'test',
}))

app.use(currentUser);


// APPLYING ROUTES
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(showAllTicketsRouter);
app.use(updateTicketRouter);

// DEFAULT ROUTES error
app.all('*', async () => {
	throw new NotFoundError();
});


app.use(errorHandler);

export { app }