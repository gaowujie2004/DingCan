const path = require('path')
const bodyParser = require('body-parser')
const express = require('express')
const router = express.Router()

router.get('/', (req, response) => {
  response.send('<h1 style="height:100vh; display: flex; align-items: center; justify-content: center;">TEST Page</h1>')

  console.log(req.query)
})

module.exports = router