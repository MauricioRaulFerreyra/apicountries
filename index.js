const api = require('./src/api_global_restcountries.json')
const dotnev = require('dotenv')
const cors = require('cors')
const server = require('./src/app.js')
const { conn, Country } = require('./src/db.js')
const axios = require('axios').default
dotnev.config()
server.use(cors())

const PORT = process.env.PORT || 3001

/**LLAMAMOS A LA API */
const getAll = async () => {
  try {
    let response;
    const axiosConfig = {
      timeout: 5000, // Timeout de 5 segundo
      timeout: 10000, // Aumentamos el timeout a 10 segundos
      maxContentLength: Infinity, // Permitir cualquier tamaño de respuesta
      maxBodyLength: Infinity,
      headers: {
        'Accept': 'application/json',
        'Connection': 'keep-alive'
      }
    };

    try {
      response = await axios.get("https://restcountries.com/v3.1/all", axiosConfig);
    } catch (err) {
      console.log("Error al obtener datos de la API, utilizando datos locales:", err.message);
      return api.map(formatCountryData); // Usar datos locales si falla la API
    }

    return response.data.map(formatCountryData);
  } catch (err) {
    console.error("Error en getAll:", err);
    throw err; // Propagar el error para manejarlo en countriesTableLoad
  }
};

// Función auxiliar para formatear los datos del país
const formatCountryData = (res) => ({
  id: res.cca3,
  name: res.name.common,
  img: res.flags?.png,
  continent: res.continents || ['no data'],
  capital: res.capital || ['no data'],
  subregion: res.subregion,
  area: res.area,
  population: res.population
});

const countriesTableLoad = async () => {
  try {
    const countries = await getAll();
    const promises = countries.map(el => 
      Country.findOrCreate({
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
      })
    );
    
    await Promise.all(promises);
    console.log('Países cargados exitosamente en la base de datos');
  } catch (err) {
    console.error('Error al cargar países en la base de datos:', err);
  }
};

// Syncing all the models at once.
conn.sync({ alter: true }).then(() => {
  countriesTableLoad();
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('Error al iniciar el servidor:', err);
});
