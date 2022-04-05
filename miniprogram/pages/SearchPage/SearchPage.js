// miniprogram/pages/SearchPage/SearchPage.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
const {
  tsFormatTime,
  exactTime,
  generateTimeReqestNumber,
} = require("../../utils/utils");
Page({
  data: {
    isLodding: true,

    statusBarHeight: 0, //状态栏高度
    titleBarHeight: 0, //标题栏高度
    navBarHeight: 0, //导航栏高度

    currentNavTab: 0, //当前状态

    dnName: "CarPublish", //查询集合列表，默认人找车

    pageIndex: 1, //第一页
    hasMore: true, //是否还有下一页
    list: [],
  },
  /**
   *
   */
  onLoad(option) {
    console.log(option, 'option');
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit("someEvent", { data: '从search发给index' });
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on("acceptDataFromOpenerPage", (data) => {
      this.setData({ eventData: data })
      this.addData(1, data);//第一个参数页数，第二个参数分类
    });
    // this.onGetSystemInfo();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    
  },
  // async addPublic() {
  //   let getUserProfile = wx.getStoragceSync("getUserProfile");
  //   if (!getUserProfile) {
  //     getUserProfile = await wx.getUserProfile({
  //       desc: "用于完善个人信息",
  //     });
  //     getUserProfile = getUserProfile.userInfo;
  //     wx.setStorageSync("getUserProfile", getUserProfile);
  //   }
  //   // 乘客发布，判断是否实名认证
  //   // myCenter页面，我的发布已经做了实名校验
  //   if (app.globalData.info.status === 1) {
  //     // 判断乘客是否有订单 正在进行或未完成
  //     // 0:匹配中, 1:已取消 2:删除 3:订单完成 4:匹配成功
  //     const { data } = await db
  //     .collection('PassengerPublish')
  //     .where({
  //       _openid: app.globalData.openid,
  //       status: _.in([0,4]), 
  //     })
  //     .field({
  //       status: true,
  //     })
  //     .get();
  //     if(data.length> 0) {
  //       if(data[0].status === 0) {
  //         wx.showModal({
  //           content: "已有订单正在匹配中",
  //           showCancel: false,
  //         });
  //       }
  //       if(data[0].status === 4) {
  //         wx.showModal({
  //           content: "有订单尚未完成",
  //           showCancel: false,
  //         });
  //       }
  //       return ;
  //      }
  //     console.log(data)
  //     wx.navigateTo({ url: "/pages/NewCarSearch/NewCarSearch" });
  //   } else {
  //     wx.showModal({
  //       content: "必须先通过实名认证",
  //       showCancel: false,
  //     });
  //   }
  // },
  /**
   * 获取设备信息
   */
  onGetSystemInfo: function () {
    // 因为很多地方都需要用到，所有保存到全局对象中
    if (app.globalData.statusBarHeight && app.globalData.titleBarHeight) {
      this.setData({
        statusBarHeight: app.globalData.statusBarHeight,
        titleBarHeight: app.globalData.titleBarHeight,
        navBarHeight: app.globalData.navBarHeight,
        windowHeight: app.globalData.windowHeight,
        windowWidth: app.globalData.windowWidth,
      });
    } else {
      wx.getSystemInfo({
        success: (res) => {
          console.log(res);
          if (!app.globalData) {
            app.globalData = {};
          }
          //这里默认iOS安卓导航栏都是44;
          app.globalData.titleBarHeight = 44;
          app.globalData.statusBarHeight = res.statusBarHeight;
          app.globalData.windowHeight = res.windowHeight;
          app.globalData.windowWidth = res.windowWidth;
          app.globalData.navBarHeight = res.statusBarHeight + 44;
          this.setData({
            statusBarHeight: app.globalData.statusBarHeight,
            titleBarHeight: app.globalData.titleBarHeight,
            navBarHeight: app.globalData.navBarHeight,
            windowHeight: app.globalData.windowHeight,
            windowWidth: app.globalData.windowWidth,
          });
        },
        failure: () => {
          this.setData({
            statusBarHeight: 0,
            titleBarHeight: 0,
          });
        },
      });
    }
  },

  /**
   * 获取有效的拼车信息
   */
  addData(n, { data: { dnName, endRegion, startRegion } }) {
    wx.showLoading({
      title: "加载中...",
    });
    wx.cloud
      .callFunction({
        name: "queryInfo",
        data: {
          dbName: dnName,
          pageIndex: n,
          pageSize: 5,
          filter: {
            startRegion,
            endRegion,
            status: 1
          },
          startTime: new Date().getTime(),
          // endTime: this.endTime()
        },
      })
      .then((res) => {
        console.log(res.result.data);
        res.result.data.forEach(
          (ele) => (ele.exactDate = generateTimeReqestNumber(ele.exactDate))
        );
        this.setData({
          isLodding: false,
          list: res.result.data,
          pageIndex: this.data.pageIndex + 1,
          hasMore: res.result.hasMore,
        });
        wx.hideLoading();
      });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    //显示刷新图标
    wx.showLoading({
      title: "加载中...",
    });
    this.setData({
      pageIndex: 1,
    });
    // this.onGetHotNews(10);//获取热点新闻
    this.addData(1, this.data.eventData);
    //停止刷新，页面回单
    wx.stopPullDownRefresh();
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    console.log(this.data.pageIndex, "this.data.pageIndex");
    if (!this.data.hasMore) return; //没有下一页了
    const { endRegion, startRegion } = this.data.eventData;

    //按照时间查询，规则开始当前时间60分钟前 到明天24：00；
    wx.cloud
      .callFunction({
        name: "queryInfo",
        data: {
          dbName: this.data.dnName,
          pageIndex: this.data.pageIndex,
          pageSize: 5,
          filter: {
            startRegion,
            endRegion,
            status: 1
          },
          startTime: new Date().getTime(),
          // endTime: this.endTime()
        },
      })
      .then((res) => {
        console.log(res);
        res.result.data.forEach(
          (ele) => (ele.exactDate = generateTimeReqestNumber(ele.exactDate))
        );
        this.setData({
          isLodding: false,
          list: this.data.list.concat(res.result.data),
          pageIndex: this.data.pageIndex + 1,
          hasMore: res.result.hasMore,
        });
      });
  },

  /**
   * 查看行程详情
   */
  lookTripDetails(e) {
    let id = e.currentTarget.dataset.id;
    let idx = e.currentTarget.dataset.idx;
    let item = this.data.list[idx];
    console.log(item);
    if (item.isSpeed) {
      wx.navigateTo({
        url: `../../pages/tripDetails/tripDetails?id=${id}`,
      });
    } else {
      wx.navigateTo({
        url: "../../pages/passengersTripDetails/PassengersTripDetails?id=" + id,
      });
    }
  },

  /**
   * 获取60分钟前时间戳
   */
  startTime: function () {
    let day = new Date();
    let strTime = day.getTime() - 1 * 60 * 60 * 1000;
    console.log(strTime);
    return strTime;
  },

  /**
   * 获取次日凌晨时间戳
   */
  endTime: function () {
    // 获取当天 0 点的时间戳
    let oneTime = new Date(new Date().setHours(0, 0, 0, 0)) / 1000;
    //次日凌晨时间戳
    let threeTime = oneTime + 86400 * 2;
    console.log(threeTime * 1000);
    return threeTime * 1000;
  },
});
