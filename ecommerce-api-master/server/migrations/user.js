module.exports = async () => DB.User.find({})
  // .remove()
  .then(() => DB.User.create({
    provider: 'local',
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    password: 'test',
    emailVerified: true
  }, {
    provider: 'local',
    role: 'admin',
    username: 'admin',
    name: 'Admin',
    email: 'admin@example.com',
    password: 'admin',
    emailVerified: true
  }));
