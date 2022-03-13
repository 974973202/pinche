// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // const {
    //   OPENID
    // } = cloud.getWXContext()
    const result = await cloud.openapi.subscribeMessage.send({
        // touser: event.openid, // 司机的openid
        touser: event.carOpenid,
        page: `/pages/myPublish/myPublish`,
        lang: 'zh_CN',
        data: {
          thing1: { // 预约用户
            value: event.name
          },
          phone_number2: { // 联系方式
            value: event.phone
          },
          thing3: { // 始发地
            value: event.startLocation
          },
          thing4: { // 目的地
            value: event.endLocation
          },
          time5: { // 预约时间
            value: event.exactDate
          }
        },
        templateId: 'nLY1ZuV01mAGSp9stU3gmYSpejgQ_DtQHoqPW8yltcg',
        miniprogramState: event.miniprogramState
      })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}