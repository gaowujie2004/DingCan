var mysql = require("mysql");
var connection = mysql.createConnection({
    user: 'root',
    password: 'root',
    database: 'project',
    timezone: 'Asia/Shanghai',
})
 var Mysql = function(order,back){

    connection.query(order,function (err,data) {
        if (err) {
            console.log("数据拿取失败", err)
            back({})
        }else{
            back(data)
        }
    })
}
module.exports=Mysql;
// npm install 重新加载