require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const server = require('./src/app')
const { conn } = require('./src/db.js')
const { Op } = require('sequelize')
const { Country } = require('./src/db')

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
})
server.listen(process.env.PORT || 3001)
console.log('Server on port', process.env.PORT || 3001)
