var express=require("express");
var path = require('path');
var mysql=require("../utils/mysql/mysql");
var multer=require('multer');
var upload=multer({dest:'./public/img/user'});
var bodyParser = require('body-parser')

var userRouter = express.Router();
var urlencoded = bodyParser.urlencoded({extended: false});
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join( __dirname, '../public/img/user/'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
var upload = multer({ storage: storage })

userRouter.use(urlencoded)

var siginUpload = upload.fields([{name: 'slogo'}, {name: 'showlist'}])

// 注册
userRouter.post('/sigin', siginUpload, (req, response, next) => {
	let {
		sname,
		spwd,
		shopname,
		scanteen,
		slogan
    } = req.body

	let slogo = path.posix.join('/public/img/user', req.files.slogo[0].filename)
	let showList = req.files.showlist.map(v => `/public/img/user/${v.filename}`)
	
	let sqlStr1 = `insert into shopkeeper(sname,spwd,scanteen, shopname,slogo,slogan) values('${sname}', '${spwd}','${shopname}', '${scanteen}', '${slogo}','${slogan}')`

	mysql(sqlStr1, results => {
		let sid = results.insertId		
		let valuesStr = `values(${sid}, '${showList.shift()}')`
		for (let imgStr of showList) {
			valuesStr += `,(${sid}, '${imgStr}')`	
		}
		mysql(`insert into shop_show(sid,img) ${valuesStr}`, results => {
			if (results.affectedRows >= 1) {
				return response.send('1')
			}
			response.send('0')
		}, response)
	}, response)
})

//登录
userRouter.post('/login', function(req,res){
    var sname = req.body.sname
		var spwd = req.body.spwd
    mysql(`select sid from shopkeeper where sname='${sname}' and spwd='${spwd}'`,function (success) {
        if(success.length === 1){
            req.session.sid = success[0].sid
            req.session.isLogin = true
            res.send("1")
            
        }else{
            res.send("0")   
        }
    }, res)
});

// 用户退出.
userRouter.post('/exit', function(req, res){
    req.session.destroy(e => {
        res.send('1')
    })
})

// 用户名检测
userRouter.get('/sigincheck', (req, response) => {
    try {
        var sname = req.query.sname
        if (sname.length < 6 || sname.length > 20) {
            return response.send('0')
        } 
        mysql(`select sname from shopkeeper where sname='${sname}'`, function(results) {
            if (results.length > 0) {
                // 用户名重复
                return response.send('0')
            }
            // 可以使用
            response.send('1')
        }, response)
    } catch(err) {
        response.send('error', err)
    }
})

// 信息
userRouter.get('/info', (req, response) => {
    try {
        let sid = req.query.sid
        mysql(`select shopname as sname, slogo as simg from shopkeeper where sid = ${sid}`, function(res){
            let mname =  res[0].sname
            let mimg = res[0].simg 
        
            console.log(res)
            response.send({mname, mimg})
        }, response)
    } catch(err) {
        response.send('500')
    }
})

module.exports=userRouter;