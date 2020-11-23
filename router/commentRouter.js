const path = require('path')
const bodyParser = require('body-parser')
const express = require('express')
const { query } = require('../utils/mysql/mysqlPromise')

const router = express.Router()
const urlencoded = bodyParser.urlencoded({extended: false})
/**
 * URL: /comment?sid=xxx
 * 参数: sid=xxx
*/
router.get('/', async(req, response) => {
  let sid = req.query.sid

  try {
    let sqlStr = `select unickname,uimg,imglist,score,content,response,time from (shop_comment left join user on shop_comment.uid=user.uid) where sid=${sid}`
    let { results } = await query(sqlStr)
    // time - 这时是UTC格式
    results.forEach(item => {
      item.time = new Date(item.time).toLocaleString('chinese', { hour12: false })
    })
    response.send(results)
    // console.log(results)
  } catch(err) {
    response.statusCode = 400
    response.statusMessage = 'error'
    response.send('error')
    console.log('此处有误' ,err)
  }
})


/**
 * 概括:  放商家的回复信息
 * URL:  /comment/response
 * 参数: sid=xxx & uid=xxx & response=xxxx
 * 方法:  POST
*/
router.post('/response', urlencoded ,async(req, response) => {
  let id = req.body.id
  let responseText = req.body.response

  try {
    let sqlStr = `update shop_comment set response='${responseText}' where _id=${id}`
    let { results, field } = await query(sqlStr)

    if (results.affectedRows > 0) {
      response.send('1')
    } else {
      response.send('0')
    }
  } catch(err) {
    response.statusCode = 400
    response.statusMessage = 'error'
    response.send('0')
    console.log('此处有误' ,err)
  }
})

module.exports = router