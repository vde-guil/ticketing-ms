import mongoose, { Types } from 'mongoose';
import { Password } from '../services/password';

// interface that describes the properties
///that are required to create a new User

interface UserAttrs {
	email: string;
	password: string;
}

// An interface that describes the properties
// that a User Model has

interface UserModel extends mongoose.Model<UserDoc> {
	build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a User Document has

interface UserDoc extends mongoose.Document {
	email: string;
	password: string;
}

const userSchema = new mongoose.Schema<UserAttrs, UserModel>(
	{
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
				delete ret.password;
				delete ret.__v;
			},
		},
	},
);

// using function keyword because of this context (to keep it being )
// the Document we're about ot save
userSchema.pre('save', async function (done) {
	if (this.isModified('password')) {
		const hashedPassword = await Password.toHash(this.password);

		this.set('password', hashedPassword);
	}
	done();
});

userSchema.static('build', function (attrs: UserAttrs) {
	return new User(attrs);
});

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
