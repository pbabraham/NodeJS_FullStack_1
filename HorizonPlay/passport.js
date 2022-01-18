var JwtStrategy = require('passport-jwt').Strategy;
ExtractJwt = require('passport-jwt').ExtractJwt
var config = require('./config/development'); // get db config file

module.exports = function(passport,models) {

  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {  
    models.Admin.findOne({where :{ id: jwt_payload.user.data.id }})
    .then((user) => {
      if(!user) {
        models.User.findOne({where :{ id: jwt_payload.user.data.id }}).then((user) => {
          if(!user) {
            return done(null, false, { errors: { 'email or password': 'is invalid' } });
          }
        }).catch(done);
      }
      return done(null, user);
    }).catch( models.User.findOne({where :{ id: jwt_payload.user.data.id }}).then((user) => {
      if(!user) {
        return done(null, false, { errors: { 'email or password': 'is invalid' } });
      }
    }).catch(done));

  }));
};
