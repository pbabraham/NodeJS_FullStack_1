module.exports = (app, wagner) => {
    const userpanel = require('./userpanel')(app, wagner)
    app.use('/api/userpanel', userpanel)
}
