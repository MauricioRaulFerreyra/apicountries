require('dotenv').config()
const cors = require('cors')
const server = require('./src/app.js')
const { conn, Country, authenticate } = require('./src/db.js')
const axios = require('axios')
server.use(cors())

const getAll = async () => {
  try {
    let response = await axios('https://restcountries.com/v3/all')
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
    response = await Country.bulkCreate(response)
  } catch (err) {
    console.log(err)
  }
}

// Syncing all the models at once.
conn.sync({ force: true }).then(() => {
  try {
    authenticate().then(() => {
      console.log('Connection has been established successfully.')
      getAll()
    })
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
})

server.set('port', process.env.PORT || 3000)
server.listen(process.env.PORT || 3000, () => {
  console.log('Express server listening on port ' + process.env.PORT || 3000)
})
