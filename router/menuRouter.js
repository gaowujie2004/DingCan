var express=require("express");
var mysql=require("../utils/mysql/mysqlLXW");
var multer=require('multer');
var urlencoded = express.urlencoded({ extended:false })
var upload=multer({dest:'./public/img/'});
var fs = require('fs');
var Router = express.Router();
var path=require("path")


//  查看所有
Router.get("/select",function(req,res){
    let sid = req.query.sid
    let page = req.query.page || 1  // 当前在第几页
    let num = req.query.num || 10   // 每页最多10条数据
    let totalPage                    // 总页数
    let totalNum                  // 总共多少条数据
    mysql(`select * from shop_menu where sid=${sid} limit ${(page-1)*num}, ${num}`,function(success1){
        if(success1) {
            mysql(`select count(*) as count from shop_menu where sid=${sid}`, function(success2){
                let totalNum = success2[0].count
                let totalPage = Math.ceil( totalNum / num )
                res.send({ data: success1, totalPage, totalNum })
            })
            
        } else{
            res.send("0")
        }
    })
})


//  增加一条数据     图片文件上传
Router.post("/insert",upload.single("mimg"),function(req,res){
	var oldFile=req.file.destination+req.file.filename;	//指定旧文件
	console.log(req.body)
	var Document=req.file.originalname
	var xs=Document.indexOf(".")
	var ss=Document.substr(0,xs)+".png"
	// console.log(ss)
	var newFile=req.file.destination + ss;	//指定新文件
    console.log(req.file)
    var pot=req.file.destination+ss
    var pots=pot.slice(pot.indexOf(".")+1)
	fs.rename(oldFile,newFile,function(err){
		if(err){
			res.send('0');
		}else{
    var sid = req.query.sid
    var mname = req.body.mname
    var mimg = `${pots}`
    var mprice = req.body.mprice
 
    console.log(mimg)
    console.log(` insert into shop_menu(sid, mname, mimg, mprice, visibility) values(${sid}, '${mname}', '${mimg}', ${mprice}, '1')`)
    // mysql(` insert into shop_menu(sid, mname, mimg, mprice, visibility) values(${sid}, '${mname}', '${mimg}', ${mprice}, '1')`,function (success) {
    //     if(success.affectedRows===1){
    //         res.send("1")
    //     }else{
    //         res.send("0")
    //     }
    // })
		}
	});
});

//  删除
Router.get("/delete",function (req,res) {
    mysql(`delete from shop_menu where mid=${req.query.mid}`,function (success) {
        if(success.affectedRows==1){
            res.send("1")
        }else{
            res.send("0")
        }
    })
})

//   修改  上架、下架   菜名 价格 
Router.post("/update",urlencoded, function (req,res) {
    // var shop=req.url.replace("/","")
    console.log(req.body)
    var shop =Object.keys(req.body)[1]
    var shopTable=req.body[`${Object.keys(req.body)[1]}`]
    var mid =req.body.mid
    let sqlStr
    if (typeof shopTable === 'number') {
        sqlStr = `update shop_menu set  ${shop}=${shopTable} where mid=${mid}`
    } else {
        sqlStr = `update shop_menu set  ${shop}='${shopTable}' where mid=${mid}`
    }
    mysql(sqlStr, function (success) {
        if(success){
            res.send('1')
        }else{
            res.send("0")
        }
    })
})


module.exports=Router;