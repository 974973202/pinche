// miniprogram/pages/myCenter/myCenter.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,//状态栏高度
    titleBarHeight:0,//标题栏高度
    navBarHeight: 0,//导航栏高度
    userInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(app.globalData)
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,//状态栏高度
      titleBarHeight: app.globalData.titleBarHeight,//标题栏高度
      navBarHeight: app.globalData.navBarHeight,//导航栏高度
      userInfo: app.globalData.userInfo,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})