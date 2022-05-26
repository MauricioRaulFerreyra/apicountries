require('dotenv').config()
const server = require('./src/app.js')
const { conn, Country } = require('./src/db.js')
const axios = require('axios')

const PORT = process.env.PORT

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
  getAll()
})
server.listen(PORT, () => {
  console.log('Express server listening on port ' + PORT)
})
