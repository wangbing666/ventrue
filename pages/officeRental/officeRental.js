// pages/officeRental/officeRental.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
Page({
  /**
   * 页面的初始数据
   */
  data: {
    officeList: [],
    page: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOfficeRentalList()
  },

  /**
   * 加载数据
   */
  getOfficeRentalList: function () {
    let that = this
    wxRequest({
      url: `${url}/api/officeLeasing/getOfficeLeasings?page=0&size=20`
    }).then(val => {
      if (val.data.code == 0) {
        wx.stopPullDownRefresh()
        that.setData({
          totalPages: val.data.data.totalPages,
          officeList: val.data.data.content
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
        url: `${url}/api/officeLeasing/getOfficeLeasings?page=${that.data.page}&size=20`,
      }).then(val => {
        if (val.data.code == 0) {
          var officeListContent = that.data.officeList
          val.data.data.content.forEach(value => {
            officeListContent.push(value)
          })
          that.setData({
            officeList: officeListContent
          })
        }
      })
      that.setData({
        page: ++that.data.page
      })
    }
  },

  /**
   * 跳转到详情页
   */
  officeDetail: function (e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/officeRental/officeRentalDetail/officeRentalDetail?id=${id}`
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getOfficeRentalList()
  }
})