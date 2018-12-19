// pages/greatVideo/videList/videoList.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
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
  onLoad: function (options) {
    let id = options.id
    let videoTypeName = options.videoTypeName
    this.setData({
      id: id,
      videoTypeName: videoTypeName
    })
    this.setTitle()
    this.getVideoList(id)
  },

  /**
   * 加载数据
   */
  getVideoList: function (id) {
    let that = this
    wxRequest({
      url: `${url}/api/video/getVideosList?page=0&size=20&id=${id}`
    }).then(val => {
      if (val.data.code == 0) {
        wx.stopPullDownRefresh()
        that.setData({
          totalPages: val.data.data.totalPages,
          videoList: val.data.data.content
        })
        console.log(val.data.data.content)
      }
    })
  },

  /**
   * 设置界面标题
   */
  setTitle: function () {
    let that = this
    wx.setNavigationBarTitle({
      title: that.data.videoTypeName
    })
  },

  /**
  * 加载更多
  */
  loadMore: function () {
    let id = this.data.id
    const that = this
    if (that.data.page < that.data.totalPages) {
      wxRequest({
        url: `${url}/api/video/getVideosList?id=${id}page=${that.data.page}&size=20`,
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
   * 跳转到播放页面
   */
  playVideo: function (e) {
    let value = e.currentTarget.dataset.value
    wx.navigateTo({
      url: `/pages/greatVideo/playVideo/playVideo?title=${value.videoTitle}&content=${value.content}&src=${value.videoUrl}`
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let id = this.data.id
    this.getVideoList(id)
  }
})