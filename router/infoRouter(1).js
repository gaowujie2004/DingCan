var express=require("express");
var mysql=require("../utils/mysql");
const multer=require('multer');
var infoRouter = express.Router();
var path=require("path");

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join( __dirname,  '../public/img/user'))
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname) )
	}
});  
var upload = multer({ storage: storage });



//  查看所有
infoRouter.post("/info/select",function(req,res){
    mysql(`select * from shopkeeper where sid=${req.body.sid}`,function(success){
        if(success){
            mysql(`select * from shop_show where sid=${req.body.sid}`,function(succ){
                var str ="";
               var length=succ.length;
            //    console.log(length)
               for(var i=0;i<length;i++){
                   str+=`${succ[i].img}`
               }
               console.log(str)
            res.send(JSON.stringify(success)+str)
            })
        }else{
            res.send("错误")
        }
    })
})

infoRouter.post('/slogan', () => {})
infoRouter.post('/logo', upload.single('logo'), function(req, res) { 
	let filename =  '/public/img/user/' + req.file.filename 

})
infoRouter.post('/showList', upload.array('showList'), function(req, res) {
	// req.files    数组 
})



module.exports=infoRouter;
