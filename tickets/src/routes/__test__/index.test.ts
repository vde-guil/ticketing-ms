import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../model/ticket";

const createTicket =  () => {
  return request(app)
  .post('/api/tickets')
  .set('Cookie', global.signin())
  .send({
    title: 'whatever',
    price: 20
  })
}

it("returns a list of all tickets ", async () => {

  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200)

    expect(response.body.length).toEqual(3);
});

