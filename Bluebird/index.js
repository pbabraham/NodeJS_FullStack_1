const express = require('express')
const bodyParser = require('body-parser')
const { mongoService } = require('./connection')
var path = require('path')
let ejs = require('ejs')
const cors = require('cors')
const fs = require('fs')
const mongoose = require('mongoose')
require('dotenv').config()
var CronJob = require('cron').CronJob
const port = process.env.PORT || 9001

const app = express()
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(bodyParser.json({ limit: '50mb' }))
mongoService.connect()

app.use(cors({ origin: '*' }))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

//to prevent mongoose warning
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

const models_path = __dirname + '/schema'
fs.readdirSync(models_path).forEach((file) => {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/public/profilephoto'))
app.use(express.static(__dirname + '/public/mealGrocerie'))
app.use(express.static(__dirname + '/public/mealpdfs'))
app.use(express.static(__dirname + '/public/exerciseImages'))
app.use('/public/exerciseImages', express.static('public/exerciseImages'))

app.use('/rest/user/', require('./routes/user'))
app.use('/rest/admin/', require('./routes/admin'))
app.use('/rest/meal/', require('./routes/meal'))

var usercontroller = require('./controller/user')
var mongocontroller = require('./controller/mogodbbck_live')

//--- CRON JOB ---
// new CronJob("0 0 */3 * *", userCtrl.user_reminder, null, true); // every 3rd day-of-month.
// new CronJob("* * * * *", usercontroller.user_reminder, null, true); // every minute
new CronJob('30 18 * * *', mongocontroller.mongobackups, null, true) // every 5 minute */5 * * * *

app.get('/mongobackup', async (req, res) => {
  let result = await mongocontroller.mongobackupsapi(req)
  res.status(result.code).send(result)
})

app.listen(port, () => {
  console.log(`The Meal Plan app is up on port ${port}`)
})
