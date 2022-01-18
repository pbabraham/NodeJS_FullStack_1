module.exports = (app, wagner) => {
    const auth = require('./authentication')(app, wagner)
    app.use('/api/auth', auth)
}
