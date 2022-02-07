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
      .get()
      .then((res) => {
        console.log(res.data);
        this.setData({
          subscribeData: res.data,
        });
      });
  },

  onCompleteOrder(e) {
    let id = e.currentTarget.dataset.id;
    db.collection("subscribeHistory")
      .where({ _id: id })
      .update({
        data: {
          subscribeStatus: 0,
        },
      })
      .then((res) => {
        console.log(res);
        // this.setData({
        //   subscribeStatus: 1,
        // })
      });
  },
  onCall(e) {
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    });
  },
});
