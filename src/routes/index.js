const { Router } = require('express')

//const countryRouter = require('./countries')
//const activityRouter = require('./activities')
const router = Router()

//router.use('/countries', countryRouter)
//router.use('/activities', activityRouter)

router.get('/', (req, res) => {
  res.send('Hello World!')
})

module.exports = router
