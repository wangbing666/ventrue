// pages/my/questionHome/meet/meet.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var get401 = app.globalData.get401
Page({

  /**
   * 页面的初始数据
   */
  data: {
    arrow: '<',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      questionDetail: app.globalquestionDetail,
      imageUrls: app.globalquestionDetail.imageUrls,
      BPlist: app.globalquestionDetail.files
    })
  },

  /**
   * 同意约见
   */
  bindAgreed: function () {
    wx.navigateTo({
      url: '/pages/my/questionHome/meet/meetDetail/meetDetail'
    })
  },

  // 查看图集
  examineImg: function () {
    var that = this
    var imgList = that.data.imageUrls
    wx.previewImage({
      current: '',
      urls: imgList
    })
  },

  // 查看BP
  examineBP: function () {
    var bp = this.data.BPlist
    wx.downloadFile({
      url: bp[0], //仅为示例，并非真实的资源
      success: function (res) {
        var file = res.tempFilePath
        wx.openDocument({
          filePath: file,
          success: function (res) {
            console.log('打开文档成功')
          },
          fail: err => {
            console.log(err)
          }
        })
      }
    })
  }
})