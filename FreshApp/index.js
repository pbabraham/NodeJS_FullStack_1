const express=require("express")
const cors = require('cors')
const db=require("./src/util/database")
const app=express()
const fileUpload = require('express-fileupload');
app.use(fileUpload({useTempFiles : true}))
require('dotenv').config()
const fetch = require("node-fetch");

app.use(cors())

app.use(express.json())

const port=process.env.PORT || 8000
app.use("/",require("./src/routers"))


app.listen(port,()=>console.log(`listening at port ${port}`))