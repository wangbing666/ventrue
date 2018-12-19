var util = require('../../utils/util.js')
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var mpToken = app.globalData.mpToken
var get401 = app.globalData.get401
var getStorage = app.globalData.getStorage
var splitStrToArray = util.splitStrToArray
Page({
	data:{
    content: ''
  },
	onLoad: function(){
		const that = this
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
			success: function(res){
				if (res.data) {
					that.setData({
						accessToken: res.data
					})
					that.getHistory(res.data)
				}
			}
		})
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
	    url:`${url}/api/detailCard/searchDetailCards?content=${that.data.content}`,
	    header: {
	      'access-token': that.data.accessToken
	    },
	    method: 'POST'
	  }).then(val => {
	    if (val.data.code == 0) {
	      that.setData({
	        cardList: val.data.data,
	        showSearch: false
	      })
	      wx.hideLoading()
	    }
	  })
	},
	getHistory: function(accessToken) {
		const that = this
		wxRequest({
			url: `${url}/api/detailCard/getDetailCards`,
			header: {
				"access-token": accessToken
			}
		}).then(val => {
			if (val.data.code==0) {
				that.setData({
					cardList: val.data.data
				})
			}
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
	makeCall: function(e) {
	  let tel = e.currentTarget.dataset.id
	  wx.makePhoneCall({
	    phoneNumber: tel
	  })
	},
	showSearch: function(){
		this.setData({
			showSearch: true,
      content: ''
		})
	},
	cancelSearch: function() {
		this.setData({
			showSearch: false
		})
	},
	toMy: function() {
		wx.navigateBack({
		  delta: 1
		})
	}
})