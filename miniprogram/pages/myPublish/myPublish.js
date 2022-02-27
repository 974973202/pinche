// miniprogram/pages/peopleLookCars/peopleLookCars.js
const app = getApp();
const db = wx.cloud.database();
const { tsFormatTime, generateTimeReqestNumber } = require("../../utils/utils");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isPassenderDetail: false,
    isLodding: true,
    openid: "",
    list: [],
    navData: ["我是车主", "我是乘客"],
    currentNavTab: 0,
    dbName: "CarPublish", //0:待发布, 1:发布成功 2:删除 3:订单完成
    // 'PassengerPublish' //0:匹配中, 1:已取消 2:删除 3:订单完成 4:匹配成功
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    wx.showLoading({
      title: "加载中...",
    });
    // 我是乘客创建订单返回执行
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("acceptCarPublishData", ({data}) => {
      this.setData({
        currentNavTab: data.currentNavTab,
        dbName: data.dbName,
      })
    });


    this.setData({
      openid: app.globalData.openid,
    }, () => {
      this.addData(this.data.openid);
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // this.addData(this.data.openid);
  },

  onPassengerDetail() {
    const { isPassenderDetail } = this.data;
    this.setData({
      isPassenderDetail: !isPassenderDetail,
    });
  },

  /**
   * 加载数据列表
   */
  addData(openid) {
    const { dbName, currentNavTab } = this.data;
    const _ = db.command;
    let _this = this;
    let inSearch = dbName == 'CarPublish' ? _.in([0, 1]) : _.in([0, 1, 4]);
    db.collection(dbName)
      .where({
        _openid: openid,
        status: inSearch, //0:待发布, 1:发布成功 2:删除 3:订单完成
      })
      .orderBy("exactDate", "desc")
      .get({
        success: function (res) {
          console.log(
            currentNavTab == 0 ? "车找人列表数据" : "人找车列表数据",
            res.data
          );
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
   * 导航列表点击
   */
  switchNav(event) {
    const { currentNavTab, openid } = this.data;
    let cur = event.currentTarget.dataset.current;
    console.log(cur, "eventevent", currentNavTab);
    if (currentNavTab == cur) {
      return false;
    } else {
      this.setData({
        currentNavTab: cur,
        pageIndex: 1,
        list: [],
        dbName: cur == 0 ? "CarPublish" : "PassengerPublish",
      });
      // //加载数据
      this.addData(openid);
    }
  },

  /**
   * CarPublish 发布函数
   * 
   */
  async publishTap(e) {
    const { dbName, openid } = this.data;

    // 发布之前检查是否有未完成订单
    // const check = await db
    //   .collection(dbName)
    //   .where({
    //     _openid: openid,
    //     status: 1, //0:待发布, 1:发布成功 2:删除 3:订单完成
    //   })
    //   .orderBy("exactDate", "desc")
    //   .get();
    // if (check.data.length > 0) {
    //   return wx.showModal({
    //     content: "请先完成未完成的订单",
    //     showCancel: false,
    //   });
    // }

    let idx = e.currentTarget.dataset.idx;
    let id = e.currentTarget.dataset.id;
    let params = this.data.list[idx];
    if (!this.isValid(params.exactDate, "出行时间已超时")) return false;
    let title = dbName == "CarPublish" ? "发布出行信息" : "发布预约信息";
    wx.showModal({
      title: title,
      content: "确定发布这条信息？",
      success: async (res) => {
        if (res.confirm) {
          // 操作数据库
          try {
            const r = await db
              .collection(dbName)
              .where({ _id: id })
              .update({
                data: {
                  status: 1,
                },
              });
            wx.showToast({
              title: "发布成功",
              icon: "success",
              duration: 2000,
            });
            this.addData(openid);
          } catch (e) {
            throw Error(e);
          }
        } else if (res.cancel) {
          console.log("cancel");
        }
      },
    });
  },

  /**
   * PassengerPublish 取消函数
   * 
   */
   async PassengerPublish(e) {
    const { dbName, openid } = this.data;

    let id = e.currentTarget.dataset.id;
    wx.showModal({
      content: "确定取消这条寻车信息？",
      success: async (res) => {
        if (res.confirm) {
          // 操作数据库
          try {
            const r = await db
              .collection(dbName)
              .where({ _id: id })
              .update({
                data: {
                  status: 1,
                },
              });
            wx.showToast({
              title: "取消成功",
              icon: "success",
              duration: 2000,
            });
            this.addData(openid);
          } catch (e) {
            throw Error(e);
          }
        } else if (res.cancel) {
          console.log("cancel");
        }
      },
    });
  },

  /**
   * 完成订单
   * @param {*} e
   */
  async onSuccessOrder(e) {
    const exactdate = e.currentTarget.dataset.exactdate;
    const id = e.currentTarget.dataset.id;
    let idx = e.currentTarget.dataset.idx;
    const { dbName } = this.data;
    if (!this.isSuccessValid(exactdate, "未到出行时间")) return false;
    wx.showModal({
      title: "",
      content: "确认完成该订单？",
      success: (res) => {
        if (res.confirm) {
          //更新状态函数
          db.collection(dbName)
            .doc(id)
            .update({
              data: {
                status: 3,
              },
              success: (res) => {
                console.log(res);
                let list = this.data.list;
                let filterRes = list.filter((ele, index) => {
                  return index != idx;
                });
                this.setData({
                  list: filterRes,
                });
                wx.showToast({
                  title: "完成订单",
                  icon: "success",
                });
              },
              fail: console.error,
            });
        } else if (res.cancel) {
          console.log("cancel");
        }
      },
    });
  },

  /**
   * CarPublish 删除函数
   */
  deleteTap(e) {
    let _this = this;
    const { dbName } = this.data;
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
          //更新状态函数
          db.collection(dbName)
            .doc(id)
            .update({
              data: {
                status: 2,
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
        } else if (res.cancel) {
          console.log("cancel");
        }
      },
    });
  },

  /**
   * 校验发布时是否有效
   */
  isValid(timeStr, title) {
    console.log(new Date(timeStr).getTime(), new Date().getTime(), new Date(timeStr).getTime() >= new Date().getTime())
    if (new Date(timeStr).getTime() >= new Date().getTime()) {
      return true;
    } else {
      wx.showToast({
        title: title,
        icon: "error",
        duration: 2000,
      });
      return false;
    }
  },

  /**
   * 校验完成订单时是否有效
   */
  isSuccessValid(timeStr, title) {
    console.log(new Date(timeStr).getTime(), new Date().getTime(), new Date(timeStr).getTime() >= new Date().getTime())
    if (new Date(timeStr).getTime() <= new Date().getTime()) {
      return true;
    } else {
      wx.showToast({
        title: title,
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
    // 车主发布信息
    if (app.globalData.carStatus === 1) {
      wx.switchTab({ url: "/pages/NewPepleSearch/NewPepleSearch" });
    } else {
      wx.showModal({
        content: "必须先通过车主认证",
        showCancel: false,
      });
    }
  },
});
