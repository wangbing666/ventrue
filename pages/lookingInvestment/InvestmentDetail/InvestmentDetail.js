// pages/lookingInvestment/InvestmentDetail/InvestmentDetail.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var get401 = app.globalData.get401
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: '',
    page: 1,
    loadMore: false
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
   */
  onLoad: function (options) {
    let id = options.id
    if (options.focus == 'undefined') {
      this.setData({
        focus: false,
        id: id
      })
    } else {
      this.setData({
        focus: options.focus,
        id: id
      })
    }
    this.getToken(id)
  },

  /**
  * 获取token
  */
  getToken: function (id) {
    let that = this
    wx.getStorage({
      key: 'accessToken',
      success: function (res) {
        if (typeof res.data == 'undefined') {
          app.globalData.wxLogin(that.getinvestmentDetail)
        } else {
          that.setData({
            accessToken: res.data
          })
          that.getinvestmentDetail(id)
        }
      },
      fail: function (res) {
        app.globalData.wxLogin(that.getinvestmentDetail)
      }
    })
  },

  /**
   * 加载数据
   */
  getinvestmentDetail: function (id) {
    let that = this
    wxRequest({
      url: `${url}api/investor/details?investorId=${id}&page=0&size=20`,
      header: {
        "access-token": that.data.accessToken
      }
    }).then(val => {
      if (val.data.code == 0) {
        console.log(val.data.data)
        that.setData({
          detail: val.data.data.investor,
          questions: val.data.data.questions.content,
          totalPages: val.data.data.questions.totalPages
        })
      } else {
        get401(val, that.getinvestmentDetail, that, id)
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
        url: `${url}api/investor/details?investorId=${that.data.id}&page=${that.data.page}&size=20`,
        header: {
          "access-token": that.data.accessToken
        }
      }).then(val => {
        if (val.data.code == 0) {
          var questionsContent = that.data.questions
          val.data.data.questions.content.forEach(value => {
            questionsContent.push(value)
          })
          that.setData({
            questions: questionsContent
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
        that.dialog.showDialog()
      } else {
        get401(val, that.getFocus, data, that)
      }
    }).catch(err => {
      that.setData({
        message: '服务器请求出错了'
      })
      that.dialog.showDialog()
    })
  },

  /**
   * 关注
   */
  bindFocus: function () {
    let status = this.data.focus
    this.setData({
      focus: !status
    })
    let data = {
      id: this.data.id
    }
    if (status) {
      data.status = 2
      this.getFocus(data)
    } else {
      data.status = 1
      this.getFocus(data)
    }
  },
  /**
   * 一元旁听
   */
  bindAudit: function (e) {
    let value = e.currentTarget.dataset.value
    app.globalInvestment = value
    wx.navigateTo({
      url: '/pages/lookingInvestment/audit/audit',
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
   * 返回
   */
  bindHistory: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  onReachBottom: function () {
    console.log(2)
  }
})