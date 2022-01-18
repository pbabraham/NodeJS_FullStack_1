module.exports = (app, wagner) => {
    const eventmanagement = require('./eventmanagement')(app, wagner)
    app.use('/api/eventmanagement', eventmanagement)
}
