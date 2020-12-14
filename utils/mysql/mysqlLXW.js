var mysql = require("mysql");
var connection = mysql.createConnection({
    user: 'root',
    password: 'root',
    database: 'project',
    timezone: 'Asia/Shanghai',
})
 var Mysql = function(order,back){
     console.log(order)
    //  console.log(connection)
    connection.query(order,function (err,data) {
        if (err) {
            console.log("数据拿取失败", err)
            back({})
        }else{
            // connection.end();
            // back(data)  
            console.log(data)
            back(data)
        }
    })
}
module.exports=Mysql;
// npm install 重新加载