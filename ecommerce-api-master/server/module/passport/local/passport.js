const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

exports.setup = () => {
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password' // this is the virtual field on the model
  }, async (username, password, done) => {
    try {
      const user = await DB.User.findOne({ username: username.toLowerCase(), isActive: true });
      if (!user) {
        return done(null, false, PopulateResponse.error({
          message: 'This username is not registered.'
        }, 'ERR_USER_NOT_FOUND', 400, 400));
      }
      
      // return user.authenticate(password, (authError, authenticated) => {
      //   if (authError) {
      //     return done(authError);
      //   }
      //   if (!authenticated) {
      //     return done(null, false, PopulateResponse.error({
      //       message: 'Password is incorrect.'
      //     }, 'ERR_PASSWORD_IS_INCORRECT', 400, 400));
      //   } else if (!user.emailVerified) {
      //     return done(null, false, PopulateResponse.error({
      //       message: 'Please verify your email address'
      //     }, 'ERR_EMAIL_NOT_VERIFIED'));
      //   }

        
      // });

      return done(null, user);
    } catch (e) {
      return done(e);
    }
  }));
};
