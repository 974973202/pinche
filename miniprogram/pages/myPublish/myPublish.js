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
    navData: ["我是车主", "我是乘客"],
    currentNavTab: 0,
    dbName: "CarPublish", // 'PeopleLookingCars'
    dbNameRecord: "CarOwnerRecord", // 'PassengersRecord'
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
    _this.addData(_this.data.openid);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // this.addData(this.data.openid);
  },

  /**
   * 加载数据列表
   */
  addData(openid) {
    const { dbName, currentNavTab } = this.data;
    const _ = db.command;
    let _this = this;
    db.collection(dbName)
      .where({
        _openid: openid,
        status: _.neq(2), //0:待发布, 1:发布成功 2:删除
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
        dbName: cur == 0 ? "CarPublish" : "PeopleLookingCars",
        dbNameRecord: cur == 0 ? "CarOwnerRecord" : "PassengersRecord",
      });
      // //加载数据
      this.addData(openid);
    }
  },

  /**
   * 发布函数
   */
  publishTap(e) {
    let idx = e.currentTarget.dataset.idx;
    let id = e.currentTarget.dataset.id;
    const { dbName, openid } = this.data;

    let params = this.data.list[idx];
    if (!this.isValid(params.exactDate)) return false;
    //修改出发时间
    // params.exactDateTag == '今天' ? this.getTodyTime(params.exactTime) : this.getTomorrowTime(params.exactTime);
    //存放时间戳
    //添加数据库时 _id、_openid不能存在否则报错
    // delete params._id;
    // delete params._openid;

    //判断是否有效
    // delete params.exactDateTag;

    //添加个人信息
    // params.userInfo = wx.getStorageSync('userInfo');
    console.log(params, idx, id);

    wx.showModal({
      title: "车找人",
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
   * 删除函数
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
    const { currentNavTab } = this.data;
    if (currentNavTab == 0) {
      wx.navigateTo({ url: "/pages/NewPepleSearch/NewPepleSearch" });
    } else {
      wx.navigateTo({ url: "/pages/NewCarSearch/NewCarSearch" });
    }
  },
});
