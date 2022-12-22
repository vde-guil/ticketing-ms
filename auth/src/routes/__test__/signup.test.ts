import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup') // post to endpoint
    .send({ // with body
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201) //expecting 201 code
});

it("Returns a 400 with an invalid email", async () => {
  return request(app)
    .post('/api/users/signup') // post to endpoint
    .send({ // with body
      email: 'test@test',
      password: 'password'
    })
    .expect(400) //expecting 201 code
})

it("Returns a 400 with an invalid password", async () => {
  return request(app)
    .post('/api/users/signup') // post to endpoint
    .send({ // with body
      email: 'test@test.com',
      password: 'p'
    })
    .expect(400) //expecting 201 code
})

it("Returns a 400 with missing password and/or email", async () => {
  await request(app)
    .post('/api/users/signup') // post to endpoint
    .send({ // with body
      password: "password"
    })
    .expect(400) //expecting 201 code

    await request(app)
    .post('/api/users/signup') // post to endpoint
    .send({ // with body
      email: "valentin@valentin.com"
    })
    .expect(400) //expecting 201 code
})

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

    await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(400);
})

it('sets a cookie after successful signup', async () => {
  const response = await request(app)
  .post('/api/users/signup')
  .send({
    email: 'test@test.com',
    password: 'password'
  })
  .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
})