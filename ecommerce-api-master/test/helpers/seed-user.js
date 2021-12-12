module.exports = async () => DB.User.find({})
  .remove()
  .then(async () => {
    try {
      const user = new DB.User({
        provider: 'local',
        name: 'Test User',
        username: "tester",
        email: 'test@example.com',
        phoneNumber: '03032229999',
        password: 'test',
        emailVerified: true
      });
      const seller = new DB.User({
        provider: 'local',
        name: 'Test Seller',
        username: "seller",
        email: 'seller@example.com',
        phoneNumber: '03032211111',
        password: 'test',
        emailVerified: true
      });
      const admin = new DB.User({
        provider: 'local',
        role: 'admin',
        username: "admin",
        name: 'Admin',
        phoneNumber: '09031113333',
        email: 'admin@example.com',
        password: 'admin',
        emailVerified: true
      });
  
      await admin.save();
      await user.save();
      await seller.save();
      return {
        admin,
        user,
        seller
      };
    } catch (error) {
      throw error
    }
    
  });
