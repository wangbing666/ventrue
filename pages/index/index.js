//index.js
//获取应用实例
var util = require('../../utils/util.js')
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var mpToken = app.globalData.mpToken
var get401 = app.globalData.get401
var getStorage = app.globalData.getStorage
var splitStrToArray = util.splitStrToArray
Page({
  data: {
    motto: 'Hello World',
    userInfo: {}
  },
  /**
  * 页面的初始数据
  */
  onReady: function () {
    //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
  },

  onLoad: function (options) {
    var scene = options.scene
    var cardReg = /^168_/
    var pcReg = /^169_/
    var invoiceReg = /^170_/
    if(cardReg.test(scene)) {
      var id = scene.substring(scene.indexOf('_')+1)
      wx.redirectTo({
        url: `/pages/cardDetail/cardDetail?id=${id}`
      })
    }else if (pcReg.test(scene)) {
      var secret = scene.substring(scene.indexOf('_')+1)
      wx.showModal({
        title: '是否在PC端登录',
        success:function(res) {
          if (res.confirm) {
            wx.getStorage({
              key:'accessToken',
              success: function(res) {
                if (res.data) {
                  that.confirmPcLogin(res.data,secret)
                  .then(val => {
                    console.log(val.data)
                  })
                }
              }
            })
          }
        }
      })
    }else if (invoiceReg.test(scene)) {
      var id = scene.substring(scene.indexOf('_')+1)
      wx.redirectTo({
        url: `/pages/invoicedetail/invoicedetail?id=${id}&type=0`
      })
    }
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    wx.showLoading({
      title: '加载中...',
    })
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
   /* wx.getStorage({
      key: 'accessToken',
      success: function(res) {
        if (typeof res.data == 'undefined') {
          app.globalData.wxLogin(that.getCard)
        }else {
          that.setData({
            accessToken: res.data
          })
          that.getCard(res.data)
        }
      },
      fail: function(res) {
        app.globalData.wxLogin(that.getCard)
      }
    })*/
  },
  onShow: function() {
    const that = this
    wx.getStorage({
      key: 'bg',
      success: function(res) {
        that.setData({
          bg: res.data
        })
      },
      fail: function() {
        that.setData({
          bg: ''
        })
      }
    })
    wx.getStorage({
      key: 'accessToken',
      success: function(res) {
        if (typeof res.data == 'undefined') {
          app.globalData.wxLogin(that.getCard, that)
        }else {
          that.setData({
            accessToken: res.data
          })
          that.getCard(res.data)
          that.getBallBackCard(res.data)
        }
      },
      fail: function(res) {
        app.globalData.wxLogin(that.getCard, that)
      }
    })
  },
  onPullDownRefresh: function(){
    this.getCard(this.data.accessToken)
    this.getBallBackCard(this.data.accessToken)
    wx.stopPullDownRefresh()
  },
  onShareAppMessage: function () {
    const that = this
     return {
       title: that.data.card[0].bcName+'的名片',
       path: '/pages/cardDetail/cardDetail?id='+that.data.card[0].id,
       success: function(res) {
         // 转发成功
       },
       fail: function(res) {
         // 转发失败
       }
     }
  },
  confirmPcLogin: function(accessToken,secret) {
    return wxRequest({
      url: `${url}/api/backend/customer/scan/login?secret=${secret}`,
      header: {
        'access-token': accessToken
      },
      method: 'POST'
    })
  },
  goInvoice: function() {
    wx.navigateTo({
      url: '/pages/invoice/invoice',
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
  navigateAddr: function() {
    const that = this
    if (that.data.card[0].longitude && that.data.card[0].latitude) {
       wx.openLocation({
        latitude: Number(that.data.card[0].latitude),
        longitude: Number(that.data.card[0].longitude),
        name: that.data.card[0].address,
        scale: 28
      })
    }else if (true) {
      wxRequest({
        url:`https://apis.map.qq.com/ws/geocoder/v1/?address=${that.data.card[0].city}${that.data.card[0].address}&key=2IZBZ-QEGKO-WYJWO-SLJ4Y-SYHG6-C6BCB`
      }).then(val => {
        if (val.data.status == 0) {
          wx.openLocation({
              latitude: Number(val.data.result.location.lat),
              longitude: Number(val.data.result.location.lng),
              name: that.data.card[0].address,
              scale: 28
          })
        }
      })
    }
    else {
      wx.showModal({
        title: '无法对地址进行定位',
        showCancel: false
      })
    }
  },
  change: function() {
    wx.navigateTo({
      url: '/pages/bgc/bgc',
    })
  },
  getCard: function(accessToken) {
    const that = this
    getStorage({
      key:'accessToken'
    }).then(val=>{
      if (typeof val.data != 'undefined') {
        return wxRequest({
          url: `${url}/api/businessCard/getBusinessCard`,
          header: {
            "access-token": accessToken
          },
        })
      }
    })
    .then(function(res){
        console.log(res)
        wx.hideLoading()
        if (res.data.code == 0 &&res.data.data && res.data.data.length != 0) {
          that.setData({
            card: res.data.data,
            imgUrls: splitStrToArray(res.data.data[0].album),
            imgUrl: splitStrToArray(res.data.data[0].album)
          })
          wx.setStorage({
            key: 'card',
            data: res.data.data
          })
          if (res.data.data[0].bps && res.data.data[0].bps.length > 0) {
            wx.setStorage({
              key: 'bps',
              data: res.data.data[0].bps
            })
          }
          if (that.data.imgUrls[0] == '') {
            that.setData({
              imgUrls: []
            })
          }
        } else if (res.data.code == 0 && res.data.data && res.data.data.length == 0) {
          console.log('card为空')
          that.setData({
            card: []
          })
        } else {
          get401(res, that.getCard, that)
        }
    }).catch(err => {
      console.log(err)
    })
  },
  makeCall: function(e) {
    let tel = e.currentTarget.dataset.id
    wx.makePhoneCall({
      phoneNumber: tel
    })
  },
  previewImg: function(e) {
    let url = e.currentTarget.dataset.id
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: this.data.imgUrls // 需要预览的图片http链接列表
    })
  },
  createShareImg: function() {
    let res = `${url}/api/businessCard/share/image`
    this.createImg(res)
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
  goEdit: function() {
    wx.navigateTo({
      url:'/pages/editCard/editCard'
    })
  },
  goDevelopment: function() {
    wx.navigateTo({
      url: '/pages/development/development'
    })
  },
  goBP: function () {
    wx.navigateTo({
      url: '/pages/composeBP/composeBP'
    })
  },
  goMy: function() {
    wx.switchTab({
      url: '/pages/my/my'
    })
  },
  goContact: function() {
    wx.switchTab({
      url: '/pages/contacts/contacts'
    })
  },
  /*
  * 放到桌面
  */
  ondesktop: function (e) {
    console.log(e)
    this.setData({
      desktop: true
    })
  },
  /*
  * 关闭模态框
  */
  close: function () {
    this.setData({
      desktop: false
    })
  },
  /*
  * 精彩视频
  */
  onVideo: function () {
    wx.navigateTo({
      url: '/pages/greatVideo/greatVideo'
    })
  },
  /*
  * 办公租赁
  */
  officeRental: function () {
    wx.navigateTo({
      url: '/pages/officeRental/officeRental'
    })
  }
})
