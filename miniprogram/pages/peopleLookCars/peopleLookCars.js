// miniprogram/pages/peopleLookCars/peopleLookCars.js
const app = getApp();
const db = wx.cloud.database();
const { tsFormatTime } = require("../../utils/utils");

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
  //加载数据
  addData(openid) {
    const _ = db.command;
    db.collection("PeopleLookingCars")
      .where({
        _openid: openid,
        status: _.neq(1),
      })
      .orderBy("createdTime", "desc")
      .get({
        success: (res) => {
          console.log("人找车列表数据", res.data);
          res?.data?.forEach((ele) => {
            console.log(ele);
            ele.createdTime = tsFormatTime(ele.createdTime);
          });
          wx.hideLoading();
          this.setData({
            list: res.data,
            isLodding: false,
          });
        },
        fail: console.error,
      });
  },
  //发布函数
  publishTap: function (e) {
    let _this = this;
    let idx = e.currentTarget.dataset.idx;
    let id = e.currentTarget.dataset.id;
    console.log("要发布的数据", e);

    wx.showModal({
      title: "人找车",
      content: "确定发布这条寻车信息？",
      success: (res) => {
        if (res.confirm) {
          let params = _this.data.list[idx];
          if (!_this.isValid(params.exactDate)) return false;
          wx.showLoading({
            title: "正在发布中...",
          });
          console.log("ok");
          // let params = _this.data.list[idx];
          //修改出发时间
          // params.exactDateTag == "今天"
          //   ? _this.getTodyTime(params.exactTime)
          //   : _this.getTomorrowTime(params.exactTime);
          params.userInfo = app.globalData.userInfo;
          //添加数据库时 _id、_openid不能存在否则报错
          delete params._id;
          delete params._openid;

          //判断是否有效
          // if (!_this.isValid(params.exactDate)) return false;
          //添加个人信息
          params.userInfo = app.globalData.userInfo;

          console.log(params);
          db.collection("PassengersRecord").add({
            data: params,
            success: function (res) {
              console.log(res);
              //发布成功
              wx.hideLoading();
              wx.showToast({
                title: "发布成功",
                icon: "success",
                duration: 2000,
              });
              const pages = getCurrentPages();
              var prevPage = pages[pages.length - 2];
              prevPage.setData({
                currentNavTab: 1,
                pageIndex:1
              });
              console.log(prevPage);
              wx.switchTab({
                url: "/pages/index/index",
              });
            },
            fail: wx.hideLoading(),
          });
        } else if (res.cancel) {
          console.log("cancel");
        }
      },
    });
  },
  //删除函数
  deleteTap: function (e) {
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
              db.collection("PeopleLookingCars")
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

  //校验发布时是否有效
  isValid: function (timeStr) {
    let day = new Date();
    if (timeStr >= day.getTime()) {
      return true;
    } else {
      wx.showModal({
        title: "人找车",
        content: "出发时间已超时,请重新设置",
      });
      return false;
    }
  },
});
