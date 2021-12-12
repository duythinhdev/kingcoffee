const path = require("path");

const filePath = path.join(__dirname, "..", "assets", "image.png");

describe("Test Shop", () => {
  const newShop = {
    name: "Test Seller",
	  username: "seller",
	  email: "seller@example.com",
	  phoneNumber: "0123456789",
	  address: "68, Nguyen Ngoc Phuong",
	  city: "Ho Chi Minh",
	  district: "Quan Tan Binh",
	  ward: "Phuong 19",
	  zipCode: "70000",
	  verificationIssueId: "5b4431a14c8ffd5cb5e0fdf0"
  };
  console.log(global.user)

  console.log(newShop)

  let shop;

  describe("Test upload document for registration issue", () => {
    it("Should be able to upload document and response id", async () => {
      await request
        .post("/v1/shops/register/document")
        .attach("file", filePath)
        .expect(200)
        .then(res => {
          const body = res.body.data;
          expect(body).to.exist;
          expect(body._id).to.exist;

          newShop.verificationIssueId = body._id;
        });
    });
  });

  describe("Test register shop with unauthorization user", () => {
    it("Should create new shop", async () => {
      const body = await testUtil.request(
        "post",
        "/v1/shops/register",
        null,
        newShop
      );

      expect(body).to.exist;
      expect(body._id).to.exist;
      expect(body.name).to.equal(newShop.name);
      expect(body.ownerId).to.exist;
      shop = body;
    });

    it("Should create new shop user as well", async () => {
      const owner = await DB.User.findOne({ _id: shop.ownerId });

      expect(owner).to.exist;
      expect(owner.name).to.equal(newShop.name);
      expect(owner.email).to.equal(newShop.email);
      expect(owner.isShop).to.equal(true);
      expect(owner.shopId.toString()).to.equal(shop._id);
    });
  });

  describe("Test register shop with authorization user", () => {
    xit("Should create new shop", async () => {
      const body = await testUtil.request(
        "post",
        "/v1/shops/register",
        global.userToken,
        newShop
      );

      expect(body).to.exist;
      expect(body._id).to.exist;
      expect(body.name).to.equal(newShop.name);
      expect(body.ownerId).to.exist;
      shop = body;
    });

    it("Should not create new shop user once again", async () => {
      const owner = await DB.User.find({ _id: shop.ownerId });

      expect(owner).to.exist;
      expect(owner.length).to.equal(1);
    });

    it("Should not create new shop again", async () => {
      const body = await testUtil.request(
        "post",
        "/v1/shops/register",
        global.sellerToken,
        newShop,
        400
      );

      expect(body).to.exist;
    });
  });

  describe("Test get shop details", () => {
    it("Should get details of shop with id", async () => {
      const body = await testUtil.request("get", `/v1/shops/${shop._id}`);

      expect(body).to.exist;
      expect(body._id).to.exist;
      expect(body.name).to.equal(newShop.name);
      expect(body.ownerId).to.exist;

      shop = body;
    });

    it("Should get details of shop with alias", async () => {
      const body = await testUtil.request("get", `/v1/shops/${shop.alias}`);

      expect(body).to.exist;
      expect(body._id).to.exist;
      expect(body.name).to.equal(newShop.name);
      expect(body.ownerId).to.exist;
      expect(body.verificationIssue).to.not.exist;

      shop = body;
    });

    it("Should get verificationIssue if admin", async () => {
      const body = await testUtil.request(
        "get",
        `/v1/shops/${shop._id}`,
        global.adminToken
      );

      expect(body).to.exist;
      expect(body._id).to.exist;
      expect(body.name).to.equal(newShop.name);
      expect(body.ownerId).to.exist;
      expect(body.verificationIssue).to.exist;

      shop = body;
    });
  });

  describe("Test my shop", () => {
    it("Should get details of shop", async () => {
      const body = await testUtil.request(
        "get",
        "/v1/shops/me",
        global.sellerToken
      );

      expect(body).to.exist;
      expect(body._id).to.exist;
      expect(body.name).to.equal(newShop.name);
      expect(body.ownerId).to.exist;
    });

    it("Should not get shop for account does not have shop", async () => {
      const body = await testUtil.request(
        "get",
        "/v1/shops/me",
        global.adminToken,
        null,
        400
      );

      expect(body).to.exist;
    });
  });

  describe("Test search shop", () => {
    it("Should search shop", async () => {
      const body = await testUtil.request("get", "/v1/shops/search");

      expect(body).to.exist;
      expect(body.count).to.exist;
      expect(body.items).to.exist;
    });
  });

  describe("Test update shop", () => {
    const updateData = {
      name: "new update name",
      alias: "this-is-unique-alias",
      email: "shopemail@yopmail.com",
      phoneNumber: "+1235677",
      address: "123 somewhere",
      city: "city",
      ward: "P14",
      district: "Quan BT",
      zipCode: "1234",
      returnAddress: "132 xxx",
      location: [1, 1],
      businessInfo: {
        name: "business name",
        identifier: "abc",
        address: "123 somewhere"
      },
      bankInfo: {
        bankName: "bank bank",
        swiftCode: "some code",
        bankId: "123456"
      },
      socials: {
        facebook: "http://fb.com",
        twitter: "http://twitter.com",
        google: "http://google.com",
        linkedin: "http://linkedin.com",
        youtube: "http://youtube.com",
        instagram: "http://instagram",
        flickr: "http://flickr"
      },
      verified: true,
      activated: true
    };
    it("Should update shop with owner role", async () => {
      const body = await testUtil.request(
        "put",
        `/v1/shops/${shop._id}`,
        global.sellerToken,
        updateData
      );

      expect(body).to.exist;
      expect(body.name).to.equal(updateData.name);
      expect(body.verified).to.equal(false);
      expect(body.activated).to.equal(false);
      expect(body.socials.twitter).to.equal(updateData.socials.twitter);
    });

    xit("Should update shop with admin role", async () => {
      //Tạm skip api này do lỗi khi connect vs api goldtime
      updateData.name = "new update admin";
      const body = await testUtil.request(
        "put",
        `/v1/shops/${shop._id}`,
        global.adminToken,
        updateData
      );

      expect(body).to.exist;
      expect(body.name).to.equal(updateData.name);
      expect(body.verified).to.equal(true);
      expect(body.activated).to.equal(true);
      expect(body.socials.twitter).to.equal(updateData.socials.twitter);
    });
  });

  describe("Test create shop", () => {
    const shopData = {
      name: "new shop name",
      alias: "this-is-unique-alias",
      email: "shopemail@yopmail.com",
      phoneNumber: "+1235677",
      address: "123 somewhere",
      city: "city",
      district: "state",
      ward: "VN",
      zipCode: "1234",
      returnAddress: "132 xxx",
      location: [1, 1],
      businessInfo: {
        name: "business name",
        identifier: "abc",
        address: "123 somewhere"
      },
      bankInfo: {
        bankName: "bank bank",
        swiftCode: "some code",
        bankId: "123456"
      },
      socials: {
        facebook: "http://fb.com",
        twitter: "http://twitter.com",
        google: "http://google.com",
        linkedin: "http://linkedin.com",
        youtube: "http://youtube.com",
        instagram: "http://instagram",
        flickr: "http://flickr"
      },
      verified: true,
      activated: true
    };

    before(async () => {
      await DB.User.update(
        { _id: global.user._id },
        {
          $set: {
            isShop: false,
            shopId: null
          }
        }
      );

      shopData.ownerId = global.user._id;
    });

    it("Should create new shop", async () => {
      const body = await testUtil.request(
        "post",
        "/v1/shops",
        global.userToken,
        shopData
      );

      expect(body).to.exist;
      expect(body.name).to.equal(shopData.name);
      expect(body.socials.twitter).to.equal(shopData.socials.twitter);

      const user = await DB.User.findOne({ _id: global.user._id });
      expect(user.isShop).to.equal(true);
      expect(user.shopId.toString()).to.equal(body._id);
    });
  });

  describe("Test stats", () => {
    it("Should get shop stats", async () => {
      const body = await testUtil.request(
        "get",
        "/v1/shops/stats",
        global.adminToken
      );

      expect(body).to.exist;
      expect(body.verified).to.exist;
      expect(body.unverified).to.exist;
      expect(body.activated).to.exist;
      expect(body.deactivated).to.exist;
      expect(body.featured).to.exist;
      expect(body.all).to.exist;
    });
  });
});
