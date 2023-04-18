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
  const {from, to, limit } = request.query
  console.log(from, to, userId)
  
  try {
    if (from !== undefined && to !== undefined) {
      let query = [
        {$match:{_id: new mongo.Types.ObjectId(userId)}},
          {$project:{
            log:{
              $filter:{
                limit: Number(limit) || null,
                input:'$log',
                as:'item',
                cond: {$and:[{$gte:['$$item.date', new Date(from)]},{$lte:['$$item.date', new Date(to)]}]}
                
              }
            }
          }
        }]
        //limit !== undefined ?  (...query[0].$project.log.$filter, {limit:5}): null
        console.log(query,limit)
      const getLogsByDate = await userModel.aggregate(query)
      console.log(getLogsByDate)
      return response.json(getLogsByDate)
    } else {

      const getLogs = await userModel.find({_id:userId},{log:1,_id:1,username:1})
      //const {_id, username, log} = getLogs[0]
      
      //log.map(index => { console.log(index.date, new Date(index.date).getTime())})
      //const resultLog = {_id, username, count:log.length, log}
      const finalResponse = {
         _id: getLogs[0]._id,
        username: getLogs[0].username,
        log: getLogs[0].log.map(log => ({
          description: log.description,
          duration: log.duration,
          date: new Date(log.date).toDateString()
        }))
         
      }
      console.log(getLogs)
      return response.json(finalResponse)
    }
    } catch (error) {
      console.log(error)
    }
  })

app.post('/api/users/:id/exercises', async(request, response) => {
    const {description, duration, date} = request.body
    const userId = request.params.id
  const exerciseFromRequest = {
    description,
    duration,
    date: date === undefined ? new Date() : new Date(date)
  }
  console.log(exerciseFromRequest)
  try {
    const user = await userModel.find({_id: userId}).exec()
    if(!!user.length) {
      const updateUser = await userModel.findOneAndUpdate({_id: userId},{$push:{log:exerciseFromRequest}},{new:true}).exec()
      const finalResponse = {
        _id: updateUser._id,
        username: updateUser.username,
        log: updateUser.log.map(log => ({
          description: log.description,
          duration: log.duration,
          date: new Date(log.date).toDateString()
        }))

      }
      console.log(finalResponse, updateUser)
      response.json(finalResponse)
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
