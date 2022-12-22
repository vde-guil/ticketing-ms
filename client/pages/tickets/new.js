import Router from 'next/router';
import { useState } from 'react';
import useRequest from '../../hooks/useRequest';

const NewTicket = () => {
	const [title, setTitle] = useState('');
	const [price, setPrice] = useState('');

  const {doRequest, errors} = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {title, price},
    onSuccess: (data) => Router.push('/'),
  })

  const onSubmit = async (e) => {
    e.preventDefault();

    doRequest();
  }

	const onBlur = (e) => {
		const value = parseFloat(price);

		if (isNaN(value)) {
      return
    }

    setPrice(value.toFixed(2));
	};

	return (
		<div>
			<h1>Create a ticket</h1>
			<form onSubmit={onSubmit}>
				<div className='form-group mt-2'>
					<label htmlFor=''>Title</label>
					<input
						className='form-control'
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</div>
				<div className='form-group mt-2'>
					<label htmlFor=''>Price</label>
					<input
						className='form-control'
						onBlur={onBlur}
						value={price}
						onChange={(e) => setPrice(e.target.value)}
					/>
				</div>
        {errors}
				<button className='btn btn-primary mt-2'>Submit</button>
			</form>
		</div>
	);
};

export default NewTicket;
