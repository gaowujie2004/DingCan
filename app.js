const express = require('express')
const path = require('path')

const userRouter = require('./router/userRouter')
const indexRouter = require('./router/indexRouter')
const homeRouter = require('./router/homeRouter2')
const orderRouter = require('./router/orderRouter')
const menuRouter = require('./router/menuRouter')
const commentRouter = require('./router/commentRouter')
const infoRouter = require('./router/infoRouter')
const testRouter = require('./router/testRouter')

const app = express()
// CORS
app.use((req,res,next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

// 页面路由
app.get('/', (req, res) => {
  res.sendFile(path.join( __dirname, 'view/tip.html'))
})
app.get('/index', (req, res) => {
  res.sendFile(path.join( __dirname, 'view/index.html'))
})
app.get('/login', (req, res) => {
  res.sendFile(path.join( __dirname, 'view/login.html'))
})
app.get('/sigin', (req, res) => {
  res.sendFile(path.join( __dirname, 'view/sigin.html'))
})
app.get('/test', (req, res) => {
  res.sendFile(path.join( __dirname, 'view/test.html'))
})


// API路由中间件
app.use('/public', express.static( path.join(__dirname, 'public') ))
app.use('/', indexRouter)
app.use('/user', userRouter)
app.use('/home', homeRouter)
app.use('/order', orderRouter)
app.use('/menu', menuRouter)
app.use('/comment', commentRouter)
app.use('/info', infoRouter)
app.use('/test', testRouter)

app.listen(2020, () => {
  console.log('WEB服务开启成功! Port:2020');
})