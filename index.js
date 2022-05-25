const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
require('dotenv').config()

app.listen(process.env.PORT || 3001)
console.log('Server on port', process.env.PORT || 3001)
