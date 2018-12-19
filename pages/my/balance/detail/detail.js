// pages/my/balance/detail/detail.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var get401 = app.globalData.get401
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    detailList: []
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
        if (typeof res.data == 'undefined') {
          app.globalData.wxLogin(that.getDetailList, that)
        } else {
          that.setData({
            accessToken: res.data
          })
          that.getDetailList()
        }
      },
      fail: function (res) {
        app.globalData.wxLogin(that.getDetailList, that)
      }
    })
  },

  /**
  * 加载数据
  */
  getDetailList: function () {
    let that = this
    wxRequest({
      url: `${url}api/consume/bills?page=${that.data.page}&size=20`,
      header: {
        "access-token": that.data.accessToken
      }
    }).then(val => {
      if (val.data.code == 0) {
        var detailList = that.data.detailList
        val.data.data.content.forEach(value => {
          detailList.push(value)
        })
        that.setData({
          totalPages: val.data.data.totalPages,
          detailList: detailList
        })
        that.data.page ++
      } else {
        get401(val, that.getDetailList, that)
      }
    }).catch(err => {
      console.log(err)
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    var page = that.data.page
    var totalPages = that.data.totalPages
    if (page < totalPages) {
      that.getDetailList()
    }
  },

})