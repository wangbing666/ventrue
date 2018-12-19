//logs.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var mpToken = app.globalData.mpToken
var get401 = app.globalData.get401
var getStorage = app.globalData.getStorage
Page({
  data: {
    selectType:'按姓名',
    selectedId: 0,
    showSelect: false,
    content: ''
  },
  onShow: function () {
    const that = this
    this.setData({
      selectedId: 0
    })
    wx.getStorage({
      key:'card',
      success: function(res) {
        that.setData({
          card: res.data
        })
      }
    })
    wx.getStorage({
      key: 'accessToken',
      success: function(res) {
        that.setData({
          accessToken: res.data
        })
        that.getContactByFirstLetter(res.data)
        that.getBallBackCard(res.data)
      }
    })
  },
  onPullDownRefresh: function(){
    this.getContactByFirstLetter(this.data.accessToken)
    this.getBallBackCard(this.data.accessToken)
    wx.stopPullDownRefresh()
  },
  makeCall: function(e) {
    let tel = e.currentTarget.dataset.id
    let looked = e.currentTarget.dataset.looked
    if (typeof looked != 'undefined') {
      wx.makePhoneCall({
        phoneNumber: tel
      })
    }else {
      this.setData({
        showTips: true,
        showModal: true
      })
    }
  },
  inputContent: function(e) {
    this.setData({
      content: e.detail.value
    })
  },
  confirmSearch: function() {
    this.searchContent()
  },
  searchContent: function() {
    const that = this
    wx.showLoading({
      title:'正在搜索...'
    })
    wxRequest({
      url:`${url}/api/mailList/searchContact?content=${that.data.content}`,
      header: {
        'access-token': that.data.accessToken
      },
      method: 'POST'
    }).then(val => {
      wx.hideLoading()
      if (val.data.code == 0) {
        that.setData({
          cardList: val.data.data,
          showSearch: false
        })
      }
    }).catch(err => {
      wx.hideLoading()
    })
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
  getCard: function(e) {
    let id = e.currentTarget.dataset.id
    const that = this
    wxRequest({
      url: `${url}/api/detailCard/lookBusinessCard`,
      header: {
        "access-token": that.data.accessToken
      },
      data: {
        "coverCardId": id,
        "visitorCardId": that.data.card[0].id,
        "whetherReturn": 1
      }
    }).then(val => {
      console.log(val.data)
      if (val.data.code == 0) {
        wx.setStorage({
          key: 'otherCard',
          data: val.data.data,
        })
        wx.navigateTo({
          url: `/pages/cardDetail/cardDetail?id=${id}`
        })
      }else {
        that.setData({
          showTips: true,
          showModal: true
        })
      }
    })
  },
  goDetail: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/cardDetail/cardDetail?id=${id}&whetherReturn=0`
    })    
  },
  getContactlList: function(){//获取通讯录信息
    const that = this
    wxRequest({
      url:`${url}api/mailList/getContactList`,
      data: {},
      header: {
        "access-token": that.data.accessToken
      }
    }).then(function(val){

    })
  },
  getContactByFirstLetter: function(){//获取通讯录信息根据首字母
    const that = this
    wxRequest({
      url:`${url}api/mailList/getContactListSortLetter`,
      data: {},
      header: {
        "access-token": that.data.accessToken
      }
    }).then(function(val){
      if (val.data.code == 0) {
        that.setData({
          cardList: val.data.data
        })
      }
    })
  },
  getContactByDate: function(){//获取通讯录信息根据首字母
    const that = this
    wxRequest({
      url:`${url}api/mailList/getContactListSortTime`,
      data: {},
      header: {
        "access-token": that.data.accessToken
      }
    }).then(function(val){
      if (val.data.code == 0) {
        let cardList = val.data.data
        for (var i = 0; i < cardList.length; i++) {
          cardList[i].formatTime = new Date(cardList[i].time).format('yyyy-MM-dd')
        }
        that.setData({
          cardList: cardList
        })
      }
    })
  },
  selectType: function(e) {
    let id = e.currentTarget.dataset.id
    console.log(id)
    if (id == 0) {
      this.setData({
        selectedId: 1,
        selectType: '按时间'
      })
      this.getContactByDate()
    } else if (id == 1) {
      this.setData({
        selectedId: 0,
        selectType: '按姓名'
      })
      this.getContactByFirstLetter()
    }
  },
  showSelect: function() {
    let showSelect = this.data.showSelect
    this.setData({
      showSelect: !showSelect
    })
  },
  showSearch: function(){
    this.closeModal()
    this.setData({
      showSearch: true,
      content: ''
    })
  },
  contacts: function () {
    wx.switchTab({
      url: '/pages/network/network'
    })
  },
  cancelSearch: function(){
    this.setData({
      showSearch: false
    })
  },
  closeModal: function(){
    this.setData({
      showSelect:false,
      showModal:false,
      showTips: false,
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
  * 关闭模态框
  */
  close: function () {
    this.setData({
      mmWechat: false
    })
  }
})
