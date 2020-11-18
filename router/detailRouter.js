const path = require('path')
const bodyParser = require('body-parser')
const express = require('express')
const { query } = require('../utils/mysql/mysqlPromise')
const { log } = require('console')

const router = express.Router()
const urlencoded = bodyParser.urlencoded({ extended: false })
/**
 * 点整功能
 * 参数：	uid=xxx & sid=xxxxlike=true|false&  商家ID
 * 附带:  符合要求后 修改商家表中的 slikenum字段  
*/
router.post('/like', urlencoded, async(req, response) => {
  let sid = req.body.sid 
  let uid = req.body.uid 
  let like = req.body.like

  try {
    if (like === 'true') {
      await query(`insert into shop_like(sid,uid) values(${sid}, ${uid})`)
      response.send('ok')
      query(`update shopkeeper set slikenum=slikenum+1 where sid=${sid}`)

    } else {
      let { results } = await query(`delete from shop_like where sid=${sid} and uid=${uid}`)
      if (results.affectedRows > 0) {
        query(`update shopkeeper set slikenum=slikenum-1 where sid=${sid}`)
        response.send('ok')
      } else {
        response.send('无效操作')
      }
      
    }
  } catch(err) {
    // console.log('------------------------此处有误' ,err)
    response.statusCode = 400
    response.statusMessage = 'error'
    response.send('error')
  }
})


/**
 * 头部信息
 * 参数: sid=xxx
*/
router.get('/top', async(req, response) => {
  let sid = req.query.sid
  let uid = req.query.uid

  try {
    let shopPromise = query(`select shopname,scanteen,slogo,slikenum from shopkeeper where sid=${sid}`)   
    let showPromise = query(`select img from shop_show where sid=${sid}`) 
    let commentPromise = query(`select avg(score) as avgscore,count(*) as count from shop_comment where sid=${sid}`)
    let likePromise = query(`select sid from shop_like where sid=${sid} and uid=${uid}`)
    let promiseAllList = await Promise.all([
      shopPromise, showPromise,
      commentPromise, likePromise
    ])
    let { shopname: shopName, scanteen: canteen, slogo: logo, slikenum: likeNum } = promiseAllList[0].results[0]   // ok
    let showList = promiseAllList[1].results.reduce((temp, item) => {
      if (item.img) {
        temp.push(item.img)
      }
      return temp
    }, [])
    let commentObj = promiseAllList[2].results[0]
    let score = commentObj.avgscore.toFixed(2)
    let commentNum = commentObj.count
    let isLike = promiseAllList[3].results.length > 0 ? 1:0
    log(score, commentNum, isLike)
    response.send(promiseAllList)
  } catch(err) {
    console.log('------------------------此处有误' ,err)
    response.statusCode = 400
    response.statusMessage = 'error'
    response.send('error')
  }

})

module.exports = router