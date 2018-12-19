// pages/lookingInvestment/askQuestions/askQuestions.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var get401 = app.globalData.get401
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageList: [], // 本地选择图片列表
    imageUrlList: [], // 上传图片后返回的http链接列表
    private:'公开',
    question: {},
    files: [] // BP列表
  },

  /**
 * 页面的初始数据
 */
  onReady: function () {
    //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
  },

  /**
   * 生命周期函数--监听页面加载
   * 获取上一个页面传过来的数据
   */
  onLoad: function (options) {
    let name = options.name
    let price = options.price
    let id = options.id
    this.getToken()
    this.setData({
      name: name,
      price: price,
      id: id
    })
  },

  /**
  * 生命周期函数--监听页面显示
  * 获取下一个页面返回的数据
  */
  onShow: function () {
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];
    if (currPage.data.urlList != "") {
      this.setData({
        files: currPage.data.urlList
      });
    }
    console.log(this.data.files)
  },

  /**
 * 获取token
 */
  getToken: function () {
    let that = this
    wx.getStorage({
      key: 'accessToken',
      success: function (res) {
        if (typeof res.data == 'undefined') {
          app.globalData.wxLogin(that.getAuditList, that)
        } else {
          that.setData({
            accessToken: res.data
          })
        }
      },
      fail: function (res) {
        app.globalData.wxLogin(that.getAuditList, that)
      }
    })
  },

   /**
   * 跳转到上传到BP
   */
  navigatorBP: function () {
    wx.navigateTo({
      url: `/pages/upload/upload?type=type`,
    })
  },

  /**
   * 选择图片
   */
  chooseImage: function () {
    var that = this
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          imageList: res.tempFilePaths
        })
        // 选择完后上传图片
        that.uploadImage() 
      }
    })
  },

  /**
   * 预览图片
   */
  previewImage: function (e) {
    let that = this
    var current = e.target.dataset.src
    wx.previewImage({
      current: current,
      urls: that.data.imageList
    })
  },

  /**
   * 私密提问
   */
  switchChange: function (e) {
    let that = this
    let value = e.detail.value
    let price = Number(that.data.price)
    if (value) {
      wx.showModal({
        title: "提示信息",
        content: "私密提问，获取Ta的专属语音回答",
        showCancel: false,
        confirmText: "确定"
      })
      that.setData({
        private: '私密',
        price:  price + 10  
      })
    } else {
      this.setData({
        private: '公开',
        price: price - 10 
      })
    }
  },


  /**
   * 发起微信支付
   * 支付成功后调用接口
   */
  getPayment: function () {
    let that = this
    that.setData({
      loading: true
    })
    let price = Number(that.data.price) // 支付价格
    wxRequest({
      url: `${url}api/consume/cost/default`,
      header: {
        "access-token": that.data.accessToken
      },
      data: { channels: 0, fee: 1 }, // 支付
      method: 'POST'
    }).then(val => {
      if (val.data.code == 0) {
        var payargs = val.data.data
        wx.requestPayment({
          timeStamp: String(payargs.timeStamp),
          nonceStr: payargs.nonceStr,
          package: payargs.package,
          signType: payargs.signType,
          paySign: payargs.paySign,
          'success': function (res) {
              that.getQuestion()
          },
          'fail': function (res) {
          }
        })
        that.setData({
          loading: false
        })
      } else {
        get401(val, that.getPayment, that)
      }
    }).catch(err => {
      console.log(err)
    })
  },

  /**
   * 提交按钮
   * 发起微信支付
   */
  formSubmit: function (e) {
    let data = e.detail.value
    data.length = 0;
    data.messageType = 0;
    data.openness = !data.openness;
    data.type = 0;
    data.imageUrls = this.data.imageUrlList;
    data.files = this.data.files;
    data.fee = Number(that.data.price);
    this.setData({
      question: data
    })
    console.log(this.data.question)
    if (data.message != '') {
      this.getPayment()
    } else {
      this.setData({
        message: '请将信息填写完全'
      })
      this.dialog.showDialog()
    }
  },

    /**
   * 支付成功后调用接口
   */
  getQuestion: function () {
    let that = this
    wxRequest({
      url: `${url}api/question/ask?investorId=${that.data.id}`,
      header: {
        "access-token": that.data.accessToken
      },
      data: that.data.question,
      method: 'POST'
    }).then(val => {
      if (val.data.code == 0) {
        let res = val.data.data
         wx.navigateTo({
            url: `/pages/my/haveAsked/haveAsked`,
          })
      } else {
        get401(val, that.getQuestion, that)
      }
    }).catch(err => {
      console.log(err)
    })
  },

  /**
   * 上传图片
   */
  uploadImage: function () {
    var imageList = this.data.imageList
    var imageUrlList = this.data.imageUrlList
    for (var i = 0; i < imageList.length; i++) {
      wx.uploadFile({
        url: `${url}api/file/upload`, //仅为示例，非真实的接口地址
        filePath: imageList[i],
        name: 'file',
        success: function (val) {
          var data = JSON.parse(val.data)
          if (data.code == 0) {
            wx.showToast({
              title: '图片上传成功',
              icon: 'success',
              duration: 1000
            })
            imageUrlList.push(data.data.url)
          } else {
            wx.showToast({
              title: '图片上传失败',
              icon: 'warn',
              duration: 1000
            })
          }
        },
      })
    }
  }
})