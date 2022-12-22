import { useRouter } from 'next/router'
import useRequest from "../../hooks/useRequest";

const TicketShow = ({ ticket }) => {
  const router = useRouter();

	if (!ticket) return <div>ticket not found</div>;

  const {doRequest, errors} = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id
    },
    onSuccess: (order) => router.push(`/orders/${order.id}`)
  })

	return (
		<div>
			<h1>{ticket.title}</h1>
			<h4>{ticket.price}&euro;</h4>
      {errors}
      <button onClick={() => doRequest()} className="btn btn-primary">Purchase</button>
		</div>
	);
};

TicketShow.getInitialProps = async (context, client) => {
	const { ticketId } = context.query;
	console.log(ticketId);
	let ticket = null;
	try {
		const { data } = await client.get(`/api/tickets/${ticketId}`);
		ticket = data;
	} catch (error) {
		console.log(error);
	}

	return { ticket: ticket };
};

export default TicketShow;
