// pages/bgc/bgc.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bgs: ['http://www.luyanquna.com/wp-admin/images/tu1.png',
    'http://www.luyanquna.com/wp-admin/images/tu2.png',
    'http://www.luyanquna.com/wp-admin/images/tu3.png',
    'http://www.luyanquna.com/wp-admin/images/tu4.png',
    'http://www.luyanquna.com/wp-admin/images/tu5.png',
    'http://www.luyanquna.com/wp-admin/images/tu6.png',
    'http://www.luyanquna.com/wp-admin/images/tu7.png',
    'http://www.luyanquna.com/wp-admin/images/tu8.png',
    'http://www.luyanquna.com/wp-admin/images/tu9.png',
    'http://www.luyanquna.com/wp-admin/images/tu10.png']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  default: function() {
    wx.removeStorage({
      key: 'bg',
      success: function(res) {
        wx.navigateBack({
          delta: 1
        })
      },
    })
  },
  selectBg: function(e) {
    let id = e.currentTarget.dataset.id
    wx.setStorage({
      key: 'bg',
      data: id,
      success: function() {
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
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