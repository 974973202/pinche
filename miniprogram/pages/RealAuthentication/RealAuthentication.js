const app = getApp();
const db = wx.cloud.database()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    zmSfzImage: "",
    fmSfzImage: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  onChooseMedia(e) {
    const {
      currentTarget: {
        dataset: { name },
      },
    } = e;
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      camera: "back",
      success: (res) => {
        let item = res.tempFiles[0].tempFilePath;
        let suffix = /\.\w+$/.exec(item)[0];
        wx.cloud.uploadFile({
          cloudPath:
            "blog/" + Date.now() + "-" + Math.random() * 1000000 + suffix,
          filePath: item,
          success: (res) => {
            console.log(res);
            this.setData({
              [name]: res.fileID,
            });
          },
          fail: (err) => {
            console.error(err);
          },
        });
      },
    });
  },

  formSubmit(e) {
    const params = e.detail.value;
    if (!params.name || !params.phone) {
      // 请填写完整姓名和手机号
      wx.showModal({
        content: "请填写完整姓名和手机号",
        showCancel: false,
      });
      return;
    }
    const { zmSfzImage, fmSfzImage } = this.data;
    if (!zmSfzImage || !fmSfzImage) {
      // 请上传完整身份证信息
      wx.showModal({
        content: "请上传身份证信息",
        showCancel: false,
      });
      return;
    }
    const data = { ...params, zmSfzImage, fmSfzImage };
    console.log(data, "xxxxxxxxx");
    db.collection("User")
      .add({
        data: {
          ...data,
          status: 0, // 状态： 0 审核中 1 审核通过 2 审核不通过
          createTime: db.serverDate(), // 服务端的时间
        },
      })
      .then((res) => {
        wx.showToast({
          title: "添加实名认证成功",
          icon: "success",
          success: (res) => {
            //返回页面
            // wx.navigateBack();
            wx.switchTab({
              url: "/pages/myCenter/myCenter",
            });
          },
        });
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
