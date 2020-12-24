const path = require('path')
const bodyParser = require('body-parser')
const express = require('express')
const { query, connection } = require('../utils/mysql/mysqlPromise')
const router = express.Router()


router.get('/', async(req, response) => {
  let sid = req.query.sid
  response.send([req.session, req.session.id, `已经加载的session ID ${req.sessionID}`])
})

module.exports = router