import express from 'express';
import 'express-async-errors';

// Routes
import { createOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { showAllOrdersRouter } from './routes';
import { deleteOrdersRouter } from './routes/delete';

// MiddleWares
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError, currentUser } from '@vdeguiltickets/common';


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
app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(showAllOrdersRouter);
app.use(deleteOrdersRouter);

// DEFAULT ROUTES error
app.all('*', async () => {
	throw new NotFoundError();
});


app.use(errorHandler);

export { app }