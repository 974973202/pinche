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
    navData: ["车找人", "人找车"],

    currentNavTab: 0, //当前状态

    dnName: "CarPublish", //查询集合列表，默认人找车

    pageIndex: 1, //第一页
    hasMore: true, //是否还有下一页
    list: [],

    hotList: [],
    hotCurrent: 0,

    //banner
    imgUrls: ["../../images/icon/banner01.jpg"],
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    //轮播页当前index
    swiperCurrent: 0,
    webUrl: ["http://wap.coobus.cn/v2/#/favorite?code=constant"],

    //发布信息按钮动画
    status: "",
    showModalStatus: true,
  },
  /**
   *
   */
  onLoad(option) {
    //是否连接数据库
    if (!wx.cloud) {
      wx.redirectTo({
        url: "../chooseLib/chooseLib",
      });
      return;
    }
    console.log(option);
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit("someEvent", { data: '从search发给index' });
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on("acceptDataFromOpenerPage", (data) => {
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
    this.setData({
      status: "",
    });
  },
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
   * 获取热点快报
   */
  // onGetHotNews(n){
  //   db.collection('RoadInfo').where({
  //     status: _.neq(0)
  //   })
  //   .orderBy('sendTime','desc')
  //   .limit(n)
  //   .get({
  //     success (res) {
  //       console.log(res.data);
  //       let list = res.data
  //       this.setData({
  //         hotList: list
  //       });
  //     },
  //     fail: console.error
  //   })
  // },

  /**
   * 导航列表点击
   */
  switchNav(event) {
    const { currentNavTab } = this.data;
    let cur = event.currentTarget.dataset.current;
    console.log(cur, "eventevent", currentNavTab);
    //每个tab选项宽度占1/5
    // let singleNavWidth = this.data.windowWidth / 5;
    //tab选项居中
    // this.setData({
    //   navScrollLeft: (cur - 2) * singleNavWidth
    // })
    if (currentNavTab == cur) {
      return false;
    } else {
      this.setData({
        currentNavTab: cur,
        pageIndex: 1,
        list: [],
      });
      //加载数据
      // this.addData(1, cur);
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
    this.addData(1, this.data.currentNavTab);
    //停止刷新，页面回单
    wx.stopPullDownRefresh();
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    console.log(this.data.pageIndex, "this.data.pageIndex");
    if (!this.data.hasMore) return; //没有下一页了

    //按照时间查询，规则开始当前时间60分钟前 到明天24：00；
    wx.cloud
      .callFunction({
        name: "queryInfo",
        data: {
          dbName: this.data.dnName,
          pageIndex: this.data.pageIndex,
          pageSize: 5,
          filter: {},
          startTime: new Date().getTime(),
          // endTime: this.endTime()
        },
      })
      .then((res) => {
        console.log(res);
        this.setData({
          list: this.data.list.concat(res.result.data),
          pageIndex: this.data.pageIndex + 1,
          hasMore: res.result.hasMore,
        });
      });
  },

  /**
   * 点击搜索
   */
  bindSearchTap: function () {
    wx.navigateTo({
      url: "../../pages/SearchPage/SearchPage",
    });
  },

  /**
   * 轮播图的切换事件
   */
  swiperChange(e) {
    this.setData({
      swiperCurrent: e.detail.current,
    });
  },

  /**
   * 轮播图点击事件
   */
  swipclick(e) {
    console.log(this.data.swiperCurrent);
    let _index = this.data.swiperCurrent;
    let str = this.data.webUrl[_index];
    wx.navigateTo({
      url: "../../pages/webViewPage/webViewPage?url=" + str + "&name=推荐",
    });
  },

  /**
   * 热点新闻切换
   */
  hotSwiperChange(e) {
    this.setData({
      hotCurrent: e.detail.current,
    });
  },

  /**
   * 查看热点新闻
   */
  hotNewsClick(e) {
    let _index = this.data.hotCurrent;
    let id = this.data.hotList[_index]._id;
    wx.navigateTo({
      url: "../../pages/ArticleDetails/ArticleDetails?path=index&id=" + id,
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
   * 发布信息按钮动画
   */
  trigger() {
    let active = this.data.status;
    if (active == "on") {
      this.setData({
        status: "",
      });
    } else {
      this.setData({
        status: "on",
      });
    }
  },
  // 隐藏遮罩层
  hideModal() {
    this.setData({
      status: "",
    });
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
