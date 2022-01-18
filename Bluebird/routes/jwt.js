const jwt = require('jsonwebtoken')
let authToken = (req, res, next) => {
  let token =
    req.body.authorization ||
    req.query.authorization ||
    req.headers.authorization
  console.log('token', token)
  if (req.query.visitor == 'true') {
    next()
  } else if (token) {
    jwt.verify(token, process.env.decryptSecret, function (err, decoded) {
      if (err) {
        console.log('err', err)
        return res.status(401).send({
          success: false,
          code: 401,
          message: 'Failed to authenticate token.',
          data: null,
        })
      } else {
        req.authenticationUser = decoded
        next()
      }
    })
  } else {
    return res.status(401).send({
      success: false,
      code: 401,
      message: 'No token provided.',
      data: null,
    })
  }
}

module.exports = {
  authToken,
}
