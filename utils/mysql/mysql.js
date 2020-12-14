var mysql = require("mysql");
var connection = mysql.createConnection({
    user: 'root',
    password: 'root',
    database: 'project',
    timezone: 'Asia/Shanghai',
})
var Mysql = function(order,back, response){
    connection.query(order,function (err,data) {
        if (err) {
            if (response) {
                response.statusCode = 500
                response.send('error')
            }
            console.log("---数据库查询失败---数据拿取失败", err)
        }else{
            back(data)
        }
    })
}
module.exports=Mysql