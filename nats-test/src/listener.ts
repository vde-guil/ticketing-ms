import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
	url: 'http://localhost:4222',
});



stan.on('connect', () => {
	console.log('connected');

	// listener on close event sent by process on, further down
	// to gracefully shutdown the client
	stan.on('close', () => {
		console.log('nats connection close');
		process.exit();
	});

	new TicketCreatedListener(stan).listen();
});

// event listening on signal interruption or termination
// we try to close the client so that he can tell the server
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());