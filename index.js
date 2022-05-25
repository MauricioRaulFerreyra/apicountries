require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const express = require('express')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const routes = require('./src/routes/index.js')
const { conn } = require('./src/db.js')
const { Country } = require('./src/db.js')
const PORT = process.env.PORT || 3001
const app = express()

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cookieParser())
app.use(morgan('dev'))

app.use('/', routes)

let API = process.env.APIALL

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

// async function main () {
//   try {
//     await sequelize.sync({ force: true })
//     await sequelize.authenticate()
//     console.log('Connection has been established successfully.')
//     await getAllDb()
//     app.listen(port, () => {
//       console.log(`server is running on port ${port}`)
//     })
//   } catch (error) {
//     console.error('Unable to connect to the database:', error)
//   }
// }

// main()
