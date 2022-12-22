import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';

import { app } from './app';

import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

const startUp = async () => {
	console.log("Starting ...")
	if (!process.env.JWT_KEY) throw new Error('JWT_KEY must be defined');

	if (!process.env.MONGO_URI) throw new Error('MONGO_URI should be defined');

	if (!process.env.NATS_URL) throw new Error('NATS_URL should be defined');
	
	if (!process.env.NATS_CLIENT_ID)
		throw new Error('NATS_CLIENT_ID should be defined');

	if (!process.env.NATS_CLUSTER_ID)
		throw new Error('NATS_CLUSTER_ID should be defined');

	try {
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID,
			process.env.NATS_CLIENT_ID,
			process.env.NATS_URL,
		);

			new TicketCreatedListener(natsWrapper.client).listen();
			new TicketUpdatedListener(natsWrapper.client).listen();
			new ExpirationCompleteListener(natsWrapper.client).listen();
			new PaymentCreatedListener(natsWrapper.client).listen();

		natsWrapper.client.on('close', () => {
			console.log('Nats connection closed!');
			process.exit();
		});

		process.on('SIGINT', () => natsWrapper.client.close());
		process.on('SIGTERM', () => natsWrapper.client.close());

		await mongoose.connect(process.env.MONGO_URI);
		console.log('connected to mongoDb');
	} catch (err) {
		console.error(err);
	}

	app.listen(3000, () => {
		console.log('listening on port 3000');
	});
};

startUp();
