// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  try {
    let id = event.id;

    //绑定乘客信息
    const data = await db.collection("subscribeHistory")
    .doc(id).remove()
    return data
  }
  catch (e) {
    console.error(e)
    return []
  }
}