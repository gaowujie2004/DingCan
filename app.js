const express = require('express')
const path = require('path')

const userRouter = require('./router/userRouter')
const indexRouter = require('./router/indexRouter')
const homeRouter = require('./router/homeRouter2')
const orderRouter = require('./router/orderRouter')
const commentRouter = require('./router/commentRouter')
const testRouter = require('./router/testRouter')

const app = express()
app.use('/public', express.static( path.join(__dirname, 'public') ))

app.use('/', indexRouter)
app.use('/user', userRouter)
app.use('/home', homeRouter)
app.use('/order', orderRouter)
app.use('/comment', commentRouter)
app.use('/test', testRouter)

app.listen(2020, () => {
  console.log('WEB服务开启成功! Port:2020');
})