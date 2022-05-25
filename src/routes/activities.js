const express = require('express')
const router = express.Router()

const { getActivity, postActivity } = require('../controllers')

router.post('/', postActivity)

router.get('/', getActivity)

module.exports = router
