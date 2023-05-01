const { Country, Activity } = require("../db");
const { Op } = require("sequelize");

module.exports = {
  getAll: function (req, res, next) {
    let name = req.query.name;
    if (name) {
      const country = Country.findAll({
        include: Activity,
        where: {
          name: { [Op.iLike]: `%${name}%` },
        },
      });
      country
        .then((data) => res.status(200).json(data))
        .catch((err) => res.status(404).json("no countries found", err));
    } else {
      let data = Country.findAll({
        include: {
          model: Activity,
          atributes: ["name", "difficulty", "duration", "season"],
          through: {
            atributes: [],
          },
        },
      });
      data
        .then((aux) => res.status(200).json(aux))
        .catch((err) => res.status(404).json("not countries found", err));
    }
  },

  getById: function (req, res, next) {
    let newId = req.params.id;
    if (newId) {
      let data = Country.findOne({
        include: Activity,
        where: {
          id: { [Op.iLike]: `%${newId}%` },
        },
      });
      data
        .then((aux) => res.status(200).json(aux))
        .catch((err) => res.status(404).json("not country found", err));
    } else {
      console.log("not country found");
      next(err);
    }
  },

  postActivity: async function (req, res, next) {
    try {
      let { name, difficulty, duration, season, idCountry } = req.body;
      const data = await Activity.create({
        name,
        difficulty,
        duration,
        season,
      });
      console.log(data);
      const country = await Country.findAll({
        where: {
          id: idCountry,
        },
        attributes: ["id"],
      });
      console.log(country);
      data.addCountry(country);
      res.status(200).json(data);
    } catch (err) {
      res.status(404).json("Activity do not created", err);
    }
  },

  getActivity: async function (req, res, next) {
    try {
      let allActivities = await Activity.findAll({
        atributes: ["name", "difficulty", "duration", "season"],
        through: {
          atributes: [],
        },
      });

      return res.status(200).json(allActivities);
    } catch (err) {
      res.status(404).json("no se encontraron actividades", err);
    }
  },
};
