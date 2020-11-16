const path = require('path')
const bodyParser = require('body-parser')
const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
  res.send('<h1>首页</h1>')
})

module.exports = router