import express from 'express';
import 'express-async-errors';

// Routes
import { createChargeRouter } from './route/new';

// MiddleWares
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError, currentUser } from '@vdeguiltickets/common';


const app = express();

app.set('trust proxy', true);

// APPLYING MIDDLEWARES

app.use(express.json());
app.use(cookieSession({
	signed: false,
	secure: false, //process.env.NODE_ENV !== 'test',
}))

// decrypt auth token middleware
app.use(currentUser);


// APPLYING ROUTES
app.use(createChargeRouter);

// DEFAULT ROUTES error
app.all('*', async () => {
	throw new NotFoundError();
});


app.use(errorHandler);

export { app }
