// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  console.log(event, context)
  try {
    const {
      OPENID
    } = cloud.getWXContext()
    const result = await cloud.openapi.subscribeMessage.send({
        touser: OPENID, // 通知当前openid
        page: `/pages/subscribeHistory/subscribeHistory`,
        lang: 'zh_CN',
        data: {
          thing1: { // 车主
            value: event.name
          },
          thing2: { // 出发地
            value: event.startLocation
          },
          thing3: { // 目的地
            value: event.endLocation
          },
          time4: { // 发车时间
            value: event.exactDate
          },
          phone_number5: { // 车主电话
            value: event.phone
          }
        },
        templateId: 'mYUqRgxDsJkV1Ebdi80T0aDHtY0u2H0a0rGsSIQGcos',
        miniprogramState: 'trial'
      })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}