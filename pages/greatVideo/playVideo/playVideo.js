// pages/greatVideo/playVideo/playVideo.js
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
    console.log(options)
    let src = options.src,
        title = options.title,
        content = options.content
    this.setData({
      src: src,
      title: title,
      content: content
    })
    this.setTitle()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (res) {
    this.videoContext = wx.createVideoContext('myVideo')
  },

  /**
   * 视频错误信息
   */
  videoErrorCallback: function (e) {
    console.log('视频错误信息:')
    console.log(e.detail.errMsg)
  },

  /**
  * 设置界面标题
  */
  setTitle: function () {
    let that = this
    wx.setNavigationBarTitle({
      title: that.data.title
    })
  },
})