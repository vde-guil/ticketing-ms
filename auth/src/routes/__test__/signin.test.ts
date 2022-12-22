import request from 'supertest';
import { app } from '../../app';

it('fails when a email that does not exists is supplied', async () =>  {
  await request(app)
    .post('/api/users/signin') // post to endpoint
    .send({ // with body
      email: 'test@test.com',
      password: 'password'
    })
    .expect(400)
})

it('fails when incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup') // post to endpoint
    .send({ // with body
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201) //expecting 201 code
 
  await request(app)
    .post('/api/users/signin') // post to endpoint
    .send({ // with body
      email: 'test@test.com',
      password: 'badpassword'
    })
    .expect(400);
});

it('returns a 200 on successful signup and a Cookie is returned', async () => {
  await request(app)
    .post('/api/users/signup') // post to endpoint
    .send({ // with body
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201) //expecting 201 code
 
  const response =  await request(app)
    .post('/api/users/signin') // post to endpoint
    .send({ // with body
      email: 'test@test.com',
      password: 'password'
    })
    .expect(200)

    expect(response.get('Set-Cookie')).toBeDefined()
});