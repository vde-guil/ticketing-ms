export const natsWrapper = {
	client: {
		publish: jest
			.fn()
			.mockImplementation(
				(subjet: string, data: string, callback: () => void) => {
					callback();
				},
			),
	},
};
