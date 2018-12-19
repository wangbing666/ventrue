// pages/lookingInvestment/askQuestions/haveAsked/haveAsked.js
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
    ventrue: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getToken()
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
        if (typeof res.data == 'undefined') {
          console.log(res)
        } else {
          that.setData({
            accessToken: res.data
          })
          that.getHaveAsked()
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },

  /**
* 获取已问内容
*/
  getHaveAsked: function () {
    var that = this
    wxRequest({
      url: `${url}api/userInformation/myQuestions?page=${that.data.page}&size=20&type=0`,
      header: {
        "access-token": that.data.accessToken
      },
    }).then(val => {
      if (val.data.code == 0) {
        console.log(val.data.data)
        that.setData({
          questionList: val.data.data.content
        })
      } else {
        get401(val, that.getHaveAsked, that)
      }
    }).catch(err => {
      console.log(err)
    })
  },

  /**
   * 关注事件
   */
  bindFocus: function (e) {
    let data = {}
    data.id = e.currentTarget.dataset.id
    data.status = e.currentTarget.dataset.status
    console.log(data)
    if (data.status == '1') {
      this.getFocus(data)
    } else {
      this.getFocus(data)
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
        // that.dialog.showDialog()
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

  // 关闭顶部消息
  bindClose: function () {
    this.setData({
      ventrue: false
    })
  },

  bindAudit: function (e) {
    let value = e.currentTarget.dataset.value
    app.globalInvestment = value
    wx.navigateTo({
      url: '/pages/lookingInvestment/audit/audit',
    })
  },
})