const api = require("./src/api_global_restcountries.json");
const dotnev = require("dotenv");
const cors = require("cors");
const server = require("./src/app.js");
const { conn, Country } = require("./src/db.js");
const axios = require("axios").default;
dotnev.config();
server.use(cors());

const PORT = process.env.PORT || 3000;

/**LLAMAMOS A LA API */
const getAll = async () => {
  try {
    // const response = await axios("https://restcountries.com/v3.1/all/");
    // const data = await response.data.map((res) => {
    const data = api.map((res) => {
      return {
        id: res.cca3,
        name: res.name.common && res.name.common,
        //img: res.flags && res.flags.map((flag) => flag),
        img: res.flags && res.flags.png,
        continent: res.continents && res.continents.map((el) => el),
        capital: res.capital ? res.capital.map((el) => el) : ["no data"],
        subregion: res.subregion,
        area: res.area,
        population: res.population,
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
      },
    });
  });
};

// Syncing all the models at once.
conn.sync({ alter: true }).then(() => {
  countriesTableLoad();

  server.listen(PORT, () => {
    console.log("%s listening at 3001"); // eslint-disable-line no-console
  });
});
