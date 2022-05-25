require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const express = require('express')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const routes = require('./src/routes/index.js')
const { conn } = require('./src/db.js')
const { Op } = require('sequelize')
const { Country } = require('./src/db')
const PORT = process.env.PORT || 8080
const app = express()

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cookieParser())
app.use(morgan('dev'))
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000') // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  next()
})

app.use('/', routes)

// Error catching endware.
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const status = err.status || 500
  const message = err.message || err
  console.error(err)
  res.status(status).send(message)
})

let API = process.env.apiAll

const getAll = async () => {
  try {
    let response = await axios(API)
    response = response.data.map(res => {
      return {
        id: res.cca3,
        name: res.name.common && res.name.common,
        image: res.flags && res.flags.map(flag => flag),
        continent: res.continents && res.continents.map(el => el),
        capital: res.capital ? res.capital.map(el => el) : ['no data'],
        subregion: res.subregion,
        area: res.area,
        population: res.population
      }
    })

    return response
  } catch (err) {
    console.log(err)
  }
}

const getAllDb = async () => {
  try {
    let response = await getAll()
    response.map(el => {
      Country.findOrCreate({
        where: { name: el.name },
        defaults: {
          id: el.id,
          name: el.name,
          image: el.image,
          continent: el.continent,
          capital: el.capital,
          subregion: el.subregion,
          area: el.area,
          population: el.population
        }
      })
    })
    let data = await Country.findAll()

    return data
  } catch (e) {
    console.log(e)
  }
}
conn.sync({ force: true }).then(() => {
  getAllDb()
  app.listen(PORT || 8080, () => {
    console.log(`server is running on port ${PORT}`)
  })
})
