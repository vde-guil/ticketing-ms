import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
	// Create instance of ticket

	const ticket = Ticket.build({
		title: 'ticket1',
		price: 4,
		userId: '123',
	});

	// Save ticket to database
	await ticket.save();

	// Fetch it twice
	const firstInstance = await Ticket.findById(ticket.id);
	const secondInstance = await Ticket.findById(ticket.id);
	// make 2 separate changes we fetched
	firstInstance!.set({ price: 10 });
	secondInstance!.set({ price: 15 });

	// save the first fetched ticket
	await firstInstance!.save();

	// save the second fetched ticket (out of date vesrion number hsould expect an error)
	try {
		await secondInstance!.save();
	} catch (err) {
		return;
	}
	throw new Error('should not reach this point');
});

it('version number is incremented on multiple saves', async () => {
	// Create instance of ticket

	const ticket = Ticket.build({
		title: 'concert',
		price: 4,
		userId: '123',
	});

	// Save ticket to database
	await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
