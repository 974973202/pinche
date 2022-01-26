// miniprogram/pages/peopleLookCars/peopleLookCars.js
const app = getApp();
const db = wx.cloud.database();
const { tsFormatTime, generateTimeReqestNumber } = require("../../utils/utils");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showIcon: true,
    isLodding: true,
    openid: "",
    list: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    wx.showLoading({
      title: "加载中...",
    });
    _this.setData({
      openid: app.globalData.openid,
    });
    // _this.addData(_this.data.openid);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.addData(this.data.openid);
  },

  /**
   * 加载数据列表
   */
  addData: function (openid) {
    const _ = db.command;
    let _this = this;
    db.collection("CarSearchPeople")
      .where({
        _openid: openid,
        status: _.neq(1),
      })
      .orderBy("exactDate", "desc")
      .get({
        success: function (res) {
          console.log("车找人列表数据", res.data);
          res?.data?.forEach((ele) => {
            ele.exactDate = generateTimeReqestNumber(ele.exactDate);
          });
          wx.hideLoading();
          _this.setData({
            list: res.data,
            isLodding: false,
          });
        },
        fail: console.error,
      });
  },

  /**
   * 发布函数
   */
  publishTap(e) {
    let idx = e.currentTarget.dataset.idx;
    let id = e.currentTarget.dataset.id;

    let params = this.data.list[idx];
    if (!this.isValid(params.exactDate)) return false;
    //修改出发时间
    // params.exactDateTag == '今天' ? this.getTodyTime(params.exactTime) : this.getTomorrowTime(params.exactTime);
    //存放时间戳
    //添加数据库时 _id、_openid不能存在否则报错
    delete params._id;
    delete params._openid;
    
    //判断是否有效
    // delete params.exactDateTag;
    
    //添加个人信息
    params.userInfo = wx.getStorageSync('userInfo');
    console.log(params);

    // wx.showModal({
    //   title: "车找人",
    //   content: "确定发布这条信息？",
    //   success: (res) => {
    //     if (res.confirm) {
    //       console.log("ok");
    //       // 操作数据库
    //       db.collection("CarOwnerRecord").add({
    //         data: params,
    //         success: function (res) {
    //           console.log(res);
    //           //发布成功
    //           wx.showToast({
    //             title: "发布成功",
    //             icon: "success",
    //             duration: 2000,
    //           });
    //           const pages = getCurrentPages();
    //           var prevPage = pages[pages.length - 2];
    //           prevPage.setData({
    //             currentNavTab: 0,
    //             pageIndex: 1,
    //           });

    //           wx.switchTab({
    //             url: "/pages/index/index",
    //           });
    //         },
    //         fail: console.error,
    //       });
    //     } else if (res.cancel) {
    //       console.log("cancel");
    //     }
    //   },
    // });
  },

  /**
   * 删除函数
   */
  deleteTap(e) {
    let _this = this;
    let idx = e.currentTarget.dataset.idx;
    let id = e.currentTarget.dataset.id;

    console.log("idx:" + idx);
    console.log("id:" + id);
    wx.showModal({
      title: "",
      content: "确定删除这条信息？",
      success: function (res) {
        if (res.confirm) {
          console.log("ok");
          wx.showToast({
            title: "",
            icon: "loading",
            success: function (res) {
              //更新状态函数
              db.collection("CarSearchPeople")
                .doc(id)
                .update({
                  data: {
                    status: 1,
                  },
                  success: function (res) {
                    console.log(res);
                    let list = _this.data.list;
                    let filterRes = list.filter((ele, index) => {
                      return index != idx;
                    });
                    _this.setData({
                      list: filterRes,
                    });
                    wx.showToast({
                      title: "删除成功",
                      icon: "success",
                    });
                  },
                  fail: console.error,
                });
            },
          });
        } else if (res.cancel) {
          console.log("cancel");
        }
      },
    });
  },

  /**
   * 校验发布时是否有效
   */
  isValid(timeStr) {
    // console.log(new Date(timeStr).getTime(), new Date().getTime())
    if (new Date(timeStr).getTime() >= new Date().getTime()) {
      return true;
    } else {
      wx.showToast({
        title: "出行时间已超时,请重新设置",
        icon: "error",
        duration: 2000,
      });
      return false;
    }
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
    const key = this.data.customStyles[this.data.keyIndex].value;
    const referer = REFERER;
    const endPoint = JSON.stringify(this.data.endPoint);
    const startPoint = this.data.startPoint
      ? JSON.stringify(this.data.startPoint)
      : "";
    const mode = this.data.modes[this.data.modeIndex].value;
    const navigation = this.data.isNavigate ? 1 : 0;
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

  async addPublic() {
    const userInfo = wx.getStorageSync('userInfo')
    console.log(userInfo, 'userInfo')
    if(!userInfo) {
      const res = await wx.getUserProfile({
        desc: '用于完善个人信息'
      });
      wx.setStorageSync('userInfo', res.userInfo);
    }
    wx.navigateTo({ url: '/pages/NewPepleSearch/NewPepleSearch' })
    // url='/pages/NewPepleSearch/NewPepleSearch'
  }
});
