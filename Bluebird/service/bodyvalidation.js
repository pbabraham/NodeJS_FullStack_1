const Joi = require('@hapi/joi');
const { error } = joiSchema.AddEvent.validate(req.body ? req.body :{});
const valid = error == null;
if (!valid) {
    const { details } = error;
    const message = details.map(i => i.message).join(',');
    // console.log("error", message);
    res.status(422).json({ error: message })
}
