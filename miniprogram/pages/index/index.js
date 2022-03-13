//index.js
const app = getApp();
const db = wx.cloud.database();
const {
  MOYUAN_KEY,
} = require("../../config/appConfig");

Page({
  data: {
    // searchType: [
    //   {
    //     name: "找车主",
    //     value: "0",
    //     checked: true,
    //   },
    //   {
    //     name: "找乘客",
    //     value: "1",
    //     checked: false,
    //   },
    // ],
    startRegion: [],
    endRegion: ["福建省", "龙岩市", "上杭县"],
    dnName: "CarPublish",
    //轮播页当前index
    swiperCurrent: 0,
    //banner
    imgUrls: ["../../images/icon/lunbo01.jpg", "../../images/icon/lunbo02.jpg"],
  },
 async onLoad() {
    const {data} = await db.collection('wayInfo').get();
    console.log(data, 'datadata')
    if(data.length>0) {
      this.setData({
        wayInfo: data[0].wayInfo
      })
    }
    this.getDistrict()
  },

  getDistrict() {
    wx.getLocation({
      type: 'wgs84',

      success: ({ latitude, longitude })=> {
        wx.request({
          url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${MOYUAN_KEY}`,
          header: {
            "Content-Type": "application/json",
          },
          success: (res) => {
            const {
              data: {
                result: { address_component = {} },
              },
            } = res;
            const { province, city, district } = address_component;
            this.setData({ startRegion: [province, city, district] });
          },
        });
      },
      fail:()=> {
       this.setData({ startRegion: ["福建省", "龙岩市", "上杭县"] });
        console.log('fail')
      }

     })
  },

  /**
   * 轮播图的切换事件
   */
   swiperChange(e) {
    this.setData({
      swiperCurrent: e.detail.current,
    });
  },

  /**
   * 轮播图点击事件
   */
  swipclick(e) {
    console.log(this.data.swiperCurrent);
    let _index = this.data.swiperCurrent;
    // wx.navigateTo({
    //   url: "../../pages/webViewPage/webViewPage?url=" + str + "&name=推荐",
    // });
  },

  onChangeWay(e) {
    const { startRegion, endRegion } = e.currentTarget.dataset.item;
    this.setData({
      startRegion,
      endRegion
    })
    console.log(e)
  },
  /**
   * 类型选择器
   */
  // bindTypeChange(e) {
  //   console.log(e.detail.value);
  //   let dnName = "CarPublish";
  //   switch (e.detail.value) {
  //     case "0":
  //       dnName = "CarPublish";
  //       break;
  //     case "1":
  //       dnName = "PassengerPublish";
  //       break;
  //   }
  //   this.setData({ dnName });
  // },

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

  async onSubmitTap() {
    const { endRegion } = this.data;
    if(endRegion.length <= 0) return wx.showToast({
      title: '请选择达到城市',
      icon: "error",
      duration: 2000,
    });
    const { dnName } = this.data;
    // if (dnName === "PassengerPublish") {
    //   // zhao
    //   // 判断是否车主认证
    //   const { data: carData = [] } = await db
    //     .collection("Certificates")
    //     .where({ _openid: app.globalData.openid })
    //     .field({
    //       status: true,
    //     })
    //     .get();
    //   if (!carData[0]) {
    //     this.goReal("需要进行车主认证");
    //     return;
    //   }
    //   if (carData[0].status === 0 || carData[0].status === 2) {
    //     this.goReal(
    //       carData[0].status === 0 ? "车主认证中" : "车主认证失败，请重新认证"
    //     );
    //     return;
    //   }
    //   // 存在全局，我的发布里调用
    //   if (carData[0].status === 1) {
    //     app.globalData.carStatus = carData[0].status;
    //   }
    // }

    wx.navigateTo({
      url: "/pages/SearchPage/SearchPage",
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        someEvent: function (data) {
          console.log(data);
        },
      },
      success: (res) => {
        // 通过eventChannel向被打开页面传送数据
        const { searchType, ...rest } = this.data;
        res.eventChannel.emit("acceptDataFromOpenerPage", { data: rest });
      },
    });
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
