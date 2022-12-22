const OrderIndex = ({orders}) => {
  return (
    <ul>
      {orders && orders.map(order => {
        return <li key={order.id}> 
          {order.ticket.title} - {order.status}
        </li>
      })}
    </ul>
    )
}

OrderIndex.getInitialProps = async (context, client) => {

  let orders = null
  try {
    const {data} = await client.get('/api/orders');
    orders = data
  } catch (e) {

    console.log(e)
  }

  return {orders}
}

export default OrderIndex;