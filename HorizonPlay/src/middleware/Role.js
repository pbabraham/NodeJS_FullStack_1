var jwtDecode = require('jwt-decode')

let role = {}

role.user = (req, res, next) => {
    let decodedData = jwtDecode(req.headers.authorization)
    if(decodedData.user.data.role_id === '6') next()
    else res.json({
        status: 400,
        message: 'Invalid credentials'
    })
}

role.eventManager = (req, res, next) => {
    let decodedData = jwtDecode(req.headers.authorization)
    if(decodedData.user.data.role_id === '2') next()
    else res.json({
        status: 400,
        message: 'Invalid credentials'
    })
}

role.registrationManager = (req, res, next) => {
    let decodedData = jwtDecode(req.headers.authorization)
    if(decodedData.user.data.role_id === '3') next()
    else res.json({
        status: 400,
        message: 'Invalid credentials'
    })
}

role.qna = (req, res, next) => {
    let decodedData = jwtDecode(req.headers.authorization)
    if(decodedData.user.data.role_id === '5') next()
    else res.json({
        status: 400,
        message: 'Invalid credentials'
    })
}

role.admin = (req, res, next) => {
    let decodedData = jwtDecode(req.headers.authorization)
    if(decodedData.user.data.role_id === 1) next()
    else res.json({
        status: 400,
        message: 'Invalid credentials'
    })
}

role.techManager = (req, res, next) => {
    let decodedData = jwtDecode(req.headers.authorization)
    if(decodedData.user.data.role_id === '4') next()
    else res.json({
        status: 400,
        message: 'Invalid credentials'
    })
}
module.exports = role