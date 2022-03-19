// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  /**
   * 获取用户注册信息
   */
  const { data = [] } = await db.collection('User').where({
    _openid: wxContext.OPENID,
  }).field({
    name: true,
    phone: true,
  }).get();

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    info: data[0]
  }
}