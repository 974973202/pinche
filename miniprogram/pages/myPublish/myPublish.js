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
    // 'PassengerPublish' //0:匹配中, 1:已取消 2:删除 3:订单完成 4:匹配成功

    shows: false, //控制下拉列表的显示隐藏，false隐藏、true显示

    selectDatas: ["全部订单", "待发布", "已发布", "已完成"], //下拉列表的数据
    selectIndex: 0,

    showShareDialog: false,
    dateIndex: "",
    exactTime: "",
    idTime: "", // 需要修改时间的id
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  onShow() {
    this.setData(
      {
        openid: app.globalData.openid,
      },
      () => {
        this.addData(this.data.openid);
      }
    );
  },

  // 点击下拉显示框
  selectTaps() {
    this.setData({
      shows: !this.data.shows,
    });
  },
  // 点击下拉列表
  optionTaps(e) {
    let selectIndex = e.currentTarget.dataset.index; //获取点击的下拉列表的下标
    console.log(selectIndex);
    this.setData({
      selectIndex: selectIndex,
      shows: !this.data.shows,
    });
    const { openid } = this.data;
    this.addData(openid, selectIndex);
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
  addData(openid, status = "null") {
    const _ = db.command;

    let where = {
      _openid: openid,
      status: _.in([0, 1, 2]),
    };
    if (status === "null" || status == 0) {
      this.setData({
        selectIndex: 0,
      });
    } else {
      where.status = status - 1;
    }
    db.collection("CarPublish")
      .where(where)
      .orderBy("exactDate", "desc")
      .get({
        success: (res) => {
          console.log(
            res.data
          );
          wx.hideLoading();
          this.setData({
            list: res.data,
            isLodding: false,
          });
        },
        fail: console.error,
      });
  },

  /**
   * CarPublish 发布函数
   *
   */
  async publishTap(e) {
    const { openid } = this.data;

    // 发布之前检查是否有未完成订单
    // const check = await db
    //   .collection('CarPublish')
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
    let type = e.currentTarget.dataset.type;
    if (type === "publish") {
      let params = this.data.list[idx];
      // if (!this.isValid(params.exactDate, "出行时间已超时")) return false;
      wx.showModal({
        title: "发布行程",
        content: "确定发布这条信息？",
        success: async (res) => {
          if (res.confirm) {
            // 操作数据库
            try {
              const r = await db
                .collection("CarPublish")
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
    } else {
      let exactTime = e.currentTarget.dataset.exacttime;
      let dateIndex = e.currentTarget.dataset.dateindex;
      this.setData({
        showShareDialog: true,
        exactTime,
        dateIndex,
        idTime: id,
      });
    }
  },

  /**
   * PassengerPublish 取消函数
   *
   */
  async PassengerPublish(e) {
    const { openid } = this.data;

    let id = e.currentTarget.dataset.id;
    wx.showModal({
      content: "确定取消这条寻车信息？",
      success: async (res) => {
        if (res.confirm) {
          // 操作数据库
          try {
            const r = await db
              .collection("CarPublish")
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
    const id = e.currentTarget.dataset.id;
    const {
      data: { passengerInfo = [] },
    } = await db.collection("CarPublish").doc(id).get();
    let iscomt = true;
    passengerInfo.forEach((ele) => {
      if (ele.status != 2) {
        iscomt = false;
      }
    });
    if (!iscomt)
      return wx.showToast({
        title: "有乘客未下车",
        icon: "error",
      });
    // if (!this.isSuccessValid(exactdate, "未到出行时间")) return false;
    wx.showModal({
      title: "",
      content: "确认完成该订单？",
      success: (res) => {
        if (res.confirm) {
          //更新状态函数
          db.collection("CarPublish")
            .doc(id)
            .update({
              data: {
                status: 2,
              },
              success: async (res) => {
                const { openid } = this.data;
                this.addData(openid, 0);
                wx.showToast({
                  title: "完成订单",
                  icon: "success",
                });

                // 统计车主完成订单数 按车主完成订单统计
                // 姓名 手机 区域 方向 出行时间 人数
                const dateIndex = e.currentTarget.dataset.dateindex;
                const name = e.currentTarget.dataset.name;
                const phone = e.currentTarget.dataset.phone;
                const startRegion = e.currentTarget.dataset.startregion;
                const endregion = e.currentTarget.dataset.endregion;
                const startlocation = e.currentTarget.dataset.startlocation;
                const endlocation = e.currentTarget.dataset.endlocation;
                const passengerinfo = e.currentTarget.dataset.passengerinfo || [];
                let count = 0;
                passengerinfo.forEach(ele => {
                  if(ele.number) {
                    count = count + Number(ele.number);
                  }
                })
                db.collection("carOrder")
                  .add({
                    data: {
                      name,
                      phone,
                      startRegion,
                      endregion,
                      location: `${startlocation} -> ${endlocation}`,
                      dateIndex,
                      count,
                    }
                  })

                // 统计车主完成订单数 按车主完成订单区域统计 carOrderRegion
                wx.cloud.callFunction({
                  name: 'carOrderRegion',
                  data: {
                    dbName: 'carOrderRegion',
                    startRegion,
                    [startRegion]: {
                      name,
                      phone,
                      startRegion,
                      endregion,
                      location: `${startlocation} -> ${endlocation}`,
                      dateIndex,
                      count,
                    }
                  }
                }).then(res => console.log(res))


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
  async deleteTap(e) {
    let _this = this;
    let idx = e.currentTarget.dataset.idx;
    let id = e.currentTarget.dataset.id;
    let {
      data: { passengerInfo = [] },
    } = await db.collection("CarPublish").doc(id).get();
    if (passengerInfo.length > 0) {
      let isbool = true;
      passengerInfo.forEach(({ status }) => {
        if (status != 2) {
          isbool = false;
        }
      });
      if (isbool) {
        return wx.showToast({
          title: "已有乘客",
          icon: "error",
        });
      }
    }

    wx.showModal({
      title: "",
      content: "确定删除这条信息？",
      success: function (res) {
        if (res.confirm) {
          console.log("ok");
          //更新状态函数
          db.collection("CarPublish")
            .doc(id)
            .update({
              data: {
                status: 3,
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
    console.log(
      new Date(timeStr).getTime(),
      new Date().getTime(),
      new Date(timeStr).getTime() >= new Date().getTime()
    );
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
    console.log(
      new Date(timeStr).getTime(),
      new Date().getTime(),
      new Date(timeStr).getTime() >= new Date().getTime()
    );
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
      wx.navigateTo({ url: "/pages/DrivePublish/DrivePublish" });
    } else {
      wx.showModal({
        content: "必须先通过车主认证",
        showCancel: false,
      });
    }
  },

  hideDialog() {
    this.setData({ showShareDialog: false });
  },
  handleSave(e) {
    const { idTime, openid } = this.data;
    db.collection("CarPublish")
      .where({ _id: idTime })
      .update({
        data: {
          ...e.detail,
        },
      })
      .then((res) => {
        this.addData(openid);
        this.hideDialog();
      });
  },
  onCall(e) {
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    });
  },
});
