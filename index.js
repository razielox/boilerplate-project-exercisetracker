const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongo = require('mongoose')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())

mongo.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
app.use(express.static('public'))

const userSchema = new mongo.Schema({
  username: String,
  count: Number,
  log: [Object]
})

const exerciseSchema = new mongo.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
})

const logSchema = new mongo.Schema({
  username: String,
  count: Number,
  log: [Object]
})
const userModel = new mongo.model('users', userSchema)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
// Create a new User
app.post('/api/users', (request, response) => {
  const username = request.body.username
  console.log(request.body)
  const newUser = new userModel({
    username: username
  })

  newUser.save()
  .then(result => response.json({username: result.username, _id: result._id}))
  .catch(err => response.json({error: err}))
})

// Get All Users
app.get('/api/users', async(request, response) => {
  
  try {
    const selectAll = await userModel.find().select({username: 1}).exec()
    console.log(selectAll)
    response.json(selectAll)
  } catch (error) {
    throw new Error(error)
  }
  //userModel.find().then(result => response.json(result)).catch(err => console.log(err))
})

app.get('/api/users/:id/logs', async(request, response) => {
  const userId = request.params.id
  console.log(userId)
  try {
    const getLogs = await userModel.find({_id:userId}).select({log:1,_id:0}).exec()
    response.json(getLogs)
    console.log(getLogs)
  } catch (error) {
    console.log(error)
  }
})
app.post('/api/users/:id/exercises', async(request, response) => {
  const userId = request.params.id
  const exerciseFromRequest = {
    description: request.body.description,
    duration: request.body.duration,
    date: request.body.date ||  new Date().toDateString({},{timeZone: "UTC"})
  }
  try {
    const user = await userModel.find({_id: userId}).exec()
    if(!!user.length) {
      console.log(exerciseFromRequest)
      const updateUser = await userModel.findOneAndUpdate({_id: userId},{$push:{log:exerciseFromRequest}},{new:true}).exec()
      response.json(updateUser)
    } else {
      response.send('nada')
    }
  } catch (error) {
    console.log(error)
  }
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
