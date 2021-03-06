//app.js
App({
  onLaunch: function () {
    this.checkUpate()
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud-prop-0g0aq5yg1035c0c5',
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
      this.globalData.openid = openid
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
