import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/useRequest';

const Signup = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const { errors, doRequest } = useRequest({
		url: '/api/users/signup',
		method: 'post',
		body: { email, password },
		onSuccess: () => Router.push('/'),
	});

	const onSubmit = async (event) => {
		event.preventDefault();
		doRequest();
	};

	return (
		<form onSubmit={onSubmit}>
			<h1>signup</h1>
			<div className='form-group'>
				<label htmlFor=''>Email Address</label>
				<input
					type='text'
					className='form-control'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</div>
			<div className='form-group'>
				<label htmlFor=''>Password</label>
				<input
					type='password'
					className='form-control'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			{errors}
			<button className='btn btn-primary'>Sign Up</button>
		</form>
	);
};

export default Signup;
