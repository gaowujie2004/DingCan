const express = require('express')
const path = require('path')

const testRouter = require('./router/testRouter')
const indexRouter = require('./router/indexRouter')
const homeRouter = require('./router/homeRouter2')
const orderRouter = require('./router/orderRouter')
const commentRouter = require('./router/commentRouter')

// 以下是顾客的路由
const detailRouter = require('./router/detailRouter') 

const app = express()
app.use('/', indexRouter)
app.use('/home', homeRouter)
app.use('/order', orderRouter)
app.use('/comment', commentRouter)
app.use('/test', testRouter)
app.use('/detail', detailRouter)

app.listen(2020, () => {
  console.log('WEB服务开启成功! Port:2020');
})