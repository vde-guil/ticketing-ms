import Link from 'next/link';

const LandingPage = ({ tickets, currentUser }) => {

  // const content = currentUser ? "You are signed in" : "You are not signed in"
	// return <h1>{content}</h1>;

  const ticketList = tickets.map(ticket => {
    return <tr key={ticket.id}>
      <td>{ticket.title}</td>
      <td>{ticket.price}&euro;</td>
      <td> <Link href={`tickets/${ticket.id}`}>View</Link> </td>
    </tr>
  })

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>details</th>
          </tr>
        </thead>
        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  )
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const {data} = await client.get('api/tickets');

  return {tickets: data };
};

export default LandingPage;
