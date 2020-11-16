const path = require('path')
const express = require('express')
const { query } = require('../utils/mysql/mysqlPromise')
const { countReset } = require('console')

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
    let start = req.query.start
    let end = req.query.end
    let sqlStr

    // 类型判断 日期 - 月 - 周
    if (type === 'date') {  //  年月日
      if (time === '') {    //  今日订单
        sqlStr = `select _id,price,time,uname,mname from shop_order where sid=${sid} and date(time)=curdate()`
      } else {
        sqlStr = `select _id,price,time,uname,mname from shop_order where sid=${sid} and date(time)=date('${time}')`
      }
    }

    if (type === 'month') { // 年月   前端格式: 2020-09
      let [ year, month ] = time.split('-')
      console.log(year, month, time)
      sqlStr = `select _id,price,time,uname,mname from shop_order where sid=${sid} and year(time)='${year}'  and month(time)='${month}'`
    }

    if (type === 'range') { // 范围   前端格式
      sqlStr = `select _id,price,time,uname,mname from shop_order where sid=${sid} and (time between '${start}' and '${end}')`
    }

    // 开始查询
    let { results } = await query(sqlStr).catch(err => ({results: err}))
    // 对数据进一步处理
    let groupArray = []
    for (let item of results) {
      let curObj = groupArray.find(value => value.mname === item.mname)
      if (curObj) {
        // 找到重名的菜
        curObj.list.push({id: item._id, price: item.price, time: item.time, uname: item.uname})
      } else {
        // 新的菜
        groupArray.push({mname: item.mname, list: [{ id: item._id, price: item.price, time: item.time, uname: item.uname }]})
      }
    }
    groupArray.forEach(value => {
      value.length = value.list.length
      value.total = value.list.reduce((temp, item) => {
        return temp + item.price
      }, 0)
    })
    response.send(groupArray)

    // countResult - 汇总一下 - 上面以及完成这个功能
    // let contResult = groupArray.map(item => {
    //   let mname = item.mname
    //   let length = item.list.length
    //   let total = item.list.reduce((temp, item) => temp+item.price, 0)
    //   return {mname: item.mname, length, total}
    // })
    // console.log(contResult)
  } catch(err) {
    console.log('有误', err)
    response.statusCode = 404
    response.statusMessage = 'MySql Query Error'
    response.send(err.stack)
  }
})

module.exports = router