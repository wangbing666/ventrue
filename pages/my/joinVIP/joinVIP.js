// pages/my/joinVIP/joinVIP.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var get401 = app.globalData.get401
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [
      { logo: '/image/my/qingtong.png', name: '加入青铜会员', price: '365', status: 1},
      { logo: '/image/my/baiying.png', name: '加入白银会员', price: '999', status: 2},
      { logo: '/image/my/huangjing.png', name: '加入黄金会员', price: '5888', status: 3}
    ],
    total: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getToken()
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
        that.getCard()
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },

  /**
  *设置当前页面标题
  */
  setTitle: function () {
    if (this.data.card.user.userLevel == 0) {
      wx.setNavigationBarTitle({
        title: '加入会员'
      })
    } else {
      wx.setNavigationBarTitle({
        title: '我的会员'
      })
    }
  },

  /**
  * 刷新页面数据
  */
  getCard: function () {
    let that = this
    wxRequest({
      url: `${url}api/businessCard/getBusinessCard`,
      header: {
        "access-token": that.data.accessToken
      }
    }).then(val => {
      if (val.data.code == 0 && val.data.data) {
        that.setData({
          card: val.data.data[0]
        })
        that.setTitle()
        wx.setStorage({
          key: 'card',
          data: val.data.data
        })
      } else {
        get401(val, that.getCard, that)
      }
    }).catch(err => {
      console.log(err)
    })
  },

  /**
   * 选择会员等级
   */
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({
      total: e.detail.value
    })
  },

  /**
   * 微信支付
   */
  bindApply: function () {
    var userLevel;
    var that = this
    var price = Number(that.data.total) // 价格
    if (price != 0) {
      that.setData({
        loading: true
      })
      if (price == 365) {
        userLevel = 1
      }
      if (price == 999) {
        userLevel = 2
      }
      if (price == 5888) {
        userLevel = 3
      }
      wxRequest({
        url: `${url}api/consume/cost/default`,
        header: {
          "access-token": that.data.accessToken
        },
        data: { channels: 1, ext: { userLevel: userLevel }, fee: 0.1 }, // 支付
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
              that.getCard()
            },
            'fail': function (res) {

            }
          })
          that.setData({
            loading: false
          })
        } else {
          get401(val, that.bindApply, that)
        }
      }).catch(err => {
        console.log(err)
      })
    }
  },

  bindModal: function (e) {
    var id = e.currentTarget.dataset.id
    console.log(id)
    this.setData({
      showModal: true,
      showTips: true,
      equity: id
    })
  },

  closeModal: function () {
    this.setData({
      showModal: false,
      showTips: false
    })
  }
})