module.exports = (app, wagner) => {
    const admin = require('./adminpanel')(app, wagner)
    app.use('/api/admin', admin)
}
