const mysql = require('mysql')

const connection = mysql.createConnection({
  user: 'root',
  password: 'root',
  database: 'project'
})

connection.connect(err => {
  if (err) {
    console.log('----------------mysql链接失败, 程序自动退出\n' ,err)
    process.exit(-1)
  }
  console.log('MySql 连接成功')
})

exports.connection = connection

exports.query = (sqlStr, array)=> {
  return new Promise((resolve, reject) => {
    connection.query(sqlStr, array, (err, results, field) => {
      if (err) {
        reject(err)
      } else {
        resolve({results, field})
      }
    })
  })
}
