const path = require('path')
const express = require('express')
const { query } = require('../utils/mysql/mysqlPromise')

const router = express.Router()
/**
 * URL: /order
 * 参数: type=month|day    time=时间 可以省略表示当前日期
*/
router.get('/', async (req, response) => {
  try {
    let sid = Number(req.query.sid)
    let type = req.query.type
    let time = req.query.time
    let sqlStr

    // 类型判断 日期 - 月 - 周
    if (type === 'date') {  // 年月日
      if (time === '') {   // 今日订单
        sqlStr = `select * from shop_order where sid=${sid} and date(time)=curdate()`
      } else {
        sqlStr = `select * from shop_order where sid=${sid} and date(time)=date('${time}')`
      }
    }

    if (type === 'month') { // 年月
      sqlStr = `select * from shop_order where sid=${sid} and year(time)=year('${time}')  and month(time)=month('${time}')`
    }

    if (type === 'week') {  // 年周
      sqlStr = `select * from shop_order where sid=${sid} and year(time)=year('${time}') and week(time)=week('${time}')`
    }

    let { results } = await query(sqlStr)
    response.send(results)
    console.log(results.length)

  } catch(err) {
    console.log(err)
    response.sendStatus(400).send('database query error')
  }
})

module.exports = router