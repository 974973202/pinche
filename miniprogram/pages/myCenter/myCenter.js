// miniprogram/pages/myCenter/myCenter.js
const app = getApp();
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    User: {},
    carStatus: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // this.getUser();
  },
  async onShow() {
    const { data: User = [{}] } = await db
      .collection("User")
      .get();
    this.setData({
      User: User[0],
    });
    if (User.length > 0) {
      app.globalData.carStatus = User[0].driveStatus;
      this.setData({
        carStatus: User[0].driveStatus,
      });
    }
    console.log(User, 'UserUser')
  },

  onAuthorize() {
    wx.navigateTo({
      url: "/pages/RealAuthentication/RealAuthentication",
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        getInfo: (data) => {
          app.globalData.info = data;
          this.setData({
            info: data,
          });
          console.log(data, "getInfo");
        },
      },
      // success: (res) => {
      //   // 通过eventChannel向被打开页面传送数据
      //   const { searchType, ...rest } = this.data;
      //   res.eventChannel.emit('acceptDataFromOpenerPage', { data: rest })
      // }
    });
  },

  onDriveAuthorize(e) {
    let carStatus = e.currentTarget.dataset.status;
    if (carStatus === 0 || carStatus === 1) return;
    wx.navigateTo({
      url: "/pages/RealDriveAuthentication/RealDriveAuthentication",
    });
  },

  async getPhoneNumber(e) {
    let cloudID = e.detail.cloudID; //开放数据ID
    if (!cloudID) {
      // app.showToast('用户未授权')
      console.log("用户未授权");
      return;
    }

    wx.cloud
      .callFunction({
        name: "getPhone",
        data: {
          cloudID: e.detail.cloudID,
        },
      })
      .then((res) => {
        const phone = res.result.list[0].data.phoneNumber;
        db.collection("User").add({
          data: {
            name: "",
            status: 0,
            phone: phone,
            createTime: db.serverDate(), // 服务端的时间
          },
        });
        wx.navigateTo({
          url: "/pages/RealDriveAuthentication/RealDriveAuthentication",
        });
      });
  },

  onPublish() {
    wx.navigateTo({
      url: "/pages/myPublish/myPublish",
    });
  },

  onEditModal(e) {
    const { name } = e.currentTarget.dataset;
    wx.showModal({
      title: `修改${name === "name" ? "姓名" : "手机号"}`,
      placeholderText: `请输入${name === "name" ? "姓名" : "手机号"}`,
      editable: true,
      success: (res) => {
        if (res.confirm) {
          if (name === "phone") {
            const reg = new RegExp(/^1[3,4,5,6,7,8,9][0-9]{9}$/);
            if (!reg.test(res.content)) {
              wx.showToast({ title: "输入正确手机号", icon: "error" });
            } else {
              db.collection("User")
                .where({ phone: res.content })
                .get()
                .then((isUser) => {
                  console.log(isUser, 'isUserisUserisUser')
                  if(isUser.data.length > 0) {
                    wx.showToast({ title: "手机被注册", icon: "error" });
                    return;
                  }
                  db.collection("User")
                    .where({ _openid: app.globalData.openid })
                    .update({
                      data: { phone: res.content },
                    })
                    .then(() => {
                      const { User } = this.data;
                      this.setData({
                        User: {
                          ...User,
                          phone: res.content,
                        },
                      });
                      wx.showToast({ title: "修改成功", icon: "success" });
                    });
                })
            }
          } else {
            db.collection("User")
              .where({ _openid: app.globalData.openid })
              .update({
                data: { name: res.content },
              })
              .then(() => {
                const { User } = this.data;
                this.setData({
                  User: {
                    ...User,
                    name: res.content,
                  },
                });
                wx.showToast({ title: "修改成功", icon: "success" });
              });
          }
        } else if (res.cancel) {
          console.log("用户点击取消");
        }
      },
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  // onShow: function () {
  //   console.log(app.globalData);
  // },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
