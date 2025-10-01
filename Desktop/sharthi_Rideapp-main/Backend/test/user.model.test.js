const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const userModel = require('../models/user.model');

let mongoServer;

// Increase default timeout for slower machines / CI
jest.setTimeout(30000);

beforeAll(async () => {
  // Ensure a JWT secret is present for token generation in tests
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await userModel.deleteMany({});
});

test('create user, hash password, generate token and compare password', async () => {
  const data = {
    fullname: { firstname: 'Jest', lastname: 'Test' },
    phone: 99999999999,
    college: 'Jest College',
    email: `jest.user+${Date.now()}@example.com`,
    password: 'Password123',
  };

  const hashed = await userModel.hashPassword(data.password);
  data.password = hashed;

  const user = new userModel(data);
  const saved = await user.save();

  expect(saved.email).toBe(data.email);
  expect(saved.password).toBeDefined();

  const isValid = await saved.comparePassword('Password123');
  expect(isValid).toBe(true);

  const token = saved.generateAuthToken();
  expect(typeof token).toBe('string');
});
