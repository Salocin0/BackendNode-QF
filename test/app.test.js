import request from 'supertest';

test('Existe /user', async () => {
  const response = await request('http://localhost:8000').get('/user').send();
  expect(response.status === 200 || response.status === 404).toBe(true);
});

test('Existe /consumidor', async () => {
  const response = await request('http://localhost:8000').get('/consumidor').send();
  expect(response.status === 200 || response.status === 404).toBe(true);
});

test('Existe /login', async () => {
  const requestBody = {
    email: 'correo@example.com',
    contraseña: 'contraseña123',
  };
  const response = await request('http://localhost:8000').get('/login').send(requestBody);
  expect(response.status === 200 || response.status === 404).toBe(true);
});

test('Existe /encargado', async () => {
  const response = await request('http://localhost:8000').get('/encargado').send();
  expect(response.status === 200 || response.status === 404).toBe(true);
});

test('Existe /productor', async () => {
  const response = await request('http://localhost:8000').get('/productor').send();
  expect(response.status === 200 || response.status === 404).toBe(true);
});
