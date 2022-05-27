require('dotenv').config()
const cors = require('cors')
const server = require('./src/app.js')
const { conn, Country, authenticate } = require('./src/db.js')
const axios = require('axios')
server.use(cors())

const PORT = process.env.PORT || 3000

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
const ejecutar = async () => {
  try {
    await conn.sync({ force: true })
    await authenticate()
    console.log('Database synced!')
    await getAll()
    server.set('port', PORT)
    server.listen(PORT, () => {
      console.log('Express server listening on port ' + PORT)
    })
  } catch (err) {
    console.log(err)
  }
}

ejecutar()
