const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

// Mock mongoose connection and Schema
jest.mock('mongoose', () => ({
  connect: jest.fn(() => Promise.resolve()),
  connection: {
    close: jest.fn(() => Promise.resolve()),
  },
  Schema: jest.fn(() => ({
    // Add any schema methods you need to mock
  })),
  model: jest.fn(() => {
    const User = function(data) {
      this._id = '1';
      this.id = '1';
      this.name = data.name;
      this.email = data.email;
      this.position = data.position;
    };
    User.prototype.save = jest.fn(() => Promise.resolve({
      _id: '1',
      id: '1',
      name: 'New User',
      email: 'new@example.com',
      position: 'Designer'
    }));
    User.find = jest.fn(() => Promise.resolve([{ _id: '1', name: 'Test User', email: 'test@example.com', position: 'Developer' }]));
    User.findById = jest.fn(() => Promise.resolve({ _id: '1', name: 'Test User', email: 'test@example.com', position: 'Developer' }));
    User.findByIdAndUpdate = jest.fn(() => Promise.resolve({ _id: '1', name: 'Updated User', email: 'updated@example.com', position: 'Manager' }));
    User.findByIdAndDelete = jest.fn(() => Promise.resolve({ _id: '1', name: 'Deleted User', email: 'deleted@example.com', position: 'Former' }));
    return User;
  }),
}));

describe('Basic API tests', () => {
  it('GET / returns running message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('App is running');
  });

  it('POST /graphql returns schema introspection', async () => {
    const query = `
      query {
        __schema {
          queryType {
            name
          }
        }
      }
    `;

    const res = await request(app)
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(res.body.data.__schema.queryType.name).toBe('RootQueryType');
  });

  describe('GraphQL Queries', () => {
    it('should fetch all users', async () => {
      const query = `
        query {
          users {
            id
            name
            email
            position
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(res.body.data.users).toBeDefined();
      expect(res.body.data.users[0]).toHaveProperty('id');
      expect(res.body.data.users[0]).toHaveProperty('name');
      expect(res.body.data.users[0]).toHaveProperty('email');
      expect(res.body.data.users[0]).toHaveProperty('position');
    });

    it('should fetch a single user by ID', async () => {
      const query = `
        query {
          user(id: "1") {
            id
            name
            email
            position
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user).toHaveProperty('name');
      expect(res.body.data.user).toHaveProperty('email');
      expect(res.body.data.user).toHaveProperty('position');
    });
  });

  describe('GraphQL Mutations', () => {
    it('should add a new user', async () => {
      const mutation = `
        mutation {
          addUser(name: "New User", email: "new@example.com", position: "Designer") {
            id
            name
            email
            position
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .send({ query: mutation })
        .expect(200);

      console.log('Response body:', JSON.stringify(res.body, null, 2));
      expect(res.body.data.addUser).toBeDefined();
      expect(res.body.data.addUser.name).toBe('New User');
      expect(res.body.data.addUser.email).toBe('new@example.com');
      expect(res.body.data.addUser.position).toBe('Designer');
    });

    it('should update an existing user', async () => {
      const mutation = `
        mutation {
          updateUser(id: "1", name: "Updated User", email: "updated@example.com", position: "Manager") {
            id
            name
            email
            position
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .send({ query: mutation })
        .expect(200);

      expect(res.body.data.updateUser).toBeDefined();
      expect(res.body.data.updateUser.name).toBe('Updated User');
      expect(res.body.data.updateUser.email).toBe('updated@example.com');
      expect(res.body.data.updateUser.position).toBe('Manager');
    });

    it('should delete a user', async () => {
      const mutation = `
        mutation {
          deleteUser(id: "1") {
            id
            name
            email
            position
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .send({ query: mutation })
        .expect(200);

      expect(res.body.data.deleteUser).toBeDefined();
      expect(res.body.data.deleteUser).toHaveProperty('id');
      expect(res.body.data.deleteUser).toHaveProperty('name');
      expect(res.body.data.deleteUser).toHaveProperty('email');
      expect(res.body.data.deleteUser).toHaveProperty('position');
    });
  });
});

// Close mongoose connection after tests to prevent hanging
afterAll(async () => {
  await mongoose.connection.close();
});
