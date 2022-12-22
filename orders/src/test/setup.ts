import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import jwt from 'jsonwebtoken';
import { Ticket } from '../models/ticket';

let mongo: any;

jest.mock('../nats-wrapper');


beforeAll(async () => {
	process.env.JWT_KEY = 'asdfasdf';
	mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();

	await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
	jest.clearAllMocks();
	const collections = await mongoose.connection.db.collections();

	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	await mongo.stop();
	await mongoose.connection.close();
});

declare global {
	var signin: () => string[];
}

global.signin = () => {
	const payload = {
		id: new mongoose.Types.ObjectId(),
		email: 'test@test.com'
	};

	const token = jwt.sign(payload, process.env.JWT_KEY!);
	const session = { jwt: token };
	const sessionJSON = JSON.stringify(session);

	const base64 = Buffer.from(sessionJSON).toString('base64');
	return [`session=${base64}`];
};

export const buildTicket = async (price: number, title: string) => {
  const ticket =  Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		price,
		title,
	});
  await ticket.save();
  return ticket
}