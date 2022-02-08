//app.js
App({
  onLaunch: function () {
    this.checkUpate()
    
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
      userInfo: null,
      info: {}, // 用户注册信息
    }
  },

  /**
   * 获取_openid
   */
   onGetOpenid() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'getOpenid',
    }).then(({ result: { openid, info ={} } }) => {
      console.log('1234567', openid, info)
      // const openid = res.result.openid
      this.globalData.openid = openid
      this.globalData.info = info
    }).catch(err => {
      // handle error
      console.error('errerr', err)
    })
  },

  checkUpate(){
    const updateManager = wx.getUpdateManager()
    // 检测版本更新
    updateManager.onCheckForUpdate((res)=>{
      if (res.hasUpdate){
        updateManager.onUpdateReady(()=>{
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用',
            success(res){
              if(res.confirm){
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
  },
})
