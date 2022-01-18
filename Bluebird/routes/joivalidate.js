const Joi = require('@hapi/joi');
let joivalidate =  (schema) => {
    return (req, res, next) => {
    // console.log("req body",req.body);
    const { error } = schema.validate(req.body ? req.body :{});
    // console.log("error--",error);
    const valid = error == null;

    if (valid) {
      next();
    } else {
      const { details } = error;
      // console.log("details",{ details });
      const message = details.map(i => i.message).join(',');
      // console.log("message",message);

      // console.log("error", message);
       res.status(422).json({ message: message }) }
       //res.status(422).json({ error: error.message }) }
    }
  }

module.exports = {
    joivalidate
}
