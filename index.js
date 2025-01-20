const api = require('./src/api_global_restcountries.json')
const dotnev = require('dotenv')
const cors = require('cors')
const server = require('./src/app.js')
const { conn, Country } = require('./src/db.js')
const axios = require('axios').default

dotnev.config()
server.use(cors())

const PORT = process.env.PORT || 4000

axios.defaults.maxContentLength = 500 * 1024 * 1024; 
axios.defaults.maxBodyLength = 500 * 1024 * 1024;    

const getAll = async () => {
  try {
    let response;
    try {
      response = await axios.get("https://restcountries.com/v3.1/all", {
        maxContentLength: 500 * 1024 * 1024,
        maxBodyLength: 500 * 1024 * 1024,
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Connection': 'keep-alive'
        }
      });
      console.log("Datos obtenidos exitosamente de la API");
    } catch (err) {
      console.log("Error al obtener datos de la API, utilizando datos locales:", err.message);
    }

    // Aquí está la clave: usamos los datos de la API si existen, si no, usamos api local
    const data = (response && response.data ? response.data : api).map((res) => {
      return {
        id: res.cca3,
        name: res.name.common,
        img: res.flags && res.flags.png,
        continent: res.continents ? res.continents : ['no data'],
        capital: res.capital ? res.capital : ['no data'],
        subregion: res.subregion,
        area: res.area,
        population: res.population
      };
    });

    return data;
  } catch (err) {
    console.log("Error en getAll:", err);
    return []; // Por si falla incluso el procesamiento de los datos locales
  }
};

const countriesTableLoad = async () => {
  try {
    const countries = await getAll();
    if (!countries || countries.length === 0) {
      console.log('No se pudieron obtener países para cargar');
      return;
    }

    await Promise.all(countries.map(el => {
      return Country.findOrCreate({
        where: { name: el.name },
        defaults: {
          id: el.id,
          name: el.name,
          image: el.img,
          continent: el.continent,
          capital: el.capital,
          subregion: el.subregion,
          area: el.area,
          population: el.population
        }
      });
    }));
    console.log('Países cargados exitosamente en la base de datos');
  } catch (err) {
    console.log('Error al cargar países en la base de datos:', err);
  }
}

conn.sync({ alter: true }).then(() => {
  countriesTableLoad();
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}).catch(err => {
  console.log('Error al iniciar el servidor:', err);
});
