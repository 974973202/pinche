//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-8gszo9fn88d70785',
        traceUser: true,
      })
    }

    this.onGetOpenid()

    this.globalData = {
      openid: -1,
    }
  },

  /**
   * 获取_openid
   */
   onGetOpenid() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
    }).then((res) => {
      console.error('xxxx', res)
      const openid = res.result.openid
      this.globalData.openid = openid
    }).catch(err => {
      // handle error
      console.error('errerr', err)
    })
  },
})
