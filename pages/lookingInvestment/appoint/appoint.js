// pages/lookingInvestment/appoint/appoint.js
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
    appoint: {},
    files: [] // 下一个页面传回的BP列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      appointment: app.appointment
    })
    console.log(app.appointment)
    this.getToken()
  },

  /**
 * 生命周期函数--监听页面显示
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
* 页面的初始数据
*/
  onReady: function () {
    //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
  },

  /**
 * 获取token
 */
  getToken: function () {
    let that = this
    wx.getStorage({
      key: 'accessToken',
      success: function (res) {
        that.setData({
          accessToken: res.data
        })
      },
      fail: function (err) {
        console.log(err)
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
 * 发起微信支付
 * 支付成功后调用接口
 */
  getPayment: function () {
    let that = this
    that.setData({
      loading: true
    })
    let price = Number(that.data.appointment.meetingUnitPrice) // 支付价格
    wxRequest({
      url: `${url}api/consume/cost/default`,
      header: {
        "access-token": that.data.accessToken
      },
      data: { channels: 0, fee: 0.01 }, // 支付
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
            that.getAppoint()
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
    data.type = 1;
    data.imageUrls = this.data.imageUrlList;
    data.files = this.data.files;
    data.fee = Number(that.data.price);
    this.setData({
      appoint: data
    })
    if (data.message != '' && data.preference != '') {
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
  getAppoint: function () {
    let that = this
    wxRequest({
      url: `${url}api/question/ask?investorId=${that.data.appointment.id}`,
      header: {
        "access-token": that.data.accessToken
      },
      data: that.data.appoint,
      method: 'POST'
    }).then(val => {
      if (val.data.code == 0) {
        let res = val.data.data
        wx.navigateBack({
          delta: 1
        })
      } else if (val.data.code == 500) {
        this.setData({
          message: val.data.msg
        })
        this.dialog.showDialog()
      } else {
        get401(val, that.getAppoint, that)
      }
    }).catch(err => {
      this.setData({
        message: '服务器请求出错了'
      })
      this.dialog.showDialog()
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