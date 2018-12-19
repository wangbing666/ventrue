// pages/lookingInvestment/classification/classification.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var get401 = app.globalData.get401
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let field = options.field
    this.setData({
      field: field
    })
    this.getToken(field)
    wx.setNavigationBarTitle({
      title: field + '类投资人'
    })
  },

  /**
 * 获取token
 */
  getToken: function (field) {
    let that = this
    wx.getStorage({
      key: 'accessToken',
      success: function (res) {
        if (typeof res.data == 'undefined') {
          app.globalData.wxLogin(that.getClassificationList, that)
        } else {
          that.setData({
            accessToken: res.data
          })
          that.getClassificationList(field)
        }
      },
      fail: function (res) {
        app.globalData.wxLogin(that.getClassificationList, that)
      }
    })
  },

  /**
* 加载数据
*/
  getClassificationList: function (field) {
    let that = this
    wxRequest({
      url: `${url}/api/investor/searchInvestors?page=0&size=20&investmentField=${field}`,
      header: {
        "access-token": that.data.accessToken
      }
    }).then(val => {
      if (val.data.code == 0) {
        console.log(val.data.data)
        that.setData({
          investmentList: val.data.data.content
        })
      } else {
        get401(val, that.getClassificationList, that, field)
      }
    }).catch(err => {
      console.log(err)
    })
  },

  /**
   * 加载更多
   */
  loadMore: function () {
    const that = this
    if (that.data.page < that.data.totalPages) {
      wxRequest({
        url: `${url}/api/investor/getInvestors?page=${that.data.page}&size=20`,
        header: {
          "access-token": that.data.accessToken
        }
      }).then(val => {
        if (val.data.code == 0) {
          var investmentContent = that.data.investmentList
          val.data.data.content.forEach(value => {
            investmentContent.push(value)
          })
          that.setData({
            investmentList: investmentContent
          })
        } else {
          get401(val, that.loadMore, that)
        }
      })
      that.setData({
        page: ++that.data.page
      })
    }
  },

  // 返回
  bindHistory: function () {
    wx.navigateBack({
      delta: 1
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
  * 提问
  */
  bindQuestions: function (e) {
    let value = e.currentTarget.dataset.value
    wx.navigateTo({
      url: `/pages/lookingInvestment/askQuestions/askQuestions?name=${value.name}.${value.city}&price=${value.questionUnitPrice}&id=${value.id}`,
    })
  },
})