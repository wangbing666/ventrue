// pages/composeBP/composeBP.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
Page({
  data: {
    imglist: [],
    cost: ['3K以内','3K至1W','1W以上'],
    bpTemplateName: '',
    budget: ''
  },

  /**
   * 页面的初始数据
   */
  onReady: function () {
    //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
    this.getBPtemplate()
  },

  /**
 * 选择模板
 */
  getBPtemplate:function () {
    let that = this
    wxRequest({
      url: `${url}/api/bpTemplate/getBpTemplates`,
    }).then(val => {
      that.setData({
        imglist: val.data.data
      })
    }).catch(err =>{
      console.log(err)
    })
  },

  /**
 * 选择模板
 */
  template: function (e) {
    let index = e.currentTarget.id
    let id = e.currentTarget.dataset.id
    this.setData({
      templateId: index,
      bpTemplateName: this.data.imglist[index]
    })
    wx.navigateTo({
      url: '/pages/composeBP/BPtemplate/BPtemplate?id=' + id,
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
    if (this.data.bpTemplateName && this.data.budget) {
      wx.navigateTo({
        url: `/pages/common/confirm/confirm?bpTemplateName=${this.data.bpTemplateName}&budget=${this.data.budget}`
      })
    } else {
      this.setData({
        message: '请将信息选择完整'
      })
      this.dialog.showDialog()
    }
  }
})