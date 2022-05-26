const server = require('./src/app.js')
const { conn } = require('./src/db.js')
const axios = require('axios')
const cors = require('cors')
require('dotenv').config()
const { Op } = require('sequelize')
const { Country } = require('./src/db')
server.use(cors())

const PORT = process.env.PORT

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
    //console.log(response)
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
    //console.log(data)
    return data
  } catch (e) {
    console.log(e)
  }
}

// Syncing all the models at once.
conn.sync({ force: true }).then(() => {
  getAllDb()
  server.listen(PORT, () => {
    console.log(`%s listening at ${PORT}`) // eslint-disable-line no-console
  })
})
