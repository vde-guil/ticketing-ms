import { OrderCreatedListener } from './events/listeners/order-created-listener.';
import { natsWrapper } from './nats-wrapper';


const startUp = async () => {
	console.log('starting up expiration...')
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

		natsWrapper.client.on('close', () => {
			console.log('Nats connection closed!');
			process.exit();
		});

		process.on('SIGINT', () => natsWrapper.client.close());
		process.on('SIGTERM', () => natsWrapper.client.close());

		new OrderCreatedListener(natsWrapper.client).listen();

	} catch (err) {
		console.error(err);
	}

	
};

startUp();
