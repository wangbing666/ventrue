var app = getApp()
var url = app.globalData.url
var wxRequest = app.globalData.util.wxRequest
var getStorageAccessToken = app.globalData.util.getStorageAccessToken
var getStorage = app.globalData.getStorage
var get401 = app.globalData.get401
var splitStrToArray = app.globalData.util.splitStrToArray
Page({
    data: {},
    onLoad: function(options) {
        const that = this
        var id = options.id
        var whetherReturn = options.whetherReturn
        if (typeof whetherReturn == 'undefined') {
            whetherReturn = 2
        }
        that.setData({
            id: id,
            whetherReturn: whetherReturn
        })
        wx.showLoading({
            title: '加载中...',
        })
    },
    onShow: function() {
        const that = this
        var id = that.data.id
        var whetherReturn = that.data.whetherReturn
        if(!wx.getSetting){
          wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法正常使用，请升级到最新微信版本后重试。'
          })
          return
        }
         wx.getSetting({
        success: function (res) {
          if (!res.authSetting['scope.userInfo']) {
            wx.showModal({
              title: '',
              content: '需要授权才能继续操作哦!',
              success: function (res) {
                if (res.confirm) {
                  wx.openSetting({
                    success: function (res) {
                      if (res.authSetting['scope.userInfo']) {
                        wx.getStorage({
                          key: 'card',
                          success: function (val) {
                            if (val.data[0].id == id) {
                              wx.switchTab({
                                url: "/pages/index/index"
                              })
                            } else if (typeof val.data[0].id != 'undefinded') {
                              that.setData({
                                myId: val.data[0].id,
                                myCard: val.data[0]
                              })
                            }
                          }
                        })
                        wx.getStorage({
                          key: 'accessToken',
                          success: function (res) {
                            if (typeof res.data == 'undefined') {
                              app.globalData.wxLogin(that.getMyCard, that)
                            } else {
                              that.setData({
                                accessToken: res.data
                              })
                              that.getMyCard(res.data)
                            }
                          },
                          fail: function (res) {
                            app.globalData.wxLogin(that.getMyCard, that)
                          }
                        })
                      }
                    }
                  })
                } else {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            })
          }
        }
      })
        wx.getStorage({
            key: 'card',
            success: function(val) {
                if (val.data[0].id == id) {
                    wx.switchTab({
                        url: "/pages/index/index"
                    })
                } else if (typeof val.data[0].id != 'undefinded') {
                    that.setData({
                        myId: val.data[0].id,
                        myCard: val.data[0]
                    })
                }
            }
        })
        wx.getStorage({
            key: 'accessToken',
            success: function(res) {
                if (typeof res.data == 'undefined') {
                    app.globalData.wxLogin(that.getMyCard, that)
                } else {
                    that.setData({
                        accessToken: res.data
                    })
                    that.getMyCard(res.data)
                }
            },
            fail: function(res) {
                app.globalData.wxLogin(that.getMyCard, that)
            }
        })
    },
    onUnload: function() {
        wx.removeStorage({
            key: 'otherCard',
            success: function(res) {},
        })
    },
    onPullDownRefresh: function() {
        this.getCard(this.data.accessToken)
        wx.stopPullDownRefresh()
    },
    goBP: function() {
      const that = this
      wx.setStorage({
        key: 'bps',
        data: that.data.businessCard.bps,
        success: function() {
          wx.navigateTo({
            url: '/pages/upload/upload?type=0',
          })
        }
      })
    },
    getMyCard: function(accessToken) {
        const that = this
        getStorage({
                key: 'accessToken'
            }).then(val => {
                if (typeof val.data != 'undefined') {
                    that.setData({
                        accessToken: val.data
                    })
                    return wxRequest({
                        url: `${url}/api/businessCard/getBusinessCard`,
                        header: {
                            "access-token": val.data
                        },
                    })
                }
            })
            .then(function(res) {
                console.log(res)
                //wx.hideLoading()
                if (res.data.code == 0) {
                    that.setData({
                        card: res.data.data,
                    })
                    if (res.data.data.length > 0) {
                        that.setData({
                            myId: res.data.data[0].id
                        })
                        wx.setStorage({
                            key: 'card',
                            data: res.data.data
                        })
                    } else {
                        that.setData({
                            myId: -1
                        })
                    }
                }
                wx.getStorage({
                    key: 'otherCard',
                    success: function(val) {
                        if (val.data && typeof val.data != 'undefinded') {
                            that.setOptions(val.data)
                            wx.hideLoading()
                            wx.setNavigationBarTitle({
                                title: val.data.bcName + '的名片'
                            })
                            that.setData({
                                businessCard: val.data
                            })
                        } else {
                            that.getCard(that.data.accessToken)
                        }
                    },
                    fail: function() {
                        wx.hideLoading()
                        that.getCard(that.data.accessToken)
                    }
                })

                get401(res, that.getMyCard)
            }).catch(err => {
                console.log(err)
            })
    },
    navigateAddr: function() {
        const that = this
        if (that.data.businessCard.longitude && that.data.businessCard.latitude) {
            wx.openLocation({
                latitude: Number(that.data.businessCard.latitude),
                longitude: Number(that.data.businessCard.longitude),
                name: that.data.businessCard.address,
                scale: 28
            })
        } else if (that.data.businessCard.address) {
        	wxRequest({
        		url:`https://apis.map.qq.com/ws/geocoder/v1/?address=${that.data.businessCard.city}${that.data.businessCard.address}&key=2IZBZ-QEGKO-WYJWO-SLJ4Y-SYHG6-C6BCB`
        	}).then(val => {
        		if (val.data.status == 0) {
        			wx.openLocation({
        			    latitude: Number(val.data.result.location.lat),
        			    longitude: Number(val.data.result.location.lng),
        			    name: that.data.businessCard.address,
        			    scale: 28
        			})
        		}
        	})
        }else {
        	showModal({
        		title: '无法对地址进行定位',
        		showCancel: false
        	})
        }
    },
    previewImg: function(e) {
        let url = e.currentTarget.dataset.id
        wx.previewImage({
            current: url, // 当前显示图片的http链接
            urls: this.data.imgUrls // 需要预览的图片http链接列表
        })
    },
    makeCall: function(e) {
        let tel = e.currentTarget.dataset.id
        wx.makePhoneCall({
            phoneNumber: tel
        })
    },
    setOptions: function(business) {
        this.setData({
            selectInvFinance: this.valid(splitStrToArray(business.investmentStage)),
            selectInvRes: this.valid(splitStrToArray(business.serviceDemand)),
            selectInvArea: this.valid(splitStrToArray(business.investmentField)),
            selectService: this.valid(splitStrToArray(business.serviceType)),
            domain: business.cInvestmentField,
            entreFin: business.lunCi,
            imgUrls: this.valid(splitStrToArray(business.album)),
            imgUrl: this.valid(splitStrToArray(business.album))
        })
        if (this.data.imgUrls[0] == '') {
            this.setData({
                imgUrls: []
            })
        } else if (this.data.imgUrls.length > 9) {
            this.setData({
                imgUrl: this.data.imgUrls.splice(0, 8)
            })
        }
    },
    valid: function(arr) {
        if (Array.isArray(arr) && arr[0] == '点击选择') {
            return arr = []
        }
        return arr
    },
    sendBallBackCard: function() {
        const that = this
        wx.showModal({
            title: '',
            content: '是否确定回传名片',
            success: function(res) {
                if (res.confirm) {
                    that.ballBackCard()
                }
            }
        })
    },
    ballBackCard: function() {
        const that = this
        let date = new Date().getTime()
        wxRequest({
            url: `${url}/api/ballBackCard/saveBackCard?receiverCardId=${that.data.businessCard.id}&returnCardId=${that.data.myId}`,
            method: 'POST',
            header: {
                "access-token": that.data.accessToken
            },
        }).then(val => {
            if (val.data.code == 0) {
                that.setData({
                    closeBall: true
                })
            }
        })
    },
    addContact: function(e) {
        const that = this
        let id = e.currentTarget.dataset.id
        let accessToken = that.data.accessToken
        that.addContactUrl(accessToken, id).then(val => {
            if (val.data.code == 0) {
                let businessCard = that.data.businessCard
                businessCard.enshrine = !businessCard.enshrine
                that.setData({
                    businessCard: businessCard
                })
                wx.showToast({
                    title: val.data.msg,
                    icon: 'success'
                })
            }
        })
    },
    addContactUrl: function(accessToken, id) {
        const that = this
        return wxRequest({
            url: `${url}/api/mailList/saveContact?coverCardId=${that.data.businessCard.id}&collectOrCancel=${id}`,
            header: {
                "access-token": accessToken
            },
            method: 'POST',
        })
    },
    getCard: function(accessToken) {
        const that = this
        wxRequest({
            url: `${url}/api/detailCard/lookBusinessCard`,
            header: {
                "access-token": accessToken
            },
            data: {
                "coverCardId": that.data.id,
                "whetherReturn": that.data.whetherReturn,
                "visitorCardId": that.data.myId
            }
        }).then(val => {
            console.log(val.data)
            if (val.data.code == 0) {
                that.setOptions(val.data.data)
                wx.hideLoading()
                wx.setNavigationBarTitle({
                    title: val.data.data.bcName + '的名片'
                })
                that.setData({
                    businessCard: val.data.data
                })

            }
        })
    },
    backMyCard: function() {
        wx.switchTab({
            url: '/pages/contacts/contacts'
        })
    },
    goEdit: function() {
        wx.navigateTo({
            url: '/pages/editCard/editCard'
        })
    }
})