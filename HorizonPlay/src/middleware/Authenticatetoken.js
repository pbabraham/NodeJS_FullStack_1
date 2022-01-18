var config           = require('../../config/development');
var jwt              = require('jsonwebtoken');
const wagner         = require('wagner-core');
const sequelize      = require('../utils/db')(wagner);
const models         = require("../models")(sequelize, wagner);

module.exports =  async function authenticateToken(req, res, next) {

  // Gather the jwt access token from the request header
  if (req.headers.authorization == null) return res.sendStatus(401).send({ auth: false, 'message': 'AUTHENTICATION FAILED.' }); // if there isn't any token
  const token =  req.headers.authorization.split(" ");
  jwt.verify(token[1], config.secret, async function(err, decoded) {
    if (err){ 
      return res.status(500).send({ auth: false, 'message': 'Failed to authenticate token.' });
    }
    
    if (typeof decoded.user.data.isActive !== 'undefined') {
      // console.log(user,"ugugiouiouigouiupgiugpotgopiuiipypio");
      models.Admin.findOne({where :{email:decoded.user.data.email}})
      .then((user) => {        
        if(!user) {
          return res.status(500).send({ auth: false, "status_code" : 420 ,'message': 'Please login with correct credentials' }); 
        }
      })
    }  
    if (typeof decoded.user.data.slug !== 'undefined') {
      var slug = req.query.slug;
      let eventData = await models.Event.findOne({where :{event_slug:slug}})
      if(!eventData)
        return res.status(500).send({ auth: false,"status_code" : 420 ,'message': 'Event Not found' }); 
      let Usercheck  = await models.User.findOne({where :{email:decoded.user.data.email,event_id:eventData.id}});
      if(!Usercheck) {
        return res.status(500).send({ auth: false,"status_code" : 420 , 'message': 'Please login with correct credentials' }); 
      }
    }  

    next();
  });
};
