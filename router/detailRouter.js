const path = require('path')
const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
const { query } = require('../utils/mysql/mysqlPromise')
const { log } = require('console')

const router = express.Router()
const urlencoded = bodyParser.urlencoded({ extended: false })
const commentStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '../public/img/comment'))
  },
  filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
const commentUpload = multer({ storage: commentStorage, limits: { fileSize: 5242880 } })

router.get('/', async(req, response) => {
  /**
   * 额外功能 - 浏览量增加 - 插入shop_browser表
  */
  let sid = req.query.sid
  try {
    await query(`insert into shop_browser(sid) values(${sid})`)
    response.send('1')
  } catch(err) {
    // console.log('------------------------此处有误' ,err)
    response.statusCode = 400
    response.statusMessage = 'error'
    response.send('error')
  }

})

router.post('/collect', async(req, response) => {
  let sid = req.query.sid
  let uid = req.query.uid

  try {
    query(`insert into user_like(uid,sid) values(${uid}, ${sid})`)
    .then(val => {
      log(1111111)
      response.send('1')
    })
    .catch(err => {
      log(222222)
      response.statusCode = 400
      response.send('0') // 重复操作
    })
  } catch(err) {
    console.log('------------------------此处有误' ,err)
    response.statusCode = 500   // 500 是服务器错误
    response.send('-1')
  }
})

router.post('/like', urlencoded, async(req, response) => {
  /**
   * 点整功能
   * 参数：	uid=xxx & sid=xxxxlike=true|false&  商家ID
   * 附带:  符合要求后 修改商家表中的 slikenum字段  
  */
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

router.get('/top', async(req, response) => {
  /**
   * 头部信息
   * 参数: sid=xxx
  */
  let sid = req.query.sid
  let uid = req.query.uid

  try {
    let shopPromise = query(`select shopname,scanteen,slogo,slikenum from shopkeeper where sid=${sid}`)   
    let showPromise = query(`select img from shop_show where sid=${sid}`) 
    let commentPromise = query(`select avg(score) as avgscore,count(*) as count from shop_comment where sid=${sid}`)
    let likePromise = query(`select sid from shop_like where sid=${sid} and uid=${uid}`)
    let collectPromise = query(`select uid from user_like where sid=${sid} and uid=${uid}`)
    if (!uid) { // 没有uid参数时
      likePromise = Promise.resolve({results: []})
      collectPromise = Promise.resolve({results: []})
    }
    let promiseAllList = await Promise.all([
      shopPromise, showPromise,
      commentPromise, likePromise,
      collectPromise
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
    let isCollect = promiseAllList[4].results.length > 0 ? 1:0

    response.send({
      shopName,canteen,logo,likeNum,score,commentNum,isLike,isCollect,showList
    })
  } catch(err) {
    console.log('------------------------此处有误' ,err)
    response.statusCode = 400
    response.statusMessage = 'error'
    response.send('error')
  }

})

router.get('/menu', async(req, response) => {
  /**
   * 菜单列表
   * 参数:  sid=xxx
  */
  let sid = req.query.sid
  let sqlStr = `select mname,mimg,mprice,mid from shop_menu where sid=${sid} and visibility=1`

  try {
    let { results } = await query(sqlStr)
    response.send(results)
  } catch(err) {
    console.log('------------------------此处有误' ,err)
    response.statusCode = 400
    response.statusMessage = 'error'
    response.send('error')
  }
})

router.post('/order/add', urlencoded, async(req, response) => {
  /**
   * 预定功能
   * 参数:  uid=xxx sid=xxx mid=xxxx
   * 方法:  POST
  */
  let sid = req.body.sid
  let uid = req.body.uid
  let mid = req.body.mid

  try {
    let { results: menus } = await query(`select mname,mprice from shop_menu where mid=${mid}`)
    let mname = menus[0].mname
    let price = menus[0].mprice

    let { results: users } = await query(`select unickname from user where uid=${uid}`)
    let uname = users[0].unickname
    
    let { results } = await query(`insert into shop_order(sid,uid,mid,mname,uname,price) values(${sid},${uid},${mid},'${mname}','${uname}',${price})`)
    if (results.affectedRows > 0) {
      response.send('预定成功')
    } else {
      response.sendStatus(400).send('预定失败')
    }
    
  } catch(err) {
    console.log('------------------------此处有误' ,err)
    response.statusCode = 400
    response.statusMessage = 'error'
    response.send('application error')
  }
})

router.post('/order/remove', urlencoded, async(req, response) => {
  /**
   * 取消预约。  // 一个小时之内才能 取消预约
  */
  let id = req.body.id
  let sqlStr = `delete from shop_order where _id=${id} and unix_timestamp()-unix_timestamp(time) <= 3600` 
  try {
    let { results } = await query(sqlStr)
    if (results.affectedRows > 0) {
      response.send('取消预约成功')
    } else {
      response.statusCode = 400
      response.send('时间超时，取消失败')
    }
  } catch(err) {
    console.log('------------------------此处有误---', err)
    response.statusCode = 500
    response.statusMessage = 'error'
    response.send('error')
  }
})

router.get('/comment', async(req, response) => {
  let sid = req.query.sid

  try {
    let { results } = await query(`select unickname,uimg,imglist,score,content,time,response from (shop_comment left join user on shop_comment.uid=user.uid) where sid=${sid}`)
    let totalNum=results.length, goodNum=0, middleNum=0, badNum=0
    for (let resultRow of results) {  // 此循环是用来做 参评人数的功能
      if (resultRow.score >= 4) {
        goodNum++
      } else if (resultRow.score >= 2) {
        middleNum++
      } else {
        badNum++
      }

      if (resultRow.imglist.length ===2) {  // "[]"
        resultRow.imglist = null
      }
      let time = resultRow.time
      resultRow.time = new Date(time).toLocaleString('chinese', { hour12: false })
    }

    response.send({ totalNum, goodNum, middleNum, badNum, list: results })
  } catch(err) {
    console.log('------------------------此处有误---', err)
    response.statusCode = 500
    response.statusMessage = 'error'
    response.send('error')
  }
})

router.post('/comment', commentUpload.array('imglist', 4), async(req, response) => {
  let sid = req.query.sid
  let uid = req.query.uid  
  let score = req.body.score 
  let content = req.body.content || ''
  if (content.length >= 100) {
    response.statusCode = 400 // 客户端操作有误
    response.send('字数过多')
  }
  
  try {
    let imglist = req.files.map( item => path.posix.join('/public/img/comment', item.filename) )
      imglist = JSON.stringify(imglist)
    await query(`insert into shop_comment(sid,uid,score,content,imglist) values(${sid},${uid},${score},'${content}','${imglist}')`)
    response.send('1')
  } catch(err) {
    console.log('------------------------此处有误---', err)
    response.statusCode = 500
    response.statusMessage = 'error'
    response.send('error')
  }
})

module.exports = router