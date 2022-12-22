export const MOCK_STRIPE_ID = 'abcd'

export const stripe = {
	charges: {
		create: jest.fn().mockResolvedValue({id: MOCK_STRIPE_ID}),
	},
};
