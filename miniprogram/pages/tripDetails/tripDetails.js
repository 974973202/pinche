// miniprogram/pages/tripDetails/tripDetails.js
const app = getApp();
const db = wx.cloud.database();
const plugin = requirePlugin('routePlan');
const { REFERER, MOYUAN_KEY } = require('../../config/appConfig')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    showIcon: true,
    // 地图
    mapWidth: 750,
    mapHeight: 600,
    latitude: "", //定位坐标
    longitude: "", //定位坐标
    scale: 18, //地图缩放级别
    markers: [], //标记坐标
    polyline: [], //绘制路线
    includePoints: [], //缩放视野以包含所有给定的坐标点
    controls: [],
    // --------------------------------------------------------
    //信息
    userInfo: {},

    startPoint: null,
    endPoint: null,
		themeColor: '#427CFF',

    //出发城市***
    startCity: [],
    //到达城市***
    endCity: [],
    //具体日期***
    exactDate: "",
    //具体时间***
    exactTime: "",
    //临时保存所有地图点
    allLocation: [],
    //起点***
    startLocation: {},
    //终点***
    endLocation: {},
    //路线图***
    // tripsArray: [],
    //人数***
    peopleNumber: "",
    //联系电话
    phoneNumber: "",
    //预算***
    budget: "",
    //备注***
    remarks: "s",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, "tripDetails");
    //获取用户当前位置
    let _this = this;
    wx.showLoading({
      title: "加载中...",
    });
    wx.getLocation({
      type: "gcj02",
      success: function (res) {
        if (res && res.longitude) {
          _this.setData({
            latitude: res.latitude,
            longitude: res.longitude,
          });
        }
      },
    });
    //截取参数
    _this.setData({
      id: options.id,
    }, async () => {
      await _this.addData(options.id);
      wx.hideLoading()
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext("myMap"); //获取地图对象同canvas相似，获取后才能调用相应的方法
    this.mapCtx.moveToLocation(); //将当前位置移动到地图中心
    this.mapCtx.includePoints({
      padding: [100],
      points: [],
    });
  },

  onShow() {
    // const selectedCity = ro?utePlan.getCity(); // 选择城市后返回城市信息对象，若未选择返回null
  },

  /**
   * 加载数据
   */
  async addData (id) {
    let _this = this;
    const { data } = await db.collection("CarOwnerRecord")
      .doc(id).get()
      _this.setData({
        userInfo: data.userInfo,
        //出发城市***
        startCity: data.startRegion[2],
        //到达城市***
        endCity: data.endRegion[2],
        //具体日期***
        exactDate: data.exactDate,
        //具体时间***
        exactTime: data.exactTime,
        //起点***
        startLocation: data.startLocation,
        //终点***
        endLocation: data.endLocation,
        //路线图***
        // tripsArray: data.tripsArray,
        //人数***
        peopleNumber: data.peopleNumber,
        //联系电话
        phoneNumber: data.phoneNumber,
        //预算***
        budget: data.budget,
        //备注***
        remarks: data.remarks,
      });

      _this.createdMarker(_this.data.dataList);
      _this.drawPolyline(_this.data.allLocation);
  },

  /**
   * 创建marker
   */
  createdMarker: function (dataList) {
    let _this = this;
    //将起点+停车点+终点 拼接在一个数组
    let markerArray = [];
    markerArray.push(_this.data.startLocation);
    // markerArray = markerArray.concat(_this.data.tripsArray);
    markerArray.push(_this.data.endLocation);

    let currentMarker = [];
    let markerList = markerArray;
    let startPoint, endPoint; // 用于导航
    for (let i = 0; i < markerList.length; i++) {
      let marker = markerList[i];
      marker.id = i;
      marker.latitude = marker.latitude;
      marker.longitude = marker.longitude;
      marker.title = marker.name;
      marker.callout = {
        content: marker.name,
        padding: 10,
        borderRadius: 2,
        display: 'ALWAYS'
      };
      console.log('iiiiiiiiii', i)
      switch (i) {
        //起点
        case 0:
          marker.width = 30;
          marker.height = 30;
          // marker.iconPath = "../../images/icon/starting_point.png";
          marker.iconPath = "../../images/icon/starting_point.png";
          startPoint = {
            latitude: marker.latitude,
            longitude: marker.longitude,
            name: marker.name,
          }
          break;
        //终点
        case markerList.length - 1:
          marker.width = 30;
          marker.height = 30;
          marker.iconPath = "../../images/icon/end_point.png";
          endPoint = {
            latitude: marker.latitude,
            longitude: marker.longitude,
            name: marker.name,
          }
          break;
      }
    }
    currentMarker = currentMarker.concat(markerList);
    console.log(currentMarker, "currentMarker");
    _this.setData({
      markers: currentMarker,
      allLocation: currentMarker,
      startPoint,
      endPoint
    });
  },

  /**
   * 绘制路线图
   */
  drawPolyline: function (dataList) {
    console.log(dataList, 'dataList')
    let _this = this;
    let polyline = [
      {
        points: [],
        width: 4, //线的宽度
        color: "#6495ED", //颜色
        dottedLine: false, //默认虚线
      },
    ];
    let points = dataList;
    polyline[0].points = points;
    _this.setData({
      polyline: polyline,
    });
  },

  /**
   * 缩放视野以包含所有给定的坐标点
   */
  setCaleMap: function (dataList) {
    let _this = this;
    _this.setData({
      includePoints: dataList,
    });
  },
  // 点击marker
  bindMarkertap: function (e) {
    console.log("111111");
  },

  /**
   * 查看地图坐标
   */
  // openLocationTap:function(e){
  //   let _this = this;
  //   let idx = e.currentTarget.dataset.idx;
  //   let item = _this.data.tripsArray[idx];
  //   console.log('idx:'+idx);
  //   //获取位置授权
  //   wx.getSetting({
  //     // type: 'gcj02',
  //     success: function (res) {
  //       console.log(res);
  //       //获取当前经纬度
  //       wx.getLocation({
  //         success: function (res) {
  //           console.log(res);
  //           //打开微信内置地图
  //           wx.openLocation(item)
  //         },
  //         fail: console.error
  //       })
  //     },
  //   });
  // },
  /**
   * 拨打电话
   */
  bindMakePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.phoneNumber,
    });
  },
  /**
   * 返回
   */
  bindGoBack: function () {
    wx.navigateBack({
      delta: 1,
    });
  },
  /**
   * 回到首页
   */
  bindGoHome: function () {
    const pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      currentNavTab: 1,
      pageIndex: 1,
    });
    wx.switchTab({
      url: "/pages/index/index",
    });
  },
  onWatchDemo() {
    // if (!this.data.endPoint) {
    //   wx.showToast({
    //     title: "请选择终点位置",
    //     icon: "none",
    //     duration: 1500,
    //     mask: false,
    //   });
    //   return;
    // }
    const key = MOYUAN_KEY;
    const referer = REFERER;
    const endPoint = JSON.stringify(this.data.endPoint);
    const startPoint = this.data.startPoint
    ? JSON.stringify(this.data.startPoint)
    : "";
    console.log(endPoint, startPoint)
    const mode = 'driving'
    const navigation = 1;
    if (!key || !referer) {
      console.error("请输入有效的key和referer");
      return;
    }
    let url =
      "plugin://routePlan/index?key=" +
      key +
      "&referer=" +
      referer +
      "&endPoint=" +
      endPoint +
      "&mode=" +
      mode +
      "&navigation=" +
      navigation +
      "&themeColor=" +
      this.data.themeColor;
    if (startPoint) {
      url += "&startPoint=" + startPoint;
    }
    wx.navigateTo({
      url,
    });
  },
  /**
   * 用户点击分享
   */
  onShareAppMessage(ops) {
    let _this = this;
    // let desc = '';
    // _this.data.tripsArray.map(n => {
    //   desc += '-'+n.name;
    // });
    if (ops.from === "button") {
      // 来自页面内转发按钮
      console.log(ops.target);
    }
    return {
      title:
        "车找人:" +
        _this.data.startLocation.name +
        "—>" +
        this.data.endLocation.name,
      // desc: '途径:' + desc,
      path: "/pages/tripDetails/tripDetails?id=" + _this.data.id,
      success: function (res) {
        // 需要在页面onLoad()事件中实现接口
        wx.showShareMenu({
          // 要求小程序返回分享目标信息
          withShareTicket: true,
        });
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      },
    };
  },
});
