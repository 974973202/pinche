// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  try {
    let dbName = event.dbName;//车主发布的这条合乘信息
    let passengerInfo = event.passengerInfo;
    let peopleNumber = event.peopleNumber; // 预约成功人数-1
    let _id = event.id;

    //绑定乘客信息
    const carInfo = await db.collection(dbName).where({
      _id
    }).update({
      data: {
        passengerInfo: _.push(passengerInfo),
        peopleNumber: peopleNumber-1
      }
    })

    return carInfo
  }
  catch (e) {
    console.error(e)
    return []
  }
}