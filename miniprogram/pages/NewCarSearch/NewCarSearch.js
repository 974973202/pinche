// miniprogram/pages/NewCarSearch/NewCarSearch.js
const app = getApp();
const db = wx.cloud.database();
const { tsFormatTime, exactTime, generateTimeReqestNumber } = require("../../utils/utils");
const { MOYUAN_KEY, PASSENGERSUBMESSAGE, CARSUBMESSAGE } = require("../../config/appConfig");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    startRegion: [],
    endRegion: [],
    //上车地点***
    startLocation: {
      name: "",
      address: "",
      latitude: "",
      longitude: "",
    },
    //下车地点***
    endLocation: {
      name: "",
      address: "",
      latitude: "",
      longitude: "",
    },
    //具体日期
    dateIndex: null,
    //具体日期***
    //具体时间***
    exactTime: null,
    exactDate: null, // 具体时间戳
    //人数***
    peopleNumber: "",
    //联系电话***
    phoneNumber: "",
    //备注***
    remarks: "",
    // 用户注册信息
    userInfo: {},
  },
  onLoad() {
    const t = tsFormatTime() + " " + exactTime()
    const time = t.split(/[- : \/]/)
    const exactDate = new Date(time[0], time[1]-1, time[2], time[3], time[4], '00').getTime()
    // const exactDate = new Date(time).getTime()
    this.setData({
      dateIndex: tsFormatTime(),
      exactTime: exactTime(),
      exactDate: exactDate,
    });
  },

  onShow(){
    this.setData({
      phoneNumber: app.globalData.info.phone,
      userInfo: app.globalData.info,
    });
  },

  /**
   * 出行方向
   */
  regionChange: function (e) {
    const {
      target: {
        dataset: { name },
      },
      detail: { value },
    } = e;
    console.log(name, value);
    this.setData({
      [name]: value,
    });
  },

  /**
   * 选择上车地点
   */
  getLocation(e) {
    const { currentTarget: {dataset : { name } } }= e
    console.log(name, e)
    wx.showLoading({
      title: '正在加载地图...',
    });
    wx.getLocation({
      type: "wgs84",
      success: ({ latitude, longitude }) => {
        // console.log(latitude, longitude);
        wx.chooseLocation({
          latitude,
          longitude,
          success: (res) => {
            this.getDistrict(res.latitude, res.longitude, name); // 获取省市区
            this.setData({
              [name]: res,
            });
          },
          fail(res) {
            console.log(res);
          },
          complete: (res) => {
            // complete
            wx.hideLoading();
          }
        });
      },
    });
  },
  getDistrict(latitude, longitude, name) {
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${MOYUAN_KEY}`,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        let region = {}
        const { data: { result: { address_component = {} } } } = res;
        const { province, city, district } = address_component;
        if(name == 'startLocation') {
          region.startRegion = [province, city, district]
        }
        if(name == 'endLocation') {
          region.endRegion = [province, city, district]
        }
        this.setData({ ...region })
      }
    })
  },

  /**
   * 日期选择器
   */
  bindPickerChange(e) {
    const currentData = e.detail.value;
    console.log(currentData, 'currentData')
    const { exactTime } = this.data;
    const time = (currentData + " " + exactTime).split(/[- : \/]/)
    const exactDate = new Date(time[0], time[1]-1, time[2], time[3], time[4], '00').getTime()
    this.setData({
      dateIndex: currentData,
      exactDate: exactDate,
    });
  },

  /**
   * 事件选择器
   */
  bindTimeChange (e) {
    const exactTime = e.detail.value
    const { dateIndex } = this.data;
    const time = (dateIndex + " " + exactTime).split(/[- : \/]/)
    const exactDate = new Date(time[0], time[1]-1, time[2], time[3], time[4], '00').getTime()
    this.setData({
      exactTime: exactTime,
      exactDate: exactDate,
    });
  },
  //监听输入框  实现双向数据绑定
  /**
   *
   */
  inputedit: function (e) {
    let _this = this;
    //input 和 info 双向数据绑定
    let dataset = e.currentTarget.dataset;
    //data-开头的是自定义属性，可以通过dataset获取到，dataset是一个json对象，
    let value = e.detail.value;
    let name = dataset.name;
    _this.data[name] = value;
    _this.setData({
      name: _this.data[name],
    });
  },

  /**
   * 错误提示信息
   */
  showModal(error) {
    wx.showModal({
      content: error,
      showCancel: false,
    });
  },

  /**
   * 点击发布函数
   */
  async submitTap () {
    let phoneReg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    if (this.data.startLocation.name == "") {
      this.showModal("请选择上车地点");
      return false;
    }
    if (this.data.endLocation.name == "") {
      this.showModal("请选择下车地点");
      return false;
    }
    if (this.data.peopleNumber == "") {
      this.showModal("请输入人数");
      return false;
    }
    if (this.data.phoneNumber == "") {
      this.showModal("请输入联系电话");
      return false;
    }
    if (!phoneReg.test(this.data.phoneNumber)) {
      this.showModal("请输入正确的联系电话");
      return false;
    }
    if (this.data.userInfo.phone != this.data.phoneNumber) {
      this.showModal("实名电话与发布电话不一致");
      return false;
    }
    // 获取微信头像信息
    let getUserProfile = wx.getStorageSync("getUserProfile");
    // if (!getUserProfile) {
    //   getUserProfile = await wx.getUserProfile({
    //     desc: "用于完善个人信息",
    //   });
    //   getUserProfile = getUserProfile.userInfo;
    //   wx.setStorageSync("getUserProfile", getUserProfile);
    // }
    this.subscribe(getUserProfile);
  },

  /**
   * 添加函数
   */
   subscribe(getUserProfile) {
     const { startLocation, endLocation, userInfo, exactDate } = this.data;
     console.log(wx.getAccountInfoSync().miniProgram.envVersion)
    // 发送给预约者订阅消息
    wx.requestSubscribeMessage({
      tmplIds: [PASSENGERSUBMESSAGE, CARSUBMESSAGE],
      success(data) {
        const acceptTemplateIds =
          Object.keys(data).filter((key) => data[key] === "accept") || [];
        if (!acceptTemplateIds.length) {
          console.warn("订阅消息流程失败!", data);
        } else {
          wx.cloud
            .callFunction({ // 先把自己的预约信息发给自己 -》 后面被预约再发给车主
              name: "carSubMessage",
              data: {
                carOpenid: app.globalData.openid, //此处是自己的openid
                name: userInfo.name,
                startLocation: startLocation.name.slice(0, 20),
                endLocation: endLocation.name.slice(0, 20),
                exactDate: generateTimeReqestNumber(exactDate),
                phone: userInfo.phone,
                miniprogramState: wx.getAccountInfoSync().miniProgram.envVersion
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
        this.addColoction(getUserProfile)
      }
    });

    
  },
  addColoction(getUserProfile) {
    const { userInfo } = this.data;
    userInfo.avatarUrl = getUserProfile.avatarUrl;
    let _this = this;
    db.collection("PassengerPublish").add({
      data: {
        //出发城市
        startRegion: _this.data.startRegion,
        //到大城市
        endRegion: _this.data.endRegion,
        //上车地点***
        startLocation: _this.data.startLocation,
        //下车地点***
        endLocation: _this.data.endLocation,
        //具体日期***
        //具体时间***
        exactTime: _this.data.exactTime,
        exactDate: _this.data.exactDate,
        dateIndex: _this.data.dateIndex,
        //人数***
        peopleNumber: _this.data.peopleNumber,
        //联系电话***
        phoneNumber: _this.data.phoneNumber,
        //预算***
        //备注***
        remarks: _this.data.remarks,
        // 用户预约信息
        userInfo,
        //创建时间
        createdTime: db.serverDate(),
        //状态
        status: 0, //0:待发布, 1:发布成功 2:删除
      },
      success: (res) => {
        console.log(res);
        wx.showToast({
          title: "发布成功",
          icon: "success",
          success: (res) => {
            wx.navigateTo({
              url: "/pages/myPublish/myPublish",
              success: (res) => {
                // 通过eventChannel向被打开页面传送数据
                const obj = {
                  currentNavTab: 1,
                  dbName: 'PassengerPublish'
                }
                res.eventChannel.emit("acceptCarPublishData", { data: obj });
              },
            });
          },
        });
      },
      fail: console.error,
    });
  },
});
