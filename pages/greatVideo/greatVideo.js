// pages/greatVideo/greatVideo.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoList: [],
    page: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getVideoList()
  },

  /**
   * 加载数据
   */
  getVideoList: function () {
    let that = this
    wxRequest({
      url: `${url}/api/video/getVideoTypes?page=0&size=20`
    }).then(val => {
      if (val.data.code == 0) {
        wx.stopPullDownRefresh()
        val.data.data.content.forEach(function(obj){
          obj.time = util.getLocalTime(obj.time)
        })
        that.setData({
          totalPages: val.data.data.totalPages,
          videoList: val.data.data.content
        })
      }
    })
  },

  /**
   * 加载更多
   */
  loadMore: function () {
    const that = this
    if (that.data.page < that.data.totalPages) {
      wxRequest({
        url: `${url}/api/video/getVideoTypes?page=${that.data.page}&size=20`,
      }).then(val => {
        if (val.data.code == 0) {
          var videoListContent = that.data.videoList
          val.data.data.content.forEach(value => {
            videoListContent.push(value)
          })
          that.setData({
            videoList: videoListContent
          })
        }
      })
      that.setData({
        page: ++that.data.page
      })
    }
  },
  /**
   * 跳转到视频
   */
  videoDetail: function (e) {
    let value = e.currentTarget.dataset.value
    wx.navigateTo({
      url: `/pages/greatVideo/videoList/videoList?id=${value.id}&videoTypeName=${value.videoTypeName}`
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getVideoList()
  }
})