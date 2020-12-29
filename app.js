const express = require('express')
const path = require('path')
const session = require('express-session')
const mysqlStore = require('express-mysql-session')(session)

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
const HOUR = 1000 * 60 * 60 // hour 毫秒数
const sessionMysqlOptions = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'project'
}
const sessionStore = new mysqlStore(sessionMysqlOptions)
const sessionOptions = {
  secret: 'haah BBB-gwj',
  key: 'gwj_sid',
  resave: true,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { 
    maxAge: HOUR*24*7,
    httpOnly: true,
    path: '/'
  }
}
app.use(session(sessionOptions))

// 权限控制
app.use((req,res,next) => {
  if (req.session.isLogin) {
    req.query.sid = req.session.sid
  } else {
    req.query.sid = -1
  }
  next()
})


// 页面路由
app.get('/', (req, res) => {
  res.sendFile(path.join( __dirname, 'view/tip3.html'))
})
app.get('/index', (req, res) => {
  if (req.session.isLogin) {
    res.sendFile(path.join( __dirname, 'view/index.html'))
  } else {
    res.sendFile(path.join( __dirname, 'view/tip2.html'))
  }
  
})
app.get('/login', (req, res) => {
  if (req.session.isLogin) {
    res.sendFile(path.join( __dirname, 'view/index.html'))
  } else {
    res.sendFile(path.join( __dirname, 'view/login2.html'))
  }
  
})
app.get('/sigin', (req, res) => {
  res.sendFile(path.join( __dirname, 'view/sigin2.html'))
})



// API路由中间件
app.use('/public/img', express.static( path.join(__dirname, '../DIngCan-Public/img') ))
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