import request from 'supertest';
import { app } from '../../app';

it('clears the cookie after signing out', async () => {
  await request(app)
    .post('/api/users/signup') // post to endpoint
    .send({ // with body
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201) //expecting 201 code

    const response = await request(app)
      .post('/api/users/signout')
      .send({})
      .expect(200);

      expect(response.get('Set-Cookie')).toEqual(['session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly']);
});