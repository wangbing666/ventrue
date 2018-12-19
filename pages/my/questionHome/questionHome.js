// pages/my/questionHome/questionHome.js
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
  onShow: function (options) {
    this.getToken()
  },

  /**
  * 获取token
  * 加载页面
  */
  getToken: function () {
    let that = this
    wx.getStorage({
      key: 'accessToken',
      success: function (res) {
        if (typeof res.data == 'undefined') {
          console.log(res)
        } else {
          that.setData({
            accessToken: res.data
          })
          that.getQuestionHome()
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },

  /**
  * 获取主页内容
  */
  getQuestionHome: function () {
    let that = this
    wxRequest({
      url: `${url}api/question/home?page=0&size=20`,
      header: {
        "access-token": this.data.accessToken
      }
    }).then(val => {
      if (val.data.code == 0) {
        console.log(val.data.data)
        that.setData({
          totalPages: val.data.data.questions.totalPages,
          question: val.data.data.investor,
          questionList: val.data.data.questions.content
        })
      } else {
        get401(val, that.getQuestionHome, that)
      }
    }).catch(err => {
       console.log(err)
    })
  },

   /**
  * 回答问题或者约见
  */
  questionDetail: function (e) {
    let value = e.currentTarget.dataset.value
    app.globalquestionDetail = value
    if (value.type == 0) {
      wx.navigateTo({
      url: '/pages/my/questionHome/questionDetail/questionDetail'
    })
    } else if (value.type == 1) {
      wx.navigateTo({
        url: '/pages/my/questionHome/meet/meet'
      })
    }
  },

  /**
  * 分享朋友
  */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
  },

 /**
  * 修改主页
  */
  goEditHome: function () {
    app.questionHome = this.data.question.investor
    wx.navigateTo({
      url: '/pages/my/applyMaster/applyMaster'
    })
  },

  /**
 * 页面到底加载更多
 */
  onReachBottom: function () {
    const that = this
    if (that.data.page < that.data.totalPages) {
      wxRequest({
        url: `${url}/api/question/home?page=${that.data.page}&size=20`,
        header: {
          "access-token": that.data.accessToken
        }
      }).then(val => {
        if (val.data.code == 0) {
          var questionListContent = that.data.questionList
          val.data.data.questions.content.forEach(value => {
            questionListContent.push(value)
          })
          that.setData({
            questionList: questionListContent
          })
          console.log(that.data.questionList)
        } else {
          get401(val, that.onReachBottom, that)
        }
      })
      that.setData({
        page: ++that.data.page
      })
    }
  },
})