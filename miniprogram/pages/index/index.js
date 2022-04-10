//index.js
const app = getApp();
const db = wx.cloud.database();
const { MOYUAN_KEY } = require("../../config/appConfig");

Page({
  data: {
    startRegion: [],
    endRegion: [],
    dnName: "CarPublish",
    //轮播页当前index
    swiperCurrent: 0,
    //banner
    imgUrls: ["../../images/icon/lunbo01.jpg", "../../images/icon/lunbo02.jpg"],
  },
  async onLoad(options) {
    if(options.id) {
      wx.navigateTo({
        url: `/pages/tripDetails/tripDetails?id=${options.id}`,
      })
    }
    const { data: User = [] } = await db
      .collection("User")
      .where({ _openid: app.globalData.openid })
      .get();
    console.log(User, "User-options", options);
    if (User.length > 0) {
      this.setData({
        User,
      });
      app.globalData.info = User[0]
    }
    this.getDistrict();
  },

  getDistrict() {
    wx.getLocation({
      type: "wgs84",

      success: ({ latitude, longitude }) => {
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
            this.getWayInfo([province, city, district])
            this.setData({ startRegion: [province, city, district], endRegion: [province, city, district] });
            app.globalData.startRegion = [province, city, district]
          },
        });
      },
      fail: () => {
        this.setData({ startRegion: ["福建省", "龙岩市", "上杭县"], endRegion: ["福建省", "龙岩市", "上杭县"] });
        this.getWayInfo(["福建省", "龙岩市", "上杭县"])
        console.log("fail");
      },
    });
  },

  async getWayInfo(key) {
    const { data = [] } = await db.collection("wayInfo").get();
    let wayInfo = [];
    // province
    const province = key.slice(0, key.length - 2);
    data.forEach(ele => {
      if(ele[province.toString()]) {
        wayInfo = ele[province.toString()]
        console.log(wayInfo, 'getWayInfo')
      }
    })
    // city
    if(wayInfo.length == 0) {
      const city = key.slice(0, key.length - 1);
      data.forEach(ele => {
        if(ele[city.toString()]) {
          wayInfo = ele[city.toString()]
          console.log(wayInfo, 'getWayInfo')
        }
      })
    }
    // antd
    if(wayInfo.length == 0) {
      data.forEach(ele => {
        if(ele[key.toString()]) {
          wayInfo = ele[key.toString()]
          console.log(wayInfo, 'getWayInfo')
        }
      })
    }
    // root
    if(wayInfo.length == 0) {
      data.forEach(ele => {
        if(ele['root']) {
          wayInfo = ele['root']
          console.log(wayInfo, 'getWayInfo')
        }
      })
    }
    this.setData({
      wayInfo
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
      endRegion,
    });
    console.log(e);
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
  handleChange() {
    const { startRegion, endRegion } = this.data;
    this.setData({
      startRegion: endRegion,
      endRegion: startRegion,
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
        this.setData({
          User:[{ phone: phone, }],
        });
        app.globalData.info = { phone: phone, }
        this.onSubmitTap();
      });
  },
  onSubmitTap() {
    const { endRegion } = this.data;
    if (endRegion.length <= 0)
      return wx.showToast({
        title: "请选择达到城市",
        icon: "error",
        duration: 2000,
      });
    const { dnName } = this.data;
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
  },
});
