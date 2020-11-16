const mysql = require('mysql')

const connection = mysql.createConnection({
  user: 'root',
  password: 'root',
  database: 'project'
})

connection.connect(err => {
  if (err) {
    console.log(err)
    process.exit(-1)
  }
  console.log('MySql 连接成功')
})

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
