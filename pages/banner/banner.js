// banner.js
var WxParse = require('../wxParse/wxParse.js');
var app = getApp();
var mpToken = app.globalData.mpToken
var wxRequest = app.globalData.wxRequest
var myUrl = app.globalData.url
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
    let id = options.id
    const that = this
    wxRequest({
      url: `${myUrl}/api/banner/getBanner?bannerId=${id}`
    }).then(val => {
      if(val.data.code == 0 ) {
        if(val.data.data.content) WxParse.wxParse('article', 'html', val.data.data.content, that);
        that.setData({
          detail: val.data.data
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