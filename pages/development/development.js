// pages/development/development.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    requirement:['官网类','电商类','门店类','工具类','平台类','定制类'],
    cost: ['1万以内','1-3万','3-5万','5-10万','10-30万','30万以上'],
    requirementType:'',
    budget:''
  },

  /**
   * 页面的初始数据
   */
  onReady: function () {
    //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
  },

  /**
   * 选择需求类型
   */
  requirement: function (e) {
    let id = e.currentTarget.dataset.id
    this.setData({
      rmId: id,
      requirementType: this.data.requirement[id]
    })
  },

  /**
   * 选择费用预算
   */
  cost: function (e) {
    let id = e.currentTarget.dataset.id
    this.setData({
      costId: id,
      budget: this.data.cost[id]
    })
  },

  /**
  * 微信咨询
  */
  wechatConsulting: function (e) {
    this.setData({
      mmWechat: true
    })
  },
  
  /**
   * 客服咨询
   */
  makePhoneCall: function () {
    var that = this
    wx.makePhoneCall({
      phoneNumber: '021-61984136',
      success: function () {
        console.log("成功拨打电话")
      }
    })
  },

  /**
  * 关闭模态框
  */
  close: function () {
    this.setData({
      mmWechat: false
    })
  },

  /**
   * 下一步
   */
  next: function () {
    if (this.data.requirementType && this.data.budget) {
      wx.navigateTo({
        url: `/pages/common/confirm/confirm?requirementType=${this.data.requirementType}&budget=${this.data.budget}`
      })
    } else {
      this.setData({
        message: '请将信息选择完整'
      })
      this.dialog.showDialog()
    }
  }
})