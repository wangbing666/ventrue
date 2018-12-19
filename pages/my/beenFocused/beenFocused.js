// pages/my/beenFocused/beenFocused.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var get401 = app.globalData.get401
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
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
          app.globalData.wxLogin(that.getInvestmentList, that)
        } else {
          that.setData({
            accessToken: res.data
          })
          that.getInvestmentList()
        }
      },
      fail: function (res) {
        app.globalData.wxLogin(that.getInvestmentList, that)
      }
    })
  },

  /**
  * 加载数据
  */
  getInvestmentList: function () {
    let that = this
    wxRequest({
      url: `${url}api/investor/getFocuses?page=${that.data.page}&size=20`,
      header: {
        "access-token": that.data.accessToken
      }
    }).then(val => {
      if (val.data.code == 0) {
        that.setData({
          investmentList: val.data.data
        })
      } else {
        console.log(that)
        get401(val, that.getInvestmentList, that)
      }
    }).catch(err => {
      that.setData({
        message: '服务器请求出错了'
      })
      that.dialog.showDialog()
    })
  },

  /**
   * 关注接口请求
   */
  getFocus: function (data) {
    let that = this
    wxRequest({
      url: `${url}api/investor/focusOrCancelFocusInvestor?investorId=${data.id}&status=${data.status}`,
      header: {
        "access-token": that.data.accessToken
      }
    }).then(val => {
      wx.stopPullDownRefresh()
      if (val.data.code == 0) {
        if (data.status == 1) {
          that.setData({
            message: '关注成功'
          })
        } else {
          that.setData({
            message: '取消关注成功'
          })
        }
        that.getInvestmentList()
        that.dialog.showDialog()
      } else {
        get401(val, that.getFocus, that, data)
      }
    }).catch(err => {
      that.setData({
        message: '服务器请求出错了'
      })
      that.dialog.showDialog()
    })
  },

  /**
 * 提问
 */
  bindQuestions: function (e) {
    let value = e.currentTarget.dataset.value
    wx.navigateTo({
      url: `/pages/lookingInvestment/askQuestions/askQuestions?name=${value.name}.${value.city}&price=${value.questionUnitPrice}&id=${value.id}`,
    })
  },

  /**
   * 约见
   */
  bindAppointment: function (e) {
    let value = e.currentTarget.dataset.value
    app.appointment = value
    wx.navigateTo({
      url: '/pages/lookingInvestment/appoint/appoint',
    })
  },

  /**
   * 投资人详情
   */
  investmentDetail: function (e) {
    let value = e.currentTarget.dataset.value
    wx.navigateTo({
      url: `/pages/lookingInvestment/InvestmentDetail/InvestmentDetail?id=${value.id}&focus=${value.focus}`,
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getInvestmentList()
  },

})