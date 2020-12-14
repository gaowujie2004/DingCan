var express = require("express");
var mysql = require("../utils/mysql/mysqlLXW");
var multer = require('multer');
var infoRouter = express.Router();
var path = require("path");
const { info } = require("console");

var urlencoded = express.urlencoded({extended:false})
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../public/img/user'))
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname))
	}
})
var upload = multer({ storage: storage })


// 查看
infoRouter.get("/select", function (req, res) {
	let sid = req.query.sid

	mysql(`select 
					shopkeeper.sid,
					shopname,
					scanteen,
					slogan,
					group_concat(distinct content) as keyword,
					slogo,
					group_concat(distinct img) as showlist 
				from (
					shopkeeper left join shop_category on shopkeeper.sid = shop_category.sid
					left join shop_show on shopkeeper.sid = shop_show.sid
				)
				where shopkeeper.sid=1 group by sid`, function (success) {
		if (success) {
			success.forEach(v => {
				v.showlist = v.showlist.split(',')
				v.keyword = v.keyword.split(',')
			})
			res.send(success) 
		} else {
			res.send('0')
		}
	})
})


//修改 slogan
infoRouter.post("/up/slogan",urlencoded, function (req, res) {
	let sid = req.body.sid
	let slogan = req.body.slogan
	mysql(`update shopkeeper set slogan='${slogan}' where sid=${sid}`, function (success) {
		if (success.affectedRows == 1) { 
			res.send("1") 
		} else {
			res.send("0")
		}
	})
})

//修改 logo
infoRouter.post('/up/logo', upload.single('slogo'), function (req, res, next) {
	let sid = req.body.sid
	let slogo = path.posix.join('/public/img/user', req.file.filename)

	mysql(`update shopkeeper set slogo='${slogo}' where sid=${sid}`, function (success) {
		if (success.affectedRows == 1) { 
			res.send("1") 
		} else {
			res.send("0")
		}
	})
})

// 修改展示图片
infoRouter.post('/up/showimg', upload.single('showimg'), function (req, res, next) {
	try {
		let oldName = req.body.oldname.trim()    // 旧图片名
		let sid = req.body.sid
		let showImg = path.posix.join('/public/img/user', req.file.filename)

		mysql(`update shop_show set img='${showImg}' where sid=${sid} and img='${oldName}'`, function (success) {
			if (success.affectedRows == 1) { 
				res.send("1") 
			} else {
				res.send("0")
			}
		})
	} catch(err) {
		console.log(err)
		res.send('0')
	}
})

// 添加展示图片
infoRouter.post('/add/showimg', upload.single('showimg'), function (req, res, next) {
	try {
		let sid = req.body.sid
		let showImg = path.posix.join('/public/img/user', req.file.filename)

		mysql(`insert shop_show(sid,img) values(${sid}, '${showImg}')`, function (success) {
			if (success.affectedRows == 1) { 
				res.send("1") 
			} else {
				res.send("0")
			}
		})
	} catch(err) {
		console.log(err)
		res.send('0')
	}
})

//  更新关键字/添加
infoRouter.post("/up/content", urlencoded, function (req, res) {
	let sid = req.body.sid
	
	let newContent = req.body.newcontent
	let oldContent = req.body.oldcontent || newContent

	console.log(oldContent, newContent)

	mysql(`insert into shop_category(sid,content) value(${sid}, '${oldContent}') on duplicate key update content='${newContent}'`, function (success) {
		if (success.affectedRows >= 1) { 
			res.send("1") 
		} else {
			res.send("0")
		}
	})
})

module.exports = infoRouter;
