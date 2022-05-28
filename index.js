require('dotenv').config()
const cors = require('cors')
const server = require('./src/app.js')
const { conn, Country, Activity } = require('./src/db.js')
const axios = require('axios').default
server.use(cors())

const PORT = process.env.PORT || 3001

const dataInfo = async () => {
  try {
    const info = await axios.get('https://restcountries.com/v3/all')

    const data = await info.data.map(el => {
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

    return data
  } catch (error) {
    console.log(error)
  }
}

;(async () => {
  await conn.sync({ force: true })

  const info = await dataInfo() //info de la api

  try {
    const data = await Country.findAll() // data de la tabla
    if (!data.length) {
      await Country.bulkCreate(info) // llena la Db
    }
  } catch (error) {
    console.log(error)
  }

  server.listen(PORT, () => {
    console.log('%s listening at ', PORT) // eslint-disable-line no-console
  })
})()
