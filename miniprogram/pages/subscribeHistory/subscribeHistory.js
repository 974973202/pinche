const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    subscribeData: [],
  },

  onLoad() {
    const openid = app.globalData.info.openid;
    this.setData({
      openid,
    });
    this.getSubHistory(openid);
  },

  getSubHistory(_openid) {
    db.collection("subscribeHistory")
      .where({ _openid })
      .orderBy('exactDate', 'desc')
      .get()
      .then((res) => {
        console.log(res.data);
        this.setData({
          subscribeData: res.data,
        });
      });
  },

  // status 0未上车 1已上车 2已下车
  // subscribeStatus 0未上车 1已上车 2完成订单
  async handleDrive(e) {
    let id = e.currentTarget.dataset.id;
    let myid = e.currentTarget.dataset.myid;
    let phone = e.currentTarget.dataset.phone;
    let type = e.currentTarget.dataset.type;
    // passengerInfo 乘客信息
    let { data: { passengerInfo = [], peopleNumber } } = await db.collection('CarPublish').doc(id).get();
    
    // 取消订单 删除订单
    if(type === 'cancel') {
      let info = []
      let num = 0
      passengerInfo.forEach(ele => {
        if(ele.phone != phone) {
          info.push(ele)
        } else {
          num = ele.number
        }
      });

      db.collection('CarPublish')
      .doc(id)
      .update({
        data: {
          passengerInfo: info,
          peopleNumber: Number(peopleNumber) + Number(num)
        },
        success: (res) => {
          console.log(res);
          wx.cloud.callFunction({
            name: 'delSubscriptHistory',
            data: {
              id:myid
            },
            success: res => {
              console.log(res)
              this.getSubHistory(this.data.openid);
            },
            fail: err => {
            }
          })
        },
        fail: console.error,
      })

      // 我已上车，我已到达
    } else {
      if(type == 'down') {
        const len = passengerInfo.filter(ele => ele.status > 0)
        if(len.length != passengerInfo.length) {
          return wx.showToast({ title: "有乘客未上车", icon: "error" });
        }
      }

      passengerInfo.forEach(ele => {
        if(ele.phone == phone) {
          ele.status = type == 'up' ? 1 : 2; // 1我已上车 2我已下车
        }
      })
      console.log(passengerInfo,'passengerInfo')
      db.collection('CarPublish')
      .doc(id)
      .update({
        data: {
          passengerInfo: passengerInfo,
        },
        success: (res) => {
          console.log(res);
          // ---  subscribeHistory
          db.collection("subscribeHistory")
          .where({ _id: myid })
          .update({
            data: {
              subscribeStatus: type == 'up' ? 1 : 2,
            },
          })
          .then((res) => {
            this.getSubHistory(this.data.openid);
          });
        },
        fail: console.error,
      })
    }

    
  },

  // onCompleteOrder(e) {
  //   let id = e.currentTarget.dataset.id;
  //   db.collection("subscribeHistory")
  //     .where({ _id: id })
  //     .update({
  //       data: {
  //         subscribeStatus: 2,
  //       },
  //     })
  //     .then((res) => {
  //       console.log(res);
  //       // this.setData({
  //       //   subscribeStatus: 1,
  //       // })
  //     });
  // },
  onCall(e) {
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    });
  },
});
