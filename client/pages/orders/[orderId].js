
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/useRequest';

const OrderShow = ({ order, currentUser }) => {
	const [timeLeft, setTimeLeft] = useState(0);
	const intervalRef = useRef(null);

  const router = useRouter();
	useEffect(() => {
		const findTimeLeft = () => {
			const remainingSecs = new Date(order.expiresAt) - new Date();
			setTimeLeft(Math.round(remainingSecs / 1000));
		};

		findTimeLeft();
		intervalRef.current = setInterval(findTimeLeft, 1000);

		return () => {
			intervalRef.current && clearInterval(intervalRef.current);
		};
	}, []);

  const {doRequest, errors} = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => router.push('/orders')
  });

	if (timeLeft < 0) {
		clearInterval(intervalRef.current);
		return <div>Order expired</div>;
	}

  return (
		<div>
			<h1>Purchasing {order.ticket.title}</h1>
			<p>Time left to pay: {timeLeft} seconds</p>
			<StripeCheckout
				token={({id}) => doRequest({token: id})}
				stripeKey='pk_test_51MGmhkAaZ2iYe7wmEuyH3EDhHPvMczcBcjO0oJGrHerzEwKWtxYYzuwJpP52GupGcMv1ETOjBjCJuiLXUje9lTot00FDrnh8NM'
        amount={order.ticket.price * 100}
        email={currentUser.email}
			/>
      {errors}
		</div>
	);
};

OrderShow.getInitialProps = async (context, client) => {
	console.log(context);
	const { orderId } = context.query;

	let order = null;

	try {
		const { data } = await client.get(`/api/orders/${orderId}`);
		order = data;
	} catch (e) {
		console.log(e.msg);
	}
	return { order };
};

export default OrderShow;
