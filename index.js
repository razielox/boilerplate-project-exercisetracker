/* const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongo = require('mongoose')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())

mongo.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
app.use(express.static('public'))
process.env.TZ = "America/Cancun"
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
    const getLogs = await userModel.find({_id:userId},{log:1,_id:1,username:1})
    const userLogResponse = {
      _id: getLogs[0]._id,
      username: getLogs[0].username
    }
    if (from !== undefined || to !== undefined || limit !== undefined) {
    
    if (from && to) {

      const getLogArr = getLogs[0].log
      .filter(indexLog => new Date(indexLog.date).getTime() >= new Date(from).getTime() && new Date(indexLog.date).getTime() <= new Date(to).getTime())
      .map(index =>({
        description: index.description,
        duration: Number(index.duration),
        date: new Date(index.date).toDateString()
      }))
       
      //userLogResponse.from = new Date(from).toDateString()
      //userLogResponse.to = new Date(to).toDateString()
      userLogResponse.count =limit > 0 ? getLogArr.slice(0,limit).length :  getLogArr.length
      userLogResponse.log = limit > 0 ? getLogArr.slice(0,limit): getLogArr
    }  else if(to) {
      const getLogArr = getLogs[0].log
      .filter(indexLog => new Date(indexLog.date).getTime() <= new Date(to).getTime())
      .map(index => ({
        description: index.description,
        duration: Number(index.duration),
        date: new Date(index.date).toDateString()
      }))
      //userLogResponse.to = new Date(to).toDateString()
      userLogResponse.count =limit > 0 ? getLogArr.slice(0,limit).length :  getLogArr.length
      userLogResponse.log = limit > 0 ? getLogArr.slice(0,limit): getLogArr
    } else if (from) {
      const getLogArr = getLogs[0].log
      .filter(indexLog => new Date(indexLog.date).getTime() >= new Date(from).getTime())
      .map(index => ({
        description: index.description,
        duration: Number(index.duration),
        date: new Date(index.date).toDateString()
      }))
      //userLogResponse.from = new Date(from).toDateString()
      userLogResponse.count =limit  ? getLogArr.slice(0,limit).length :  getLogArr.length
      userLogResponse.log = limit  ? getLogArr.slice(0,limit): getLogArr
    } 
      return response.json(userLogResponse)
    } else {

      const finalResponse = {
         _id: getLogs[0]._id,
        username: getLogs[0].username,
        count: getLogs[0].log.length,
        log: getLogs[0].log.map(log => ({
          description: log.description,
          duration: Number(log.duration),
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
    duration: Number(duration),
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
        date: new Date(updateUser.log[updateUser.log.length -1].date).toDateString(),
        duration: Number(updateUser.log[updateUser.log.length -1].duration),
        description: updateUser.log[updateUser.log.length -1].description
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
 */
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()

process.env.TZ = "America/Cancun";
console.log(new Date().toString());

const MONGO_URL = process.env.MONGO_URI;

mongoose.connect(MONGO_URL);

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  log: [{
    date: String,
    duration: Number,
    description: String
  }],
  count: Number
});

const User = mongoose.model('User', userSchema);

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users')
  .post((req, res) => {
    const username = req.body.username
    const user = new User({ username, count: 0 })
    user.save((err, data) => {
      if (err) {
        res.json({ error: err })
      }
      res.json(data)
    })
  })
  .get((req, res) => {
    User.find((err, data) => {
      if (data) {
        res.json(data)
      }
    })
  })

app.post('/api/users/:_id/exercises', (req, res) => {
  const { description } = req.body
  const duration = parseInt(req.body.duration)
  const date = req.body.date ? 'Mon Jan 01 1990' : 'Mon Aug 01 2022';
  // const date = req.body.date
  //   ? new Date(req.body.date).toDateString()
  //   : new Date().toDateString()
  const id = req.params._id

  const exercise = {
    date,
    duration,
    description,
  }

  User.findByIdAndUpdate(id, {
    $push: { log: exercise },
    $inc: { count: 1 }
  }, { new: true }, (err, user) => {
    if (user) {
      const updatedExercise = {
        _id: id,
        username: user.username,
        ...exercise
      };
      // console.log(updatedExercise)
      res.json(updatedExercise)
    }
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  const { from, to, limit } = req.query
  console.log(from, to, limit)

  User.findById(req.params._id, (err, user) => {
    if (user) {
      if (from || to || limit) {
        const logs = user.log
        const filteredLogs = logs
          .filter(log => {
            const formattedLogDate = (new Date(log.date)).toISOString().split('T')[0]
        console.log(formattedLogDate)   
        console.log(from)   
        return formattedLogDate >= from && formattedLogDate <= to;
          })
        const slicedLogs = limit ? filteredLogs.slice(0, limit) : filteredLogs
        user.log = slicedLogs
        user.count = slicedLogs.length
      }

      console.log(user)
      res.json(user)
    }
  })
})

app.get('/mongo-health', (req, res) => {
  res.json({ status: mongoose.connection.readyState })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})