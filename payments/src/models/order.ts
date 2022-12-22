import { OrderStatus } from '@vdeguiltickets/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttrs {
	id: string;
	version: number;
	userId: string;
	price: number;
	status: OrderStatus;
}

interface OrderDoc extends mongoose.Document {
	version: number;
	userId: string;
	price: number;
	status: OrderStatus;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
	build(attrs: OrderAttrs): OrderDoc;
	findByEvent(event: {
		id: string;
		version: number;
	}): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: Object.values(OrderStatus),
		},
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
			},
		},
	},
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
	const { id, ...rest } = attrs;
	return new Order({
		_id: id,
		...rest,
	});
};

orderSchema.statics.findByEvent = (event: { id: string; version: number }) => {
	return Order.findOne({
		_id: event.id,
		version: event.version - 1,
	});
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
