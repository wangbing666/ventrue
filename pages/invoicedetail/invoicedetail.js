// invoicedetail.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var mpToken = app.globalData.mpToken
var get401 = app.globalData.get401
var getStorage = app.globalData.getStorage
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
    const that = this
    if (options.id) {
      that.setData({
        id: options.id
      })
      that.getCardDetail(options.id)
    }
    if(typeof options.type !='undefined') {
      that.setData({
        others: true
      })
    }
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
    const that = this
    if (that.data.id) {
      that.getCardDetail(that.data.id)
    }
  },
  showImg: function(e) {
    let url = e.currentTarget.dataset.id
    wx.previewImage({
      urls: [url],
    })
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
  
  },
  editInvoice: function() {
    const that = this
    wx.navigateTo({
      url: '/pages/buildinvoice/buildinvoice?id='+that.data.id
    })
  },
  deleteInvoice: function() {
    const that = this
    wx.showLoading({
      title: '正在删除...'
    })
    wxRequest({
      url: `${url}/api/invoiceCard/delete?id=${that.data.id}`,
      method: 'DELETE'
    }).then( val => {
      wx.hideLoading()
      if (val.data.code == 0) {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration:1000
        })
        setTimeout(function(){
          wx.navigateBack({
            delta: 1
          })
        },1000)
      }else {
        wx.showToast({
          title: '删除失败',
          duration: 1000
        })
      }
    })
  },
  getCardDetail: function(id) {
    const that = this
    wxRequest({
      url: `${url}/api/invoiceCard/getInvoiceCard`,
      data: {
        id: id
      }
    }).then(val => {
      if (val.data.code == 0) {
        that.setData({
          invoiceDetail: val.data.data
        })
      }
    })
  }
})