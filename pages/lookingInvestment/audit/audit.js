// pages/lookingInvestment/audit/audit.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var get401 = app.globalData.get401
const innerAudioContext = wx.createInnerAudioContext()
Page({

  /**
   * 页面的初始数据
   */
  data: {
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      audit: app.globalInvestment
    })
    this.getToken()
    this.setTitle()
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
          that.getAuditList()
        }
      },
      fail: function (res) {
        app.globalData.wxLogin(that.getAuditList, that)
      }
    })
  },

   /**
   * 获取问题列表
   */
  getAuditList: function () {
    let that = this
    wxRequest({
      url: `${url}api/question/look?questionId=${that.data.audit.id}`,
      header: {
        "access-token": that.data.accessToken
      }
    }).then(val => {
      if (val.data.code == 0) {
        that.setData({
          auditList: val.data.data,
        })
        console.log(val.data.data)
      } else {
        get401(val, that.getAuditList, that)
      }
    }).catch(err => {
      console.log(err)
    })
  },

  /**
   * 设置界面标题
   */
  setTitle: function () {
    let that = this
    wx.setNavigationBarTitle({
      title: that.data.audit.message
    })
  },

  /**
   * 查看图片
   */
  previewImage: function (e) {
    var imgList = this.data.audit.imageUrls
    var url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },
  
  /**
   * 发起微信支付
   * 支付成功后调用接口
   */
  bindAudit: function () {
    let that = this
    this.setData({
      loading: true
    })
    wxRequest({
      url: `${url}api/consume/cost/default`,
      header: {
        "access-token": that.data.accessToken
      },
      data: { channels: 3, fee: 0.01, ext: { questionId: that.data.audit.id} },   // 支付
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
            console.log('支付成功')
            // that.setStatus()
            that.getAuditList()
          },
          'fail': function (res) {
            console.log('支付失败')
          }
        })
        that.setData({
          loading: false
        })
      } else {
        get401(val, that.bindAudit, that)
      }
    }).catch(err => {
      that.setData({
        message: '服务器请求出错了'
      })
      that.dialog.showDialog()
    })
  },

  /**
   * 支付成功后调用接口更改状态
   */
  setStatus: function () {
    let that = this
    wxRequest({
      url: `${url}api/question/relation/add`,
      header: {
        "access-token": that.data.accessToken
        // 'content-type': 'application/json' 
      },
      data: { questionId: that.data.audit.id},
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
            console.log('支付成功')
            that.setStatus()
            that.getAuditList()
          },
          'fail': function (res) {
            console.log('支付失败')
          }
        })
        that.setData({
          loading: false
        })
      } else {
        get401(val, that.bindAudit, that)
      }
    }).catch(err => {
      that.setData({
        message: '服务器请求出错了'
      })
      that.dialog.showDialog()
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
  },

  /**
  * 语音播放
  */
  audioPlay: function (e) {
    let audio = e.currentTarget.dataset.value
    console.log(audio.message)
    innerAudioContext.autoplay = true
    innerAudioContext.src = audio.message
    innerAudioContext.play()
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })

    innerAudioContext.onEnded((res) => {
      innerAudioContext.stop()
    })

    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },

  /**
   * 页面隐藏后销毁
   */
  onUnload: function () {
    console.log('页面卸载')
    innerAudioContext.stop()
  }
})