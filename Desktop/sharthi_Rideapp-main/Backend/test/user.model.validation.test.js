const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const userModel = require('../models/user.model');

let mongoServer;
jest.setTimeout(30000);

beforeAll(async () => {
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

test('email validation and uniqueness', async () => {
  const data = {
    fullname: { firstname: 'Val', lastname: 'Test' },
    phone: 11111111111,
    college: 'Val College',
    email: `val.user+${Date.now()}@example.com`,
    password: 'Password123',
  };

  // Hash and save
  data.password = await userModel.hashPassword(data.password);
  const user = new userModel(data);
  await expect(user.save()).resolves.toBeDefined();

  // Invalid email
  const bad = new userModel({ ...data, email: 'not-an-email', phone: 22222222222 });
  await expect(bad.save()).rejects.toThrow();
});
