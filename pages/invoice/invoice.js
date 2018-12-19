// invoice.js
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
    page: 0,
    size: 20,
    invoiceData: {},
    invoiceList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    /*wx.getStorage({
      key: 'accessToken',
      success: function(res) {
        that.setData({
          accessToken: res.data
        })
        that.getInvoiceList(res.data)
      }
    })*/
  },
  goBuildinvoice: function () {
    wx.navigateTo({
      url: '/pages/buildinvoice/buildinvoice'
    })
  },

  goInvoicedetail: function (e) {
    wx.navigateTo({
      url: '/pages/invoicedetail/invoicedetail?id='+e.currentTarget.dataset.id
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
    const that = this
    wx.getStorage({
      key: 'accessToken',
      success: function(res) {
        that.setData({
          accessToken: res.data,
          page: 0,
          size: 20,
          invoiceData: {},
          invoiceList: []
        })
        that.getInvoiceList(res.data)
      }
    })
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
    if (that.data.invoiceData.last) {
      return
    }else {
      let page = that.data.page++
      that.getInvoiceList()
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  getInvoiceList: function(accessToken) {
    const that = this
    wxRequest({
      url: `${url}/api/invoiceCard/getInvoiceCards`,
      header: {
        'access-token': accessToken
      },
      data: {
        page: that.data.page,
        size: that.data.size
      }
    }).then(val => {
      if (val.data.code == 0) {
        var invoiceList = that.data.invoiceList
        invoiceList = invoiceList.concat(val.data.data.content)
        invoiceList.forEach( item => {
          item.companyTaxNum && (item.companyTaxNum = item.companyTaxNum.replace(/[\s]/g, '').replace(/(\d{4})(?=\d)/g, "$1 "));
        })
        that.setData({
          invoiceData: val.data.data,
          invoiceList: invoiceList
        })
      }
    })
  }
})