// pages/development/development-success/development-success.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 拨打电话
   */
  callUp: function () {
    var that = this
    wx.makePhoneCall({
      phoneNumber: '021-61984136',
      success: function () {
        console.log("成功拨打电话")
      }
    })
  },
  
  /**
   * 返回主页
   */
  getBack: function () {
    wx.navigateBack({
      delta: 3
    })
  }
})