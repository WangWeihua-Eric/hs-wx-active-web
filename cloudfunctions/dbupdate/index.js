// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const id = event.id
  const stepnumber = event.stepnumber

  return await db.collection('todo').doc(id).update({
    // data 传入需要局部更新的数据
    data: {
      stepnumber: stepnumber
    }
  })
}