// miniprogram/pages/myCenter/myCenter.js
const app = getApp();
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    info: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getUser();
  },
  async getUser() {
    console.log('000000000000000')
    // const { data = [] } = await db.collection('User').field({
    //   status: true,
    //   name: true,
    //   phone: true,
    // }).get();
    // this.setData({
    //   info: data[0]
    // })
    let info = JSON.parse(JSON.stringify(app.globalData.info));
    if(info) {
      info.phone = info.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
      this.setData({
        info,
      });
      console.log(app.globalData.info, "info");
      if (app.globalData.info.status == 1) {
        const { data = [] } = await db
          .collection("Certificates")
          .field({
            status: true,
          })
          .get();
        console.log(data, "Certificates");
      }
    }
  },

  onAuthorize() {
    wx.navigateTo({
      url: '/pages/RealAuthentication/RealAuthentication',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        getInfo: (data) => {
          this.setData({
            info: data,
          })
          console.log(data, 'getInfo')
        }
      },
      // success: (res) => {
      //   // 通过eventChannel向被打开页面传送数据
      //   const { searchType, ...rest } = this.data;
      //   res.eventChannel.emit('acceptDataFromOpenerPage', { data: rest })
      // }
    })
  },

  onDriveAuthorize() {
    if (!this.data.info) {
      wx.showModal({
        content: "请先进行实名认证",
        showCancel: false,
        success: (res) => {
          //返回页面
          // wx.navigateBack();
          wx.navigateTo({
            url: "/pages/RealAuthentication/RealAuthentication",
          });
        },
      });
    } else if (this.data.info.status == 1) {
      wx.navigateTo({
        url: "/pages/RealDriveAuthentication/RealDriveAuthentication",
      });
    } else if (this.data.info.status == 0) {
      wx.showToast({
        title: "正在进行实名认证中",
        icon: "success",
        // success: (res) => {
        //   //返回页面
        //   // wx.navigateBack();

        // },
      });
    }
  },

  onPublish() {
    
    if(this.data.info.status != 1) {
      if(this.data.info.status == 0) {
         return wx.showModal({
          title: "正在进行实名认证中",
          showCancel: false,
        });
      }
      wx.showModal({
        content: "请先进行实名认证",
        showCancel: false,
        success: (res) => {
          //返回页面
          // wx.navigateBack();
          wx.navigateTo({
            url: "/pages/RealAuthentication/RealAuthentication",
          });
        },
      });
    }
    wx.navigateTo({
      url: "/pages/myPublish/myPublish",
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(app.globalData);
  },

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
