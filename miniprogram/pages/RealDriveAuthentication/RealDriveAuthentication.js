const app = getApp();
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    zmJszImage: "",
    fmJszImage: "",
    zmXszImage: "",
    fmXszImage: "",
    photo: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const { data: User = [{}] } = await db
      .collection("User")
      .field({
        name: true,
        phone: true,
      })
      .get();
    this.setData({
      name: User[0]?.name,
      phone: User[0]?.phone,
    });
  },

  inputedit(e){
    const { type } = e.currentTarget.dataset;
    this.setData({
      [type]: e.detail.value
    })
  },

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

        // let item = res.tempFiles[0].tempFilePath;
        // let suffix = /\.\w+$/.exec(item)[0];
        // wx.cloud.uploadFile({
        //   cloudPath:
        //     "blog/" + Date.now() + "-" + Math.random() * 1000000 + suffix,
        //   filePath: item,
        //   success: (res) => {
        //     console.log(res);
        this.setData({
          [name]: item,
        });
      },
      fail: (err) => {
        console.error(err);
      },
      // });
      // },
    });
  },

  onSubmit(e) {
    const { zmJszImage, fmJszImage, zmXszImage, fmXszImage, phone, name } = this.data;
    const reg = new RegExp(/^1[3,4,5,6,7,8,9][0-9]{9}$/);
    if(!phone || !(reg.test(phone))) {
      wx.showToast({ title: "输入正确手机号", icon: "error" });
      return;
    }
    if(!name) {
      wx.showToast({ title: "请输入姓名", icon: "error" });
      return;
    }
    if (!zmJszImage || !fmJszImage) {
      // 请上传完整驾驶证信息
      wx.showModal({
        content: "请上传完整驾驶证信息",
        showCancel: false,
      });
      return;
    }
    if (!zmXszImage || !fmXszImage) {
      wx.showModal({
        content: "请上传完整行驶证信息",
        showCancel: false,
      });
      return;
    }

    wx.showLoading({
      title: "申请认证中",
      mask: true,
    });

    // 2、数据 -> 云数据库
    // 数据库：内容、图片fileID、openid、昵称、头像、时间
    // 1、图片 -> 云存储 fileID 云文件ID
    let promiseArr = [];
    for (let key of Object.keys(this.data)) {
      if (!["__webviewId__", 'name', 'phone'].includes(key)) {
        let p = new Promise((resolve, reject) => {
          let item = this.data[key];
          // 文件扩展名
          let suffix = /\.\w+$/.exec(item)[0];
          wx.cloud.uploadFile({
            cloudPath:
              "certificates/" +
              Date.now() +
              "-" +
              Math.random() * 1000000 +
              suffix,
            filePath: item,
            success: (res) => {
              this.setData({
                [key]: res.fileID,
              });
              resolve();
            },
            fail: (err) => {
              console.error(err);
              reject();
            },
          });
        });
        promiseArr.push(p);
      }
    }
    console.log(this.data, "data", promiseArr);

    // 存入到云数据库
    Promise.all(promiseArr)
      .then(async () => {
        // const { data: userData = [{}] } = await db
        //   .collection("User")
        //   .field({
        //     name: true,
        //     phone: true,
        //   })
        //   .get();
        const { __webviewId__, ...rest } = this.data;
        const res = await db.collection("Certificates").add({
          data: {
            ...rest,
            // name: userData[0].name,
            // phone: userData[0].phone,
            status: 0, // 状态： 0 审核中 1 审核通过 2 审核不通过
            createTime: db.serverDate(), // 服务端的时间
          },
        });
        console.log(res, "resresres");
        wx.hideLoading();
        wx.showToast({
          title: "申请认证成功",
        });

        // 返回myCenter页面，并且刷新
        wx.switchTab({
          url: "/pages/myCenter/myCenter",
        });
      })
      .catch((err) => {
        console.log(err, "err");
        wx.hideLoading();
        wx.showToast({
          title: "失败",
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
