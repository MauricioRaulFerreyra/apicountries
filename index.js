const dotnev = require('dotenv')
const cors = require('cors')
const server = require('./src/app.js')
const { conn, Country, Activity } = require('./src/db.js')
const axios = require('axios').default
dotnev.config()
server.use(cors())

const PORT = process.env.PORT

const dataInfo = async () => {
  try {
    const info = await axios.get("https://restcountries.com/v3/all")

    const data = await info.data.map(res => {
      return {
        id: res.cca3,
        name: res.name.common && res.name.common,
        image: res.flags[1],
        continent: res.continents && res.continents.toString(),
        capital: res.capital ? res.capital[0] : "Capital not found",
        subregion: res.subregion ? res.subregion : "Subregion not found",
        area: res.area,
        population: res.population
      }
    })

    return data
  } catch (error) {
    console.log(error)
  }
}

(async () => {
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
