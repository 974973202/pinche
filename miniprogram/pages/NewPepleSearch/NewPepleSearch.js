// miniprogram/pages/carsLookPeople/carLoolPeople.js

const app = getApp();
const db = wx.cloud.database();
const { tsFormatTime, exactTime } = require("../../utils/utils");
const { MOYUAN_KEY } = require("../../config/appConfig");

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
  },

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad() {
    const t = tsFormatTime() + " " + exactTime()
    const time = t.split(/[- : \/]/)
    const exactDate = new Date(time[0], time[1]-1, time[2], time[3], time[4], '00').getTime()
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
    wx.getLocation({ // 当前自己的位置
      type: "wgs84",
      success: ({ latitude, longitude }) => {
        wx.chooseLocation({ // 选择的位置
          latitude,
          longitude,
          success: (res) => {
            this.getDistrict(res.latitude, res.longitude, name); // 获取省市区
            console.log(res, '选择上/下车地点')
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
  bindPickerChange: function (e) {
    const currentData = e.detail.value;
    const { exactTime } = this.data;
    const time = (currentData + " " + exactTime).split(/[- : \/]/)
    const exactDate = new Date(time[0], time[1]-1, time[2], time[3], time[4], '00').getTime()
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
    const time = (dateIndex + " " + exactTime).split(/[- : \/]/)
    const exactDate = new Date(time[0], time[1]-1, time[2], time[3], time[4], '00').getTime()
    this.setData({
      exactTime,
      exactDate: exactDate,
    });
  },

  /**
   * 添加中途停车点
   */
  // addTripsItem: function () {
  //   let _this = this;
  //   wx.chooseLocation({
  //     success: function (res) {
  //       console.log(res);
  //       let list = _this.data.tripsArray;
  //       list.push(res);
  //       _this.setData({
  //         tripsArray: list
  //       });
  //     },
  //   })
  // },

  /**
   * 修改停车点
   */
  // changeTripsItem: function () {
  //   let _this = this;
  //   wx.chooseLocation({
  //     success: function (res) {
  //       console.log(res);
  //       _this.setData({

  //       });
  //     },
  //   })
  // },

  /**
   * 删除停车点
   */
  // delTripsItem: function (e) {
  //   let _this = this;
  //   let idx = e.currentTarget.dataset.idx;
  //   let list = _this.data.tripsArray;
  //   let filterRes = list.filter((ele, index) => {
  //     return index != idx;
  //   });
  //   console.log(filterRes)
  //   this.setData({
  //     tripsArray: filterRes
  //   })
  // },

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
  submitTap: function () {
    let _this = this;
    let phoneReg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    if (_this.data.startLocation.name == "") {
      _this.showModal("请选择上车地点");
      return false;
    }
    if (_this.data.endLocation.name == "") {
      _this.showModal("请选择下车地点");
      return false;
    }
    if (!phoneReg.test(_this.data.phoneNumber)) {
      _this.showModal("请输入正确的联系电话");
      return false;
    }
    if (_this.data.peopleNumber == "") {
      _this.showModal("请输入人数");
      return false;
    }
    if (_this.data.phoneNumber == "") {
      _this.showModal("请输入联系电话");
      return false;
    }
    if (_this.data.budget == "") {
      _this.showModal("请输入预算金额");
      return false;
    }
    wx.showToast({
      title: "",
      icon: "loading",
      success: function (res) {
        _this.addColoction();
      },
    });
  },

  /**
   * 添加函数
   */
  addColoction() {
    let _this = this;
    const { isSpeedStr, ...rest } = this.data;
    const addData = {
      ...rest,
      createdTime: db.serverDate(),
      //状态
      status: 0, //0:正常使用,1:被删除
    }
    delete addData.__webviewId__
    db.collection("CarSearchPeople").add({
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
              url: '/pages/carsLookPeople/carLoolPeople'
            })
          },
        });
      },
      fail: console.error,
    });
  },
});
