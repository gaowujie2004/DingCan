const path = require('path')
const bodyParser = require('body-parser')
const express = require('express')
const mysql = require('mysql')

const { connect, query } = require('../utils/mysql/mysqlPromise')

// MySql
const connection = mysql.createConnection({
  user: 'root',
  password: 'root',
  database: 'project'
})
connection.connect(err => {
  if (err) {
    console.error('Mysql 连接失败, 自动终止程序')
    process.exit(-1)
  } else {
    console.log('MySql 连接成功!!!');
  }
})


// 中间件
const router = express.Router()
router.use(bodyParser.urlencoded({extended: false}))

// 路由处理
/**
 * /home/base路由
 * 参数: sid=xxx & time=2020-1-1(可省略, 则为总共的)
*/
router.get('/base', (req, response) => {
  const sid = Number(req.query.sid)
  const date = new Date()

  // 预收入(今日|本月 shop_order) - 总订单量(今日订单量   shop_order) - 总点赞数(今日点赞量 shop_like) - 总浏览量(今日 shop_browser)

  // 订单数
  connection.query('select count(*) as count from \`shop_order\` where \`sid\`=?', [sid],(err, res) => {
    
    // 总订单量 - 查询
    let totalOrderNum = res[0].count

    // 今日订单量 - 查询
    connection.query(`select count(*) as count from \`shop_order\` where \`sid\`=${sid} and day(\`time\`)=day(curdate())`, (err, res) => {
      if (err) {
        console.log('错误', err);
      } else {
        let nowOrderNum = res[0].count

        // 订单数 - 昨日
        // connection.query(`select count(*) as count from shop_order where sid=${sid} and DATE(time)=DATE(DATE_SUB(curdate(),INTERVAL 1 DAY))`, (err, res) => {
        //   if (err) {
        //     console.log('有误', err.stack)
        //   } else {
        //     let yesOrderNum = res[0].count
        //     console.log('昨日: ', yesOrderNum)
        //   }
        // })
        // 预收入,
        connection.query(`select sid, price from shop_order where sid=${sid} and day(time)=day(curdate())`, (err, res) => {
          if (err) {
            return console.log('查询有误', err);
          }
          // 今日 预收入 - 查询
          let nowIncome = res.reduce((temp, item, index) => {
            return temp + item.price
          }, 0)

          // 本月 预收入 - 查询
          connection.query(`select price from shop_order where sid=${sid} and month(time)=month(curdate())`, (err, res, fields) => {
            if (err) {
              return console.log('有误', err);
            }
            let monthIncome = res.reduce((temp, item, index) => {
              return temp + item.price
            }, 0)
            
            // 总点赞数 - 查询
            connection.query(`select likenum from shop_like where sid=${sid}`, (err, res) => {
              if (err) {
                return console.log(err)
              }
              let totalLikeNum = res.reduce((temp, item, index) => {
                return temp + item.likenum
              }, 0)

              // 今日点赞量 - 查询
              connection.query(`select likenum from shop_like where sid=${sid} and day(time)=day(curdate())`, (err, res) => {
                if (err) {
                  return console.log(res)
                }
                let nowLikeNum = res.reduce((temp, item, index) => {
                  return temp + item.likenum
                }, 0)

                // 总的浏览量
                connection.query(`select num from shop_browser where sid=${sid}`, (err, res) => {
                  if (err) {
                   return console.log(err)
                  }
                  let totalBrowserNum = res.reduce((temp, item, index) => {
                    return temp + item.num
                  }, 0)

                  // 今日浏览量
                  connection.query(`select num from shop_browser where sid=${sid} and date(time)=date(curdate())`, (err, res) => {
                    if (err) {
                      return console.log(err)
                    }
                    let nowBrowserNum = res.reduce((temp, item, index) => {
                      return temp + item.num 
                    }, 0)

                    response.send({
                      nowBrowserNum,
                      totalBrowserNum,
                      nowLikeNum,
                      totalLikeNum,
                      monthIncome,
                      nowIncome,
                      nowOrderNum,
                      totalOrderNum
                    })
                    // 响应Body
                    
                  })
                })
              })
            })
          })
        })
      }
    })
  })
})

/**
 * /home/order
 * 参数: sid
 * 实时订单 - 手动刷新|实时刷新只要有人买了,就刷新
*/
router.get('/order', (req, response) => {
  const sid = Number(req.query.sid)

  connection.query(`select time, uname, mname from shop_order where sid=${sid} order by time desc limit 2`, (err, res) => {
    if (err) {
      response.statusCode = 400
      response.statusMessage = 'database query error'
      return 
    }
    response.send(res)
  })

  
})

/**
 * /home/income?sid=xxx
 * 参数: sid=xxx
 * 预收入 - 图表
*/
router.get('/income', (req, response) => {
  let sid = Number(req.query.sid)

  connection.query(`select sum(price) as dayprice,date(time) as daytime from shop_order where sid=${sid} group by date(time) order by daytime asc`, (err, res) => {
    if (err) {
      response.statusCode = 400
      response.statusMessage = 'database query error'
      return console.log(err)
    }
    res = res.map(item => {
      let daytime = new Date(item.daytime).toLocaleDateString('chinese', { hour12: false })
          daytime = daytime.replace(/\//g, '-')
      return {daytime, dayprice: item.dayprice}
    })
    response.send(res)
  })
})

/**
 * /home/top?sid=xxx
 * 参数: sid=xxx
 * 本店 预定Top榜
*/
router.get('/top', (req, response) => {
  let sid = Number(req.query.sid)

  connection.query(`select mname, count(*) as reservenum from shop_order where sid=${sid} group by mname order by reservenum desc limit 5`, (err, res) => {
    if (err) {
      response.statusCode = 400
      response.statusMessage = 'database query error'
      return console.log(err)
    }
    console.log(res)
    response.send(res)
  })
})



module.exports = router