// pages/my/questionHome/meet/meetDetail/meetDetail.js
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
      questionDetail: app.globalquestionDetail
    })
    this.getToken()
    console.log(app.globalquestionDetail)
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
          // app.globalData.wxLogin(that.getAuditList, that)
        } else {
          that.setData({
            accessToken: res.data
          })
        }
      },
      fail: function (res) {
        // app.globalData.wxLogin(that.getAuditList, that)
      }
    })
  },

  /**
   * 提交
   */
  formSubmit: function (e) {
    var that = this
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    let data = {
        length: 0,
        message: e.detail.value.message,
        messageType: 0,
        type: 1,
        address: e.detail.value.address
    }
    if (data.message != '' && data.address != '') {
      this.setData({
        loading: true
      })
      wxRequest({
        url: `${url}api/question/reply?questionId=${that.data.questionDetail.id}`,
        header: {
          "access-token": that.data.accessToken
        },
        data: data,
        method: 'POST'
      }).then(val => {
        if (val.data.code == 0) {
          that.setData({
            redPacket: true,
            loading: false
          })
        } else {
          get401(val, that.questionReply, that, data)
        }
      }).catch(err => {
        console.log(err)
      })
    } else {
      that.setData({
        message: '请将信息填写完全'
      })
      that.dialog.showDialog()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
  },

  /**
   * 打开红包
   * 防止用户无线刷单
   */
  bindOpen: function () {
    let that = this
    that.setData({
      redPacket: false
    })
    wx.navigateTo({
      url: `/pages/my/questionHome/meet/meetDetail/redPacket/redPacket`,
    })
  },

  /**
   * 关闭红包
   */
  bindclose: function () {
    this.setData({
      redPacket: false
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})