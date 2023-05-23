const dotnev = require("dotenv");
const cors = require("cors");
const server = require("./src/app.js");
const { conn, Country } = require("./src/db.js");
const axios = require("axios").default;
dotnev.config();
server.use(cors());

const PORT = process.env.PORT || 3000;

const options = {
  method: "GET",
  url: "https://rest-country-api.p.rapidapi.com/",
  headers: {
    "X-RapidAPI-Key": "5324481b2cmsh9151d9a362f484ep1b9e9cjsn4333ae2a9d69",
    "X-RapidAPI-Host": "rest-country-api.p.rapidapi.com",
  },
};

// try {
//   const response = await axios.request(options);
//   console.log(response.data);
// } catch (error) {
//   console.error(error);
// }

/**LLAMAMOS A LA API */
const getAll = async () => {
  try {
    const response = await axios.request(options);
    const data = await response.data.map((res) => {
      return {
        id: res.cca3,
        name: res.name.common && res.name.common,
        img: res.flags && res.flags.map((flag) => flag),
        continent: res.continents && res.continents.map((el) => el),
        capital: res.capital ? res.capital.map((el) => el) : ["no data"],
        subregion: res.subregion,
        area: res.area,
        population: res.population,
        maps: res.maps.googleMaps,
      };
    });
    return data;
  } catch (err) {
    console.log(err);
  }
};

const countriesTableLoad = async () => {
  const countries = await getAll();
  countries.map((el) => {
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
        population: el.population,
        maps: el.maps,
      },
    });
  });
};

// const dataInfo = async () => {
//   try {
//     const info = await axios.get("https://restcountries.com/v3/all");

//     const data = await info.data.map((res) => {
//       return {
//         id: res.cca3,
//         name: res.name.common && res.name.common,
//         image: res.flags && res.flags.map((flag) => flag),
//         continent: res.continents && res.continents.map((el) => el),
//         capital: res.capital ? res.capital.map((el) => el) : ["no data"],
//         subregion: res.subregion,
//         area: res.area,
//         population: res.population,
//       };
//     });

//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// };

// const countriesTableLoad = async () => {
//   const countries = await dataInfo();
//   countries.map((el) => {
//     Country.findOrCreate({
//       where: { name: el.name },
//       defaults: {
//         id: el.id,
//         name: el.name,
//         image: el.img,
//         continent: el.continent,
//         capital: el.capital,
//         subregion: el.subregion,
//         area: el.area,
//         population: el.population,
//         maps: el.maps,
//       },
//     });
//   });
// };

// Syncing all the models at once.
conn.sync().then(() => {
  countriesTableLoad();

  server.listen(PORT, () => {
    console.log("%s listening at 3001"); // eslint-disable-line no-console
  });
});

// conn.sync({alter:true})
// (async () => {
//   await conn.sync({ force: true })

//   const info = await dataInfo() //info de la api

//   try {
//     const data = await Country.findAll() // data de la tabla
//     if (!data.length) {
//       await Country.bulkCreate(info) // llena la Db
//     }
//   } catch (error) {
//     console.log(error)
//   }

//   server.listen(PORT || 3000, () => {
//     console.log('%s listening at ', PORT || 3000) // eslint-disable-line no-console
//   })
// })()
