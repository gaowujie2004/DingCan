const path = require('path')
const bodyParser = require('body-parser')
const express = require('express')
const { query, connection } = require('../utils/mysql/mysqlPromise')
const router = express.Router()


router.get('/', async(req, response) => {
  let sid = req.query.sid
  let slqStr = `select imglist,score,content,response,time,uid from shop_comment where sid=${sid}`

  try {
    

  } catch(err) {
    console.log('有误', err)
    response.statusCode = 404
    response.statusMessage = 'MySql Query Error'
    response.send(err.stack)
  }
})

module.exports = router