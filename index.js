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
  username: String
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

app.get('/api/users', (request, response) => {

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
