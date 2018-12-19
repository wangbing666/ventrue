// buildinvoice.js
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
    type: 0,
    invoiceCard: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    wx.getStorage({
      key: 'accessToken',
      success: function(res) {
        that.setData({
          accessToken: res.data
        })
        if (options.id) {
          that.getCardDetail(options.id)
        }
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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  cancelSave: function() {
    wx.navigateBack({
      delta: 1
    })
  },
  saveInvoice: function() {
    const that = this
    wx.showLoading({
      title: '保存中'
    })

    let invoiceCard = that.data.invoiceCard
    invoiceCard.type = (that.data.type == 0 ? true : false)
    if(that.vaildInvoice(invoiceCard))  {
      that.requestInvoice(that.data.accessToken,invoiceCard)
      .then(val => {
        wx.hideLoading()
        if (val.data.code == 0) {
          wx.showToast({
            title: '保存成功',
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
            title: '保存失败',
            duration: 1000
          })
        }
      }).catch(err => {
        console.log(err)
      })
    }
  },
  vaildInvoice: function(obj) {
    if (obj.type == true && (typeof obj.companyName == 'undefined' || typeof obj.companyTaxNum == 'undefined')) {
      return false
    }else if (obj.type == false && typeof obj.name == 'undefined') {
      return false
    }
    return true
  },
  requestInvoice: function(accessToken,invoiceCard) {
    return wxRequest({
      url: `${url}/api/invoiceCard/add/update`,
      header: {
        "access-token": accessToken
      },
      method: 'POST',
      data: invoiceCard
    })
  },
  selectType: function(e) {
    let id = e.currentTarget.dataset.id
    this.setData({
      type: id
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
          invoiceCard: val.data.data,
          type: (val.data.data.type ? 0 : 1)
        })
      }
    })
  },
  // InvoiceCard {
  //   address(string, optional): 公司地址 ,
  //   bankAccount(string, optional): 银行账号 ,
  //   bankName(string, optional): 开户银行 ,
  //   companyName(string, optional): 公司名称 ,
  //   companyTaxNum(string, optional): 公司税号 ,
  //   contactName(string, optional): 联系人员 ,
  //   id(integer, optional),
  //   mailbox(string, optional): 邮箱 ,
  //   mailingAddress(string, optional): 邮寄地址 ,
  //   mobile(string, optional): 联系电话 ,
  //   name(string, optional): 姓名 ,
  //   tel(string, optional): 公司发票:公司电话／个人发票: 手机,
  //   type(boolean, optional): true 公司/false 个人
  // }
  inputAddress: function(e) {
    let invoiceCard = this.data.invoiceCard
    invoiceCard.address = e.detail.value
    this.setData({
      invoiceCard: invoiceCard
    })
  },
  inputBankAccount: function(e) {
    let invoiceCard = this.data.invoiceCard
    invoiceCard.bankAccount = e.detail.value.replace(/[\s]/g, '').replace(/(\d{4})(?=\d)/g, "$1 ");
    this.setData({
      invoiceCard: invoiceCard
    })
  },
  inputBankName: function(e) {
    let invoiceCard = this.data.invoiceCard
    invoiceCard.bankName = e.detail.value
    this.setData({
      invoiceCard: invoiceCard
    })
  },
  inputCompanyName: function(e) {
    let invoiceCard = this.data.invoiceCard
    invoiceCard.companyName = e.detail.value
    this.setData({
      invoiceCard: invoiceCard
    })
  },
  inputCompanyTaxNum: function(e) {
    let invoiceCard = this.data.invoiceCard
    invoiceCard.companyTaxNum = e.detail.value.replace(/[\s]/g, '').replace(/(\d{4})(?=\d)/g, "$1 ");
    this.setData({
      invoiceCard: invoiceCard
    })
  },
  inputContactName: function(e) {
    let invoiceCard = this.data.invoiceCard
    invoiceCard.contactName = e.detail.value
    this.setData({
      invoiceCard: invoiceCard
    })
  },
  inputMailbox: function(e) {
    let invoiceCard = this.data.invoiceCard
    invoiceCard.mailbox = e.detail.value
    this.setData({
      invoiceCard: invoiceCard
    })
  },
  inputMailingAddress: function(e) {
    let invoiceCard = this.data.invoiceCard
    invoiceCard.mailingAddress = e.detail.value
    this.setData({
      invoiceCard: invoiceCard
    })
  },
  /*mobile name tel type*/
  inputMobile: function(e) {
    let invoiceCard = this.data.invoiceCard
    invoiceCard.mobile = e.detail.value
    this.setData({
      invoiceCard: invoiceCard
    })
  },
  inputName: function(e) {
    let invoiceCard = this.data.invoiceCard
    invoiceCard.name = e.detail.value
    this.setData({
      invoiceCard: invoiceCard
    })
  },
  inputTel: function(e) {
    let invoiceCard = this.data.invoiceCard
    invoiceCard.tel = e.detail.value
    this.setData({
      invoiceCard: invoiceCard
    })
  }
 })