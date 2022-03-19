// miniprogram/pages/myPublish/myPublish.js

const app = getApp();
const db = wx.cloud.database();
const { tsFormatTime, exactTime } = require("../../utils/utils");
const {
  MOYUAN_KEY,
  PASSENGERSUBMESSAGE,
  CARSUBMESSAGE,
} = require("../../config/appConfig");

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
    //具体日期***
    dateIndex: 0, // 出发日期
    //具体时间***
    exactTime: null, // 出发时间
    exactDate: null, // 具体时间戳
    //高速
    isSpeedStr: [
      {
        name: "辅路",
        value: "否",
        checked: "true",
      },
      {
        name: "高速",
        value: "是",
      },
    ],
    // 车型
    modelType: "",
    //是否高速***
    isSpeed: "辅路",
    //人数***
    peopleNumber: "",
    //联系电话***
    phoneNumber: "",
    //预算***
    budget: "",
    //备注***
    remarks: "",
    // 协议
    agreement: false,

    modelShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const t = tsFormatTime() + " " + exactTime();
    const time = t.split(/[- : \/]/);
    const exactDate = new Date(
      time[0],
      time[1] - 1,
      time[2],
      time[3],
      time[4],
      "00"
    ).getTime();
    this.setData({
      dateIndex: tsFormatTime(),
      exactTime: exactTime(),
      exactDate: exactDate,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  goReal(cont) {
    wx.showModal({
      content: cont,
      showCancel: false,
      success: (res) => {
        //返回页面
        // wx.navigateBack();
        wx.switchTab({
          url: "/pages/myCenter/myCenter",
        });
      },
    });
  },

  async onShow() {
      // 判断是否车主认证
    const { data: carData = [{}] } = await db
      .collection("User")
      .where({ _openid: app.globalData.openid })
      .get();
    if (!carData[0]) {
      this.goReal("需要进行车主认证");
      return;
    }
    if (carData[0].driveStatus === 0 || carData[0].driveStatus === 2) {
      this.goReal(
        carData[0].driveStatus === 0 ? "车主认证中" : "车主认证失败，请重新认证"
      );
      return;
    }
    // 存在全局，我的发布里调用
    if (carData[0].driveStatus === 1) {
      app.globalData.carStatus = carData[0].driveStatus;
      this.setData({
        carData
      })
    }
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
   * 选择上/下车地点
   */
  getLocation(e) {
    const {
      currentTarget: {
        dataset: { name },
      },
    } = e;
    wx.showLoading({
      title: "正在加载地图...",
    });
    wx.getLocation({
      // 当前自己的位置
      type: "wgs84",
      success: ({ latitude, longitude }) => {
        wx.chooseLocation({
          // 选择的位置
          latitude,
          longitude,
          success: (res) => {
            this.getDistrict(res.latitude, res.longitude, name); // 获取省市区
            console.log(res, "选择上/下车地点");
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
          },
        });
      },
    });
  },
  getDistrict(latitude, longitude, name) {
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${MOYUAN_KEY}`,
      header: {
        "Content-Type": "application/json",
      },
      success: (res) => {
        let region = {};
        const {
          data: {
            result: { address_component = {} },
          },
        } = res;
        const { province, city, district } = address_component;
        if (name == "startLocation") {
          region.startRegion = [province, city, district];
        }
        if (name == "endLocation") {
          region.endRegion = [province, city, district];
        }
        this.setData({ ...region });
      },
    });
  },

  /**
   * 日期选择器
   */
  bindPickerChange: function (e) {
    const currentData = e.detail.value;
    const { exactTime } = this.data;
    const time = (currentData + " " + exactTime).split(/[- : \/]/);
    const exactDate = new Date(
      time[0],
      time[1] - 1,
      time[2],
      time[3],
      time[4],
      "00"
    ).getTime();
    this.setData({
      dateIndex: currentData,
      exactDate: exactDate,
    });
  },

  /**
   * 时间选择器
   */
  bindTimeChange: function (e) {
    const exactTime = e.detail.value;
    const { dateIndex } = this.data;
    const time = (dateIndex + " " + exactTime).split(/[- : \/]/);
    const exactDate = new Date(
      time[0],
      time[1] - 1,
      time[2],
      time[3],
      time[4],
      "00"
    ).getTime();
    this.setData({
      exactTime,
      exactDate: exactDate,
    });
  },

  /**
   * 道路选择
   */
  isSpeedChange: function (e) {
    let _this = this;
    _this.setData({
      isSpeed: e.detail.value,
    });
  },

  /**
   * 监听输入框  实现双向数据绑定
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
   * 协议
   */
  radioChange() {
    const { agreement } = this.data;
    this.setData({
      agreement: !agreement,
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
  async submitTap() {
    let _this = this;
    if (_this.data.startLocation.name == "") {
      _this.showModal("请选择上车地点");
      return false;
    }
    if (_this.data.endLocation.name == "") {
      _this.showModal("请选择下车地点");
      return false;
    }
    if (_this.data.modelType == "") {
      _this.showModal("请填写车型");
      return false;
    }
    if (_this.data.peopleNumber == "") {
      _this.showModal("请输入人数");
      return false;
    }
    if (_this.data.budget == "") {
      _this.showModal("请输入预算金额");
      return false;
    }
    if (!_this.data.agreement) {
      _this.showModal("请勾选合乘协议");
      return false;
    }
    _this.addColoction();
  },

  /**
   * 添加函数
   */
  async addColoction() {
    const { carData } = this.data;
    // 发送给车主的订阅消息
    wx.requestSubscribeMessage({
      tmplIds: [PASSENGERSUBMESSAGE, CARSUBMESSAGE],
      success: (data) => {
        const acceptTemplateIds =
          Object.keys(data).filter((key) => data[key] === "accept") || [];
        if (!acceptTemplateIds.length) {
          console.warn("订阅消息流程失败!", data);
        } else {
          const { isSpeedStr, ...rest } = this.data;
          const addData = {
            ...rest,
            createdTime: db.serverDate(),
            //状态
            status: 0, //0:待发布, 1:发布成功 2:删除
          };
          delete addData.__webviewId__;
          db.collection("CarPublish").add({
            data: addData,
            success: (res) => {
              console.log(res);
              wx.showToast({
                title: "添加发布成功",
                icon: "success",
                success: (res) => {
                  //返回页面
                  // wx.navigateBack();
                  wx.navigateTo({
                    url: "/pages/myPublish/myPublish",
                  });
                },
              });
            },
            fail: console.error,
          });
        }
      },
      fail(res) {
        console.warn("点击了取消!", res);
      },
    });
  },

  onTreaty() {
    const { modelShow } = this.data;
    this.setData({modelShow: !modelShow})
  },
});
