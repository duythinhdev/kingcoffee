const path = require('path');

const avatarPath = path.join(__dirname, '..', 'assets', 'image.png');

describe('Test user', () => {
  const newUser = {
    username: 'newusertest',
    email: 'newusertest@test.com',
    password: '123456',
    name: 'user test'
  };
  const newName = 'newtestname';
  let user;

  it('Should create new user with admin role', async () => {
    const body = await testUtil.request('post', '/v1/users', adminToken, newUser);

    expect(body).to.exist;
    expect(body.email).to.equal(newUser.email);
    user = body;
  });

  it('Should update user with admin role', async () => {
    const body = await testUtil.request('put', `/v1/users/${user._id}`, adminToken, Object.assign(newUser, { name: newName }));

    expect(body).to.exist;
    expect(body.name).to.equal(newName);
  });

  it('Should get user profile', async () => {
    const body = await testUtil.request('get', `/v1/users/${user._id}`, adminToken);

    expect(body).to.exist;
    expect(body.name).to.equal(newName);
  });

  it('Should search users', async () => {
    const body = await testUtil.request('get', '/v1/users/search', adminToken);

    expect(body).to.exist;
    expect(body.count).to.exist;
    expect(body.items).to.exist;
  });

  xit('Should update avatar', async () => {
    await request.post('/v1/users/avatar')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('avatar', avatarPath)
      .expect(200)
      .then((res) => {
        const body = res.body.data;
        expect(body).to.exist;
        expect(body.url).to.exist;
      });
  });

  describe('Test stats', () => {
    it('Should get user stats', async () => {
      const body = await testUtil.request('get', '/v1/users/stats', global.adminToken);

      expect(body).to.exist;
      expect(body.activated).to.exist;
      expect(body.deactivated).to.exist;
      expect(body.all).to.exist;
    });
  });
});
