//logs.js
var util = require('../../utils/util.js')
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var mpToken = app.globalData.mpToken
var get401 = app.globalData.get401
var getStorage = app.globalData.getStorage
Page({
  data: {
    imgUrls: [
      'http://www.luyanquna.com/wp-admin/images/tupian1.png',
      'http://www.luyanquna.com/wp-admin/images/tupian2.png',
      'http://www.luyanquna.com/wp-admin/images/tupian3.png'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 500,
    citys:['不限','北京','上海','广州','深圳','杭州','成都','重庆','西安','厦门','南京','武汉','天津','长沙','青岛','苏州','郑州','其他'],
    industries: ['不限','金融','体育','旅游','教育','游戏','物流','电商','硬件','社交','新媒体','房地产','智能家居','物联网','大数据','新农业','企业服务','人工智能','消费升级','广告营销','医疗健康','文化娱乐','汽车交通','工具软件','本地生活','知识付费','新零售','区块链','共享经济','AR/VR','社会公益','其他'],
    selectCity: 0,
    selectIndustry: 0,
    page: 0,
    size:20,
    city: '城市',
    industry:'行业',
    content:''
  },
  onHide: function() {
    this.setData({
      page: 0
    })
  },
  onShow: function () {
    const that = this
    that.getBanners()
    wx.getStorage({
      key:'card',
      success: function(res) {
        if (res.data && res.data.length > 0) {
          that.setData({
            card: res.data,
            hasMyCard: true
          })
        }else{
          that.setData({
            hasMyCard: false
          })
        }
      },
      fail: function() {
        that.setData({
          hasMyCard: false
        })
      }
    })
    wx.getStorage({
      key:'accessToken',
      success: function(val) {
        that.setData({
          accessToken: val.data
        })
        that.getCard(val.data)
        that.getBallBackCard(val.data)
      }
    })
  },
  getBanners: function() {
    const that = this
    wxRequest({
      url: `${url}/api/banner/getBanners`
    }).then(val => {
      if (val.data.code == 0) {
        that.setData({
          banners: val.data.data
        })
      }
    })
  },
  onPullDownRefresh: function(){
    wx.stopPullDownRefresh()
    this.setData({
      city: '城市',
      industry: '行业',
      page: 0
    })
    this.getCard(this.data.accessToken)
  },
  showImg: function(e) {
    let url = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/banner/banner?id='+url,
    })
  },
  onReachBottom: function() {
    const that = this
    if(!that.data.cardList.last) {
      that.setData({
        page: ++that.data.page
      })
      wxRequest({
        url: `${url}/api/businessCard/showCards?page=${that.data.page}&size=${that.data.size}`,
        header: {
          "access-token": that.data.accessToken
        }
      }).then(val => {
        if (val.data.code == 0) {
          var cardListContent = that.data.cardListContent
          val.data.data.content.forEach(value=>{
            cardListContent.push(value)
          })
          that.setData({
            cardList: val.data.data,
            cardListContent: cardListContent
          })
        }
      })
    }
  },
  determineOper: function() {
    if (this.data.hasMyCard) {
      return
    }else {
      wx.showModal({
        title:'',
        content: '您还没有创建名片哦,是否立刻创建',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url:'/pages/editCard/editCard'
            })
          };
        }
      })
    }
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
  goContact: function() {
    wx.switchTab({
      url: '/pages/contacts/contacts'
    })
  }, 
  getCard: function(accessToken) {
    const that = this
    wxRequest({
      url: `${url}/api/businessCard/showCards?page=${that.data.page}&size=${that.data.size}`,
      header: {
        "access-token": accessToken
      }
    }).then(val => {
      if (val.data.code == 0) {
        that.setData({
          cardList: val.data.data,
          cardListContent: val.data.data.content
        })
      }
    })
  },
  getCardDetail: function(e) {
    let id = e.currentTarget.dataset.id
    const that = this
    if (!that.data.hasMyCard || that.data.card.length == 0) {
      that.determineOper()
      return
    };
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
  selectSth: function(url) {
    const that = this
    wxRequest({
      url: url,
      header:{
        "access-token": that.data.accessToken
      },
      method: 'POST'
    }).then(val => {
      if (val.data.code==0) {
        that.setData({
          cardListContent: val.data.data
        })
      }
    })
  },
  addContact: function(e) {
    const that = this
    let id = e.currentTarget.dataset.id
    let canadd = e.currentTarget.dataset.canadd
    if (canadd || !that.data.hasMyCard) {
      that.determineOper()
      return
    }
    let accessToken = that.data.accessToken
    that.addContactUrl(accessToken,id).then(val=> {
      if (val.data.code == 0 ) {
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        })
        that.dealCards(id)
      }
    })
  },
  dealCards: function(id) {
    let cardListContent = this.data.cardListContent
    for (var i = 0; i < cardListContent.length; i++) {
      let card = cardListContent[i]
      if (card.id == id) {
        cardListContent[i].enshrine = true
        break;
      }
    }
    this.setData({
      cardListContent: cardListContent
    })
  },
  addContactUrl: function(accessToken,id) {
    return wxRequest({
      url: `${url}/api/mailList/saveContact?coverCardId=${id}&collectOrCancel=1`,
      header: {
        "access-token": accessToken
      },
      method: 'POST',
    })
  },
  showSearch: function(){
  	this.closeModal()
  	this.setData({
  		showSearch: true,
      content: ''
  	})
  },
  closeSearch: function(){
  	this.setData({
  		showSearch: false
  	})
  },
  showCity: function() {
    if (this.data.showCity) {
      this.closeModal()
      return
    }
  	this.setData({
  		showCity:true,
  		showModal:true,
  		showIndustry: false
  	})
  },
  showIndustry: function(){
    if (this.data.showIndustry) {
      this.closeModal()
      return
    }
  	this.setData({
  		showCity:false,
  		showIndustry:true,
  		showModal:true
  	})
  },
  selectIndustry: function(e) {
    const that = this
  	let industry = e.currentTarget.dataset.industry
  	let selectIndustry = e.currentTarget.dataset.id
  	that.setData({
  		selectIndustry: selectIndustry,
  		industry: industry
  	})
    var selectedCity = that.data.city
    var selectedIndustry = that.data.industry
    if (selectedIndustry == '不限' || selectedIndustry == '行业') {
      selectedIndustry = ''
    }
    if (selectedCity == '不限' || selectedCity == '城市' || selectedCity == '默认') {
      selectedCity = ''
    }
    let urls = `${url}/api/mailList/contactListScreen?city=${selectedCity}&investmentField=${selectedIndustry}`
    that.selectSth(urls)
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
      url:`${url}/api/businessCard/searchConnections?content=${that.data.content}`,
      header: {
        'access-token': that.data.accessToken
      },
      method: 'POST'
    }).then(val => {
      if (val.data.code == 0) {
        that.setData({
          cardListContent: val.data.data,
          showSearch: false
        })
        wx.hideLoading()
      }
    })
  },
  selectCity: function(e) {
    const that = this
  	let city = e.currentTarget.dataset.city
  	let selectCity = e.currentTarget.dataset.id
  	that.setData({
  		selectCity: selectCity,
  		city: city
  	})
    var selectedCity = that.data.city
    var selectedIndustry = that.data.industry
    if (selectedIndustry == '不限' || selectedIndustry == '行业') {
      selectedIndustry = ''
    }
    if (selectedCity == '不限' || selectedCity == '城市' || selectedCity == '默认') {
      selectedCity = ''
    }
    let urls = `${url}/api/mailList/contactListScreen?city=${selectedCity}&investmentField=${selectedIndustry}`
    that.selectSth(urls)
  },
  closeCity: function() {
  	this.closeModal()
  },
  closeIndustry: function() {
  	this.closeModal()
  },
  closeModal: function(){
  	this.setData({
  		showCity:false,
  		showIndustry:false,
  		showModal:false,
      showTips: false
  	})
  },

   /**
   * 加入会员
   */
  bindMembership: function () {
    this.closeModal()
    wx.navigateTo({
      url: '/pages/my/joinVIP/joinVIP',
    })
  }
})
