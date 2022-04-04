// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()


// 云函数入口函数
exports.main = async (event, context) => {
  let dbName = event.dbName;//集合名称
  let startRegion = event.startRegion;//集合名称
  let info = event[startRegion];//集合名称
  
  const { data } = await db.collection(dbName).get();//获取集合中的总记录数
  if(data.length === 0) {
    db.collection(dbName).add({
      data: {
        [startRegion]: [info],
      }
    })
  } else {
    let region = data[0][startRegion];
    let id = data[0]._id;
    if(region && region.length > 0) {
      region.push(info)
    } else {
      region = [info]
    }
    db.collection(dbName).doc(id).update({
      data: {
        [startRegion]: region,
      }
    })
  }

  return {
    success: true
  }
}