// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const sendDate = event.sendDate

  return await db.collection('todo').add({
    // data 字段表示需新增的 JSON 数据
    data: sendDate
  })
}