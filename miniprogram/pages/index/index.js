//index.js
const app = getApp();

Page({
  data: {
    searchType: [
      {
        name: "找车主",
        value: "0",
        checked: true,
      },
      {
        name: "找乘客",
        value: "1",
        checked: false,
      },
    ],
    // startRegion: ["福建省", "龙岩市", "上杭县"],
    // endRegion: ["福建省", "龙岩市", "上杭县"],
    startRegion: ["湖北省", "武汉市", "洪山区"],
    endRegion: ["湖北省", "武汉市", "洪山区"],
    dnName: 'CarPublish',
  },
  /**
   * 类型选择器
   */
  bindTypeChange(e) {
    console.log(e.detail.value);
    let dnName = 'CarPublish'
    switch (e.detail.value) {
      case "0":
          dnName = "CarPublish";
        break;
      case "1":
          dnName = "PassengerPublish";
        break;
    }
    this.setData({ dnName });
  },

  /**
   * 出发城市
   */
  startRegionChange: function (e) {
    console.log(e.detail.value);
    this.setData({
      startRegion: e.detail.value,
    });
  },

  /**
   * 达到城市
   */
  endRegionChange: function (e) {
    console.log(e.detail.value);
    this.setData({
      endRegion: e.detail.value,
    });
  },

  onSubmitTap() {
    console.log(this.data);
    wx.navigateTo({
      url: '/pages/SearchPage/SearchPage',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        someEvent: function(data) {
          console.log(data)
        }
      },
      success: (res) => {
        // 通过eventChannel向被打开页面传送数据
        const { searchType, ...rest } = this.data;
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: rest })
      }
    })
    // //第一个参数页数
    // let _this = this;
    // let startTime = _this.startTime();
    // let endTime = _this.endTime();
    // wx.showLoading({
    //   title: "加载中...",
    // });
    // //按照时间查询，规则开始当前时间60分钟前 到明天24：00；
    // wx.cloud
    //   .callFunction({
    //     name: "queryInfo",
    //     data: {
    //       dbName: _this.data.dnName,
    //       pageIndex: n,
    //       pageSize: 15,
    //       filter: {
    //         startRegion: _this.data.startRegion,
    //         endRegion: _this.data.endRegion,
    //       },
    //       startTime: _this.startTime(),
    //       endTime: _this.endTime(),
    //     },
    //   })
    //   .then((res) => {
    //     console.log(res);
    //     _this.setData({
    //       isLodding: false,
    //       list: res.result.data,
    //       pageIndex: _this.data.pageIndex + 1,
    //       hasMore: res.result.hasMore,
    //     });

    //     wx.hideLoading();
    //   });
  },
});
