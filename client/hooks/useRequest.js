import { useState } from 'react';
import axios from 'axios';

const useRequest = ({ url, method, body, onSuccess }) => {
	const [errors, setErrors] = useState(null);

	const doRequest = async (props = {}) => {
		try {
			setErrors(null);

			const response = await axios[method](url, { ...body, ...props });
			if (onSuccess) {
				console.log('calling on success');
				onSuccess(response.data);
			}
		} catch (error) {
			console.log(error);
			setErrors(
				<div className='alert alert-danger'>
					<h4>Something went wrong</h4>
					<ul className='my-0'>
						{error?.response?.data?.errors.map((error) => {
							return <li key={error.message}>{error.message}</li>;
						})}
					</ul>
				</div>,
			);
		}
	};

	return { doRequest, errors };
};

export default useRequest;
