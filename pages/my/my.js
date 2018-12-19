//logs.js
var util = require('../../utils/util.js')
var app = getApp()
var wxRequest = util.wxRequest
var url = app.globalData.url
Page({
  data: {
    showGuanzhu:false,
    logs: [],
    card:[],
    attentionUrl: 'http://www.luyanquna.com/wp-admin/images/qun.jpg',
    classification: [
      { url: '/pages/my/applyMaster/applyMaster', label: '申请答主', imgUrl:'/image/my/shenqing.png', hidden: false},
      { url: '/pages/my/questionHome/questionHome', label: '问答主页', imgUrl: '/image/my/home.png', hidden: false },
      { url: '/pages/my/joinVIP/joinVIP', label: '加入会员', imgUrl: '/image/my/VIP.png', hidden: false },
      { url: '/pages/my/balance/balance', label: '余额', imgUrl: '/image/my/chongzhi.png', hidden: false},
      { url: '/pages/my/haveAsked/haveAsked', label: '已问', imgUrl: '/image/my/ting.png', hidden: false },
      { url: '/pages/my/haveMeet/haveMeet', label: '已约见', imgUrl: '/image/my/dati.png', hidden: false },
      { url: '/pages/my/beenFocused/beenFocused', label: '已关注', imgUrl: '/image/my/zuanshi.png', hidden: false}
    ]
  },
  onShow: function () {
    const that = this
    wx.getStorage({
      key:'accessToken',
      success: function(res) {
        that.getBallBackCard(res.data)
        wxRequest({
          url: `${url}/api/businessCard/getBusinessCard`,
          header: {
            "access-token": res.data
          },
        }).then(function(res){
            if (res.data.code==0) {
              var up = "classification[" + 0 + "].hidden"
              var home = "classification[" + 1 + "].hidden"
              that.setData({
                card: res.data.data,
                [up]: res.data.data[0].user.investorStatus,
                [home]: !res.data.data[0].user.investorStatus
              })
              wx.setStorage({
                key: 'card',
                data: res.data.data
              })
            }else if(res.data.code == 401) {

            }
        })
      }
    })
  },
  onPullDownRefresh: function() {
    wx.getStorage({
      key:'accessToken',
      success: function(res) {
        wxRequest({
          url: `${url}/api/businessCard/getBusinessCard`,
          header: {
            "access-token": res.data
          },
        }).then(function(res){
            if (res.data.code==0) {
              that.setData({
                card: res.data.data
              })
            }else if(res.data.code == 401) {

            }
        })
      }
    })
    wx.stopPullDownRefresh()
  },
  getBallBackCard: function(accessToken) {
    const  that = this
    wxRequest({
      url: `${url}/api/ballBackCard/getBallBackCards`,
      header: {
        "access-token": accessToken
      }
    }).then(val => {
        that.setData({
          backCard: val.data.data
        })
    })
  },
  goFile: function() {
    wx.navigateTo({
      url: '/pages/upload/upload',
    })
  },
  goContact: function() {
    wx.switchTab({
      url: '/pages/contacts/contacts'
    })
  }, 
  showGroup: function() {
    wx.navigateTo({
      url: '/pages/ctgroup/ctgroup'
    })
  },
  showGuanzhu: function() {
    const that = this
    that.setData({
      showGuanzhu: true
    })
  },
  showDevelopment: function () {
    console.log(2)
    wx.navigateTo({
      url: '/pages/development/development'
    })
  },
  hideGuanzhu: function () {
    const that = this
    that.setData({
      showGuanzhu: false
    })
  },
  createShareImg: function() {
    if (this.data.card && this.data.card.length>0) {
          let res = `${url}/api/businessCard/share/image`
          this.createImg(res)
    }else {
      wx.showModal({
        title: '',
        content: '您需要先创建名片哦'
      })
    }

  },
  createMiniImg: function() {
    let res = `${url}/api/businessCard/share/weiXinCode`
    this.createImg(res)
  },
  createImg: function(url) {
    const that = this
    wxRequest({
      url: url,
      data:{
        "cardId": that.data.card[0].id,
        "sharePage": "/pages/cardDetail/cardDetail?id="+that.data.card[0].id
      }
    }).then(val => {
      if (val.data.code == 0) {
        var urls = []
        urls.push(val.data.data.url)
        wx.previewImage({
          current: '',
          urls: urls
        })
      }
    })
  },
  goInvoice: function () {
    wx.navigateTo({
      url: '/pages/invoice/invoice',
    })
  },
  goEdit: function() {
    wx.navigateTo({
      url: '/pages/editCard/editCard'
    })
  },
  goHistory: function() {
    wx.navigateTo({
      url:'/pages/history/history'
    })
  },
  goContact: function() {
    wx.switchTab({
      url: '/pages/contacts/contacts'
    })
  },
  goOther: function (e) {
    let url = e.currentTarget.dataset.url
    app.card = this.data.card
    wx.navigateTo({
      url: url
    })
  }
})
