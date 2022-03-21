// miniprogram/pages/tripDetails/tripDetails.js
const app = getApp();
const db = wx.cloud.database();
const plugin = requirePlugin("routePlan");
const {
  REFERER,
  MOYUAN_KEY,
  PASSENGERSUBMESSAGE,
  CARSUBMESSAGE,
} = require("../../config/appConfig");
const { generateTimeReqestNumber } = require("../../utils/utils");

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
    carData: {},

    startPoint: null,
    endPoint: null,
    themeColor: "#427CFF",

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
    // 获取当前用户电话 用于判断自己不能预约自己
    phone: "",
    modelType: "",
    passengerInfo: [],
    // 司机的openid
    carOpenid: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    _this.setData(
      {
        id: options.id,
        phone: app.globalData.info.phone, // 获取当前用户电话
      },
      async () => {
        await _this.addData(options.id);
        wx.hideLoading();
        console.log(options, "tripDetails", app.globalData.info.phone);
      }
    );
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
  async addData(id) {
    let _this = this;
    const { data } = await db.collection("CarPublish").doc(id).get();
    console.log(data, "加载数据加载数据");
    _this.setData({
      carData: data.carData,
      modelType: data.modelType,
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
      //预算***
      budget: data.budget,
      //备注***
      remarks: data.remarks,
      // 预约乘客的信息
      passengerInfo: data.passengerInfo || [],
      // 司机的openid
      carOpenid: data._openid,
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
        display: "ALWAYS",
      };
      console.log("iiiiiiiiii", i);
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
          };
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
          };
          break;
      }
    }
    currentMarker = currentMarker.concat(markerList);
    console.log(currentMarker, "currentMarker");
    _this.setData({
      markers: currentMarker,
      allLocation: currentMarker,
      startPoint,
      endPoint,
    });
  },

  /**
   * 绘制路线图
   */
  drawPolyline: function (dataList) {
    console.log(dataList, "dataList");
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

  onShowModal() {
    wx.showModal({
      title: "预约人数",
      placeholderText: "请输入预约人数",
      editable: true,
      success: (res) => {
        if (res.confirm) {
          const reg = new RegExp("^[0-9]*$");
          if (!reg.test(res.content)) {
            wx.showToast({ title: "请输入数字", icon: "error" });
          } else {
            const { peopleNumber } = this.data;
            let num = peopleNumber - Number(res.content);
            if (num < 0) {
              wx.showModal({
                content: "预约人数大于座位上限",
                showCancel: false,
              });
              return;
            }
            this.bindMakePhoneCall(num, Number(res.content));
          }
        } else if (res.cancel) {
          console.log("用户点击取消");
        }
      },
    });
  },

  /**
   * 马上预约
   */
  async bindMakePhoneCall(num, mynum) {
    const { data = [{}] } = await db
      .collection("User")
      .where({ _openid: app.globalData.openid })
      .get();
    const { name = '', phone } = data[0] || {};
    let passengerInfo = {
      name,
      phone,
      status: 0, // 记录乘客是否上车
      number: mynum
    };
    if (!name) {
      wx.showModal({
        title: "姓名",
        placeholderText: "请输入姓名预约",
        editable: true,
        success: (res) => {
          if (res.content) {
            db.collection("User")
              .where({ _openid: app.globalData.openid })
              .update({
                data: { name: res.content },
              })
              .then(() => {
                passengerInfo = {
                  ...passengerInfo,
                  name: res.content,
                  number: mynum
                };
                this.handleTrip(passengerInfo, num, mynum)
                
              });
          } else if (res.cancel) {
            console.log("用户点击取消");
          } else {
            wx.showModal({
              content: "请输入姓名",
              showCancel: false,
            });
          }
        },
      });
    } else {
      this.handleTrip(passengerInfo, num, mynum)
    }
  },

  handleTrip(passengerInfo, num, mynum) {
    // 获取这条信息id 和 人数
    const {
      id,
      peopleNumber,
      carData,
      modelType,
      startLocation,
      endLocation,
      budget,
      remarks,
      passengerInfo: carInfo, // 司机下面记录的乘客信息
      exactDate,
      carOpenid,
    } = this.data;
    const repectPhone = carInfo.some(
      (ele) => ele.phone == passengerInfo.phone
    );
    if (repectPhone)
      return wx.showModal({
        content: "您已预约请勿重复预约",
        showCancel: false,
      });
    // 绑定乘客信息
    // 添加乘客预约记录

    wx.showModal({
      title: "预约车主",
      content: "是否确定预约",
      success(res) {
        if (res.confirm) {
          // 修改车主数据
          wx.cloud
            .callFunction({
              name: "subscribeHistory",
              data: {
                dbName: "CarPublish",
                passengerInfo,
                id,
                peopleNumber: num,
              },
            })
            .then(async (res) => {
              // 添加乘客(自己的)预约记录
              const result = await db
                .collection("subscribeHistory")
                .add({
                  data: {
                    carInfo: {
                      carData, // 车主信息
                      modelType, // 车型
                      startLocation, // 起点
                      endLocation, // 终点
                      budget, // 预算
                      remarks, // 车主备注
                      exactDate,
                      carId: id, 
                    },
                    name: passengerInfo.name,
                    phone: passengerInfo.phone,
                    subscribeStatus: 0, // 0未出行 1已出行 2其他
                    number: mynum,
                  },
                });
            });

          // 发送给预约者订阅消息
          wx.requestSubscribeMessage({
            tmplIds: [PASSENGERSUBMESSAGE, CARSUBMESSAGE],
            success(data) {
              const acceptTemplateIds =
                Object.keys(data).filter(
                  (key) => data[key] === "accept"
                ) || [];
              if (!acceptTemplateIds.length) {
                console.warn("订阅消息流程失败!", data);
              } else {
                wx.cloud
                  .callFunction({
                    name: "passengerSubMessage",
                    data: {
                      name: carData.name,
                      startLocation: startLocation.name.slice(
                        0,
                        20
                      ),
                      endLocation: endLocation.name.slice(0, 20),
                      exactDate:
                        generateTimeReqestNumber(exactDate),
                      phone: carData.phone,
                      miniprogramState:
                        wx.getAccountInfoSync().miniProgram
                          .envVersion, // 获取当前环境，测试，体验，生产
                    },
                  })
                  .then((res) => {
                    console.log(res);
                  });
                // 发送给车主的订阅消息
                wx.cloud
                  .callFunction({
                    name: "carSubMessage",
                    data: {
                      carOpenid,
                      name: passengerInfo.name,
                      startLocation: startLocation.name.slice(
                        0,
                        20
                      ),
                      endLocation: endLocation.name.slice(0, 20),
                      exactDate:
                        generateTimeReqestNumber(exactDate),
                      phone: passengerInfo.phone,
                      miniprogramState:
                        wx.getAccountInfoSync().miniProgram
                          .envVersion,
                    },
                  })
                  .then((res) => {
                    console.log(res);
                  });
              }
            },
            fail(res) {
              console.warn("点击了取消!", res);
            },
            complete: () => {
              wx.switchTab({
                url: "/pages/myCenter/myCenter",
              });
            },
          });
        }
      },
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
    console.log(endPoint, startPoint);
    const mode = "driving";
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
