import { OrderStatus } from '@vdeguiltickets/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';
import { MOCK_STRIPE_ID } from '../../__mocks__/stripe';

jest.mock('../../stripe');


it('throws not found error 404 when order does not exist', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			orderId: new mongoose.Types.ObjectId().toHexString(),
			token: 'dfjsdkfjsd',
		})
		.expect(404);
});

it('throws unauthorized error 401 if we try to purchase order that doesnt belong to user', async () => {
	const idUser1 = new mongoose.Types.ObjectId().toHexString();

	const orderUser1 = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		price: 99,
		status: OrderStatus.Created,
		userId: idUser1,
		version: 0,
	});

	await orderUser1.save();

	const user2 = global.signin();
	await request(app)
		.post('/api/payments')
		.set('Cookie', user2)
		.send({
			orderId: orderUser1.id,
			token: 'dfjsdkfjsd',
		})
		.expect(401);
});

it('return 400 error when purchasing a cancelled order', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();

	const user = global.signin(userId);

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		price: 99,
		status: OrderStatus.Cancelled,
		userId: userId,
		version: 0,
	});

	await order.save();
	await request(app)
		.post('/api/payments')
		.set('Cookie', user)
		.send({
			orderId: order.id,
			token: 'dfjsdkfjsd',
		})
		.expect(400);
});

it('returns a 201 with valid inputs and creat a valid ', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();

	const user = global.signin(userId);

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		price: 25,
		status: OrderStatus.Created,
		userId: userId,
		version: 0,
	});

	await order.save();
	await request(app)
		.post('/api/payments')
		.set('Cookie', user)
		.send({
			orderId: order.id,
			token: 'tok_visa',
		})
		.expect(201);

		const chargesOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
		const chargeResult = await (stripe.charges.create as jest.Mock).mock.results[0].value
		expect(stripe.charges.create).toHaveBeenCalled()
		expect(chargesOptions.source).toEqual('tok_visa');
		expect(chargesOptions.amount).toEqual(order.price * 100);
		expect(chargesOptions.currency).toEqual('eur');

		const payment = await Payment.findOne({
			orderId: order.id,
			// stripeId from mock is predefined
			stripeId: MOCK_STRIPE_ID
		})
		expect(payment).not.toBeNull();
		expect(chargeResult.id).toEqual(payment!.stripeId)

})

