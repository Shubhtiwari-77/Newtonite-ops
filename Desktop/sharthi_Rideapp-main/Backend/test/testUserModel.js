require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('../models/user.model');

async function testUserModel() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sharthi_test';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB at', uri);

    const testUser = {
      fullname: { firstname: 'Test', lastname: 'User' },
      phone: 12345678901,
      college: 'Test College',
      email: `test.user+${Date.now()}@example.com`,
      password: 'TestPassword123',
    };

    // Hash password and create user
    const hashedPassword = await userModel.hashPassword(testUser.password);
    testUser.password = hashedPassword;

    const newUser = new userModel(testUser);
    const savedUser = await newUser.save();
    console.log('User created successfully:', { id: savedUser._id, email: savedUser.email });

    // JWT generation
    const token = savedUser.generateAuthToken();
    console.log('JWT token generated (first 64 chars):', token.slice(0, 64));

    // Password compare
    const isValid = await savedUser.comparePassword('TestPassword123');
    console.log('Password compare result:', isValid);

    // Cleanup
    await userModel.deleteOne({ _id: savedUser._id });
    console.log('Test user deleted');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testUserModel();
