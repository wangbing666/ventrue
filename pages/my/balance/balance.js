// pages/my/balance/balance.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var get401 = app.globalData.get401
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
      card: app.card[0]
    })
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
      },
      fail: function (err) {
        console.log(err)
      }
    })
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
        wx.setStorage({
          key: 'card',
          data: res.data.data
        })
      } else {
        get401(val, that.getCard, that)
      }
    }).catch(err => {
      console.log(err)
    })
  },

  /**
  * 微信支付
  */
  bindApply: function () {
    this.setData({
      showModal: true,
      showTips: true
    })
  },
  // 明细
  detail: function () {
    wx.navigateTo({
      url: '/pages/my/balance/detail/detail'
    })
  },

  closeModal: function () {
    this.setData({
      showModal: false,
      showTips: false
    })
  },

  inputBalance: function (e) {
    this.setData({
      balance: e.detail.value
    })
  },

  bindConfirm: function () {
    var that = this
    var userLevel = that.data.balance; // 价格
    if (userLevel > 0) {
      wxRequest({
        url: `${url}api/consume/cost/default`,
        header: {
          "access-token": that.data.accessToken
        },
        data: { channels: 2, fee: 1 }, // 支付
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
  }
})