//logs.js
var util = require('../../utils/util.js')
var tcity = require("../../utils/citys.js");
var validForm = util.validForm
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var splitStrToArray = app.globalData.util.splitStrToArray
Page({
  data: {
  	provinces: [],
  	province: "",
  	citys: [],
  	city: "",
  	countys: [],
  	county: '',
  	value: [0, 0, 0],
  	values: [0, 0, 0],
  	condition: false,
    identity: ['创业者','投资人','空间','服务','其他'],
    selectedIdentity: 0,
    isPublic: true,
    addrInfo: '点击选择',
    area:['金融','体育','旅游','教育','游戏','物流','电商','硬件','社交','新媒体','房地产','智能家居','物联网','大数据','新农业','企业服务','人工智能','消费升级','广告营销','医疗健康','文化娱乐','汽车交通','工具软件','本地生活','知识付费','新零售','区块链','共享经济','AR/VR','社会公益','其他'],
    resource: ['投资人','同行/上下游','创业项目','空间/工位','写BP/方案','政策资金申报','融资/信贷','媒体报道','办公租赁','注册/财务','人事/培训/团建','法律','商标/资质','技术外包/云服务','社保/团购','设计/营销/新媒体'],
    finance: ['种子轮','天使轮','Pre-A轮','A轮','B轮','C轮','D轮','E轮','F轮','Pre-IPO','新三板','并购'],
    service: ['融资/信贷','写BP/方案','创业项目','空间/工位','注册/财务','人事/培训/团建','商标/资质','办公租赁','法律','技术外包/云服务','社保/团购','设计/营销/新媒体'],
    entreFin: '点击选择',
    customItem: '全部',
    selectInvRes:[],
    index:0,
    selectInvArea: [],
    selectInvFinance: [],
    selectedService: [],
    name: '',
    businessCard: {
      isOpen: 1,
      identity: 0,
      city: '上海',
    },
    region: ['北京市', '北京市', '东城区'],
    avatar: '',
    imgUrls: [],
    count: 60,
    showMore: false
  },
  /**
   * 页面的初始数据
   */
  onReady: function () {
    //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
  },
  onLoad: function () {
  	const that = this
    wx.showLoading({
      title:'加载中',
      mask: true
    })
  	//that.initCity()
    wx.getStorage({
      key:'accessToken',
      success: function(res) {
        that.setData({
          accessToken: res.data
        })
      }
    })
    wx.getStorage({
      key: 'userInfo',
      success: function(res) {
        that.setData({
          avatar: res.data.avatarUrl,
          uname: res.data.nickName
        })
      }
    })
    wx.getStorage({
      key: 'card',
      success: function(res) {
        wx.hideLoading()
        if (res.data.length > 0 ) {

          if ( typeof res.data[0].bcPhoto != 'undefined') {
            console.log(res.data[0].bcPhoto)
            that.setData({
              avatar:res.data[0].bcPhoto
            })
          }
          if ( typeof res.data[0].bcName != 'undefined') {
            that.setData({
              uname: res.data[0].bcName
            })
          }
          if ( typeof res.data[0].bcMobile != 'undefined') {
            that.setData({
              tel: res.data[0].bcMobile
            })
          }
          that.setOptions(res.data[0])
          that.showCity(res.data[0])
          that.setData({
            card: res.data[0],
            businessCard: res.data[0],
          })
        }
      },
      fail: function(){
        wx.hideLoading()
      }
    })
  },
  onShow: function() {
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
                      app.globalData.wxLogin()
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
  },
  cancel: function() {
    wx.navigateBack({
      delta: 1
    })
  },
  changeShowMore: function() {
    let showMore = this.data.showMore
    this.setData({
      showMore: !showMore
    })
  },
  setOptions: function(business) {
    this.setData({
      selectInvFinance : this.validArr(splitStrToArray(business.investmentStage)),
      selectInvRes : this.validArr(splitStrToArray(business.serviceDemand)),
      selectInvArea : this.validArr(splitStrToArray(business.investmentField)),
      selectedService : this.validArr(splitStrToArray(business.serviceType)),
      entreFin: business.lunCi,
      imgUrls: splitStrToArray(business.album),
      wxQrCode: business.wxQrCode,
      companyLogo: business.companyLogo
    })
    if (this.data.imgUrls[0] == '') {
      this.setData({
        imgUrls: []
      })
    }
  },
  validArr: function(arr) {
    if (arr.length == 0 || arr[0] == '') {
      return ['点击选择']
    }
    return  arr
  },
  showCity: function(businessCard) {
    if (businessCard.city) {
      let region = businessCard.city.split(" ")
      this.setData({
        region: region
      })
    }
  },
  validPhoneNumber: function(num) {
    var myreg = /^1[34578][0-9]{9}$/; 
    if(!myreg.test(num || this.data.businessCard.bcMobile == this.data.tel)) return false
      return true
  },
  tick: function () {
    var that = this
    if (that.data.count > 0) {
      that.setData({
        count: that.data.count - 1
      });
      setTimeout(function () {
        return that.tick()
      }, 1000)
    } else {
      that.setData({
        count: 60
      });
    }
  },
  bindRegionChange: function (e) {
    let businessCard = this.data.businessCard
    let city = e.detail.value.join(' ')
    businessCard.city = city
    this.setData({
      region: e.detail.value
    })
  },
  chooseFile: function() {
    wx.getSavedFileList({
      success: function(res) {
        console.log(res.fileList)
      }
    })
  },
  chooseAvatar: function(e) {
    console.log(e.currentTarget.id)
    const id = e.currentTarget.id
    const that = this
    wx.chooseImage({
      count: 1,
      success: function(res) {
        var tempFilePaths = res.tempFilePaths
        wx.showLoading({
          title: '上传中...',
          mask: true
        })          
        for (var i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            url: `${url}api/file/upload`, //仅为示例，非真实的接口地址
            filePath: tempFilePaths[i],
            name: 'file',
            success: function(val){
              var data = JSON.parse(val.data)
              wx.hideLoading()

              if (data.code == 0) {                
                wx.showToast({
                  title: '上传成功',
                  icon: 'success',
                  duration: 1000
                })
                if (id == 'avatar') {
                  that.setData({
                    avatar: data.data.url
                  })
                } else if (id == 'wechatImg') {
                  that.setData({
                    wxQrCode: data.data.url
                  })
                } else if (id == 'companyLogo') {
                  that.setData({
                    companyLogo: data.data.url
                  })
                }
              }else {
                wx.showToast({
                  title: '上传失败',
                  duration: 1000
                })
              }              
            },
          })
        }
      }
    })
  },
  chooseImg: function() {
    const that = this
    wx.chooseImage({
      success: function(res) {
        var tempFilePaths = res.tempFilePaths   
        var imgUrls = that.data.imgUrls     
        for (var i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            url: `${url}/api/file/upload`, //仅为示例，非真实的接口地址
            filePath: tempFilePaths[i],
            name: 'file',
            success: function(val){
              var data = JSON.parse(val.data)
              wx.hideLoading()
              if (data.code == 0) {                
                wx.showToast({
                  title: '上传成功',
                  icon: 'success',
                  duration: 1000
                })
                imgUrls.push(data.data.url)
              }else {
                wx.showToast({
                  title: '上传失败',
                  duration: 1000
                })
              }
              that.setData({
                imgUrls: imgUrls
              })
            }
          })
        }
      }
    })
  },
  deleteImg: function(e) {
    let id= e.currentTarget.dataset.id
    let imgUrls = this.data.imgUrls
    imgUrls.splice(id,1)
    this.setData({
      imgUrls: imgUrls
    })
  },
  previewImg: function(e) {
    let url = e.currentTarget.dataset.id
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: this.data.imgUrls // 需要预览的图片http链接列表
    })
  },
  save: function() {
    const that = this
    let business = that.data.businessCard
    console.log(business)
    business.bcPhoto = that.data.avatar
    business.bcName = that.data.uname
    business.wxQrCode = that.data.wxQrCode
    business.companyLogo = that.data.companyLogo
    business.investmentField = that.data.selectInvArea.join(';')
    business.investmentStage = that.data.selectInvFinance.join(';')
    switch(business.identity) {
      case 0:
        business.identity = 'entrepreneur'
        break
      case 1:
        business.identity = 'investor'
        break
      case 2:
        business.identity = 'space'
        break
      case 3:
        business.identity = 'post'
        break
      case 4:
        business.identity = 'other'
        break
    }
    // business.isOpen = that.data.isPublic
    let selectInvRes = that.data.selectInvRes.join(';')
    let selectInvArea = that.data.selectInvArea.join(';')
    let selectInvFinance = that.data.selectInvFinance.join(';')
    let selectService = that.data.selectedService.join(';')
    business.serviceDemand = selectInvRes//人脉/资源/服务
    business.serviceType = selectService//服务类型
    business.investmentField = selectInvArea //投资人投资领域
    business.investmentStage = selectInvFinance //投资人投资领域
    business.lunCi = that.data.entreFin
    if (that.data.imgUrls) {
      business.album = this.data.imgUrls.join(';')
    }

    if (validForm(business) && typeof that.data.card =='undefined') {
      console.log('没有用户')
      app.validCode(business.bcMobile,that.data.code).then(val => {
        console.log(val.data)
        if (val.data.code==0) {
          wxRequest({
            url:`${url}/api/businessCard/createBusinessCard`,
            data: business,
            header: {
              "access-token": that.data.accessToken,
            },
            method:'POST'
          }).then(val=> {
            if (val.data.code == 0) {
              var card = []
              card.push(val.data.data)
              wx.setStorage({
                key:'card',
                data: card
              })
              that.bindMobile()
              that.cancel()
            } else {
              that.setData({
                message: '保存失败'
              })
              that.dialog.showDialog()
            }
          }).catch(err => {
            that.setData({
              message: '保存失败'
            })
            that.dialog.showDialog()
          })
        }else {
          wx.showModal({
            title:'',
            content:val.data.msg,
            showCancel: false,
            success: function() {
              return 
            }
          })
        }
      })
    } else if (validForm(business) && typeof that.data.card !='undefined') {
      console.log(business)
      let id = business.id
      delete business.id
      delete business.user
      wxRequest({
        url:`${url}/api/businessCard/updateBusinessCard?cardId=${id}`,
        data: business,
        header: {
          "access-token": that.data.accessToken,
        },
        method:'POST',
      }).then(val=> {
        console.log(val.data)
        if (val.data.code == 0) {
          that.cancel()
        } else {
          that.setData({
            message: '保存失败'
          })
          that.dialog.showDialog()
        }
      }).catch(err => {
        console.log(err)
        that.setData({
          message: '保存失败'
        })
        that.dialog.showDialog()
      })
    }
    else {
      wx.showModal({
        title: '',
        content: '您需要填写完整信息',
        showCancel: false,
      })
    }
  },
  bindMobile: function() {
    const that = this
    wxRequest({
      url:`${url}/api/user/mobile/binding`,
      header: {
        "content-type": "application/x-www-form-urlencoded",
        "access-token": that.data.accessToken
      },
      data: {
        "mobile": that.data.businessCard.bcMobile,
        "code": that.data.code
      },
      method: 'POST'
    }).then(val => {
      if (val.data.code == 0) {
        return true
      }
      return false
    })
  },
  getValidCode: function() {
    let mobile = this.data.businessCard.bcMobile
    if (this.validPhoneNumber(mobile) && this.data.count == 60){
      app.getValidCode(mobile)
      this.tick()
    }
  },
  chooseAddr: function() {
	  	var that = this
	  	wx.getLocation({
	  	   type: 'gcj02', //返回可以用于wx.openLocation的经纬度
	  	   success: function (res) {
	  	     console.log(res)
	  	     wx.chooseLocation({
	  	       success: function (res) {
              let businessCard = that.data.businessCard
              businessCard.address = res.address
              businessCard.longitude = res.longitude
              businessCard.latitude = res.latitude
	  	         that.setData({
	  	         	detailAddress:res.address,
                businessCard:businessCard
	  	         })
	  	       }
	  	     })
	  	   }
	  	 })
  },
  chooseDomain: function() {
  	this.setData({
  		showModal: true,
  		showArea: true
  	})
  },
  showService: function() {
  	this.setData({
  		showService: true,
  		showModal: true
  	})
  	if (typeof this.data.selectService == 'undefined') {
  		let service = this.data.service
  		for (var i = 0,selectService = []; i < service.length; i++) {
  			selectService.push('-1')
  		}
  		this.setData({
  			selectService: selectService
  		})
  	};
  },
  chooseService: function(e) {//选择服务类别
  	let id = e.currentTarget.dataset.id
  	let service = this.data.service
  	let selectService = this.data.selectService
  	for (var i = 0; i < service.length; i++) {
  		if ( id == i && selectService[i] != service[i]) {
  			selectService[i] = service[i]
  			break;
  		}else if ( id == i && selectService[i] == service[i]) {
  			selectService[i] = -1
  			break;
  		}
  	}
  	for (var i = 0,selectedService=[]; i < selectService.length; i++) {
  		if(selectService[i] != -1) {
  			selectedService.push(selectService[i])
  		}
  	};

  	this.setData({
  		selectService: selectService,
  		selectedService: selectedService
  	})  	
  },
  uploadBP: function() {
    wx.navigateTo({
      url: '/pages/upload/upload'
    })
  },
  showInvertFina: function() {
  	this.setData({
  		showInvertFinance: true,
  		showModal: true
  	})
  	if (typeof this.data.invFinance == 'undefined') {
  		let finance = this.data.finance
  		for (var i = 0,invFinance = []; i < finance.length; i++) {
  			invFinance.push('-1')
  		}
  		this.setData({
  			invFinance: invFinance
  		})
  	};
  },
  chooseInvertFina: function(e) {//选择投资阶段
  	let id = e.currentTarget.dataset.id
  	let finance = this.data.finance
  	let invFinance = this.data.invFinance
  	for (var i = 0; i < finance.length; i++) {
  		if ( id == i && invFinance[i] != finance[i]) {
  			invFinance[i] = finance[i]
  			break;
  		}else if ( id == i && invFinance[i] == finance[i]) {
  			invFinance[i] = -1
  			break;
  		}
  	}
  	for (var i = 0,selectInvFinance=[]; i < invFinance.length; i++) {
  		if(invFinance[i] != -1) {
  			selectInvFinance.push(invFinance[i])
  		}
  	};
  	this.setData({
  		invFinance: invFinance,
  		selectInvFinance: selectInvFinance
  	})
  },
  showResource: function(e) {
  	this.setData({
  		showResource: true,
  		showModal: true
  	})
  	if (typeof this.data.invRes == 'undefined') {
  		let res = this.data.resource
  		for (var i = 0,invRes = []; i < res.length; i++) {
  			invRes.push('-1')
  		}
  		this.setData({
  			invRes: invRes
  		})
  	};
  },
  chooseResource: function(e) {//选择人脉&资源&服务需求
  	let id = e.currentTarget.dataset.id
  	let resource = this.data.resource
  	let invRes = this.data.invRes
  	for (var i = 0; i < resource.length; i++) {
  		if ( id == i && invRes[i] != resource[i]) {
  			invRes[i] = resource[i]
  			break;
  		}else if ( id == i && invRes[i] == resource[i]) {
  			invRes[i] = -1
  			break;
  		}
  	}
  	for (var i = 0,selectInvRes=[]; i < invRes.length; i++) {
  		if(invRes[i] != -1) {
  			selectInvRes.push(invRes[i])
  		}
  	};
  	this.setData({
  		invRes: invRes,
  		selectInvRes: selectInvRes
  	})
  },
  resetRes: function() {
  		let selectInvRes = this.data.selectInvRes
  		if (Array.isArray(selectInvRes)) {
  			this.setData({
  				selectInvRes: []
  			})
  		}
  		let resource = this.data.resource
  		for (var i = 0,invRes = []; i < resource.length; i++) {
  			invRes.push('-1')
  		}
  		this.setData({
  			invRes: invRes
  		})
  },
  resetInvertFinance: function() {//重置投资人投资阶段
	  	let selectInvFinance = this.data.selectInvFinance
	  	if (Array.isArray(selectInvFinance)) {
	  		this.setData({
	  			selectInvFinance: []
	  		})
	  	}
	  	let finance = this.data.finance
	  	for (var i = 0,invFinance = []; i < finance.length; i++) {
	  		invFinance.push('-1')
	  	}
	  	this.setData({
	  		invFinance: invFinance
	  	})
  },
  chooseInvestArea: function() {
  	this.setData({
  		showInvertArea: true,
  		showModal: true
  	})
  	if (typeof this.data.invArea == 'undefined') {
  		let area = this.data.area
  		for (var i = 0,invArea = []; i < area.length; i++) {
  			invArea.push('-1')
  		}
  		this.setData({
  			invArea: invArea
  		})
  	};
  	
  },
  // 选择投资领域
  chooseInvertorArea: function(e) {
  	let id = e.currentTarget.dataset.id
  	let area = this.data.area
  	let invArea = this.data.invArea
  	for (var i = 0; i < area.length; i++) {
      if (id == i && invArea[i] != area[i]) {
  			invArea[i] = area[i]
  			break;
  		}else if ( id == i && invArea[i] == area[i]) {
  			invArea[i] = -1
  			break;
  		}
  	}
  	for (var i = 0,selectInvArea=[]; i < invArea.length; i++) {
  		if(invArea[i] != -1) {
  			selectInvArea.push(invArea[i])
  		}
  	};
  	this.setData({
  		invArea: invArea,
  		selectInvArea: selectInvArea
  	})
  },
  resetInvertArea: function() {
  	let selectInvArea = this.data.selectInvArea
  	if (Array.isArray(selectInvArea)) {
  		this.setData({
  			selectInvArea: []
  		})
  	}
  	let area = this.data.area
  	for (var i = 0,invArea = []; i < area.length; i++) {
  		invArea.push('-1')
  	}
  	this.setData({
  		invArea: invArea
  	})
  },
  resetService: function() {
  	let selectedService = this.data.selectedService
  	if (Array.isArray(selectedService)) {
  		this.setData({
  			selectedService: []
  		})
  	}
  	let service = this.data.service
  	for (var i = 0,selectService = []; i < service.length; i++) {
  		selectService.push('-1')
  	}
  	this.setData({
  		selectService: selectService
  	})
  },
  showEntreType: function() {
  	this.setData({
  		showFinance: true,
  		showModal: true
  	})
  },
  chooseFina: function(e) {
  	let id = e.currentTarget.dataset.id
  	this.setData({
  		entreFinId: id,
  		entreFin: this.data.finance[id]
  	})
  },
  resetFinance: function() {
  	this.setData({
  		entreFinId: -1,
  		entreFin: ''
  	})
  },
  bindChange: function(e) {
		var val = e.detail.value
		var t = this.data.values;
		var cityData = this.data.cityData;
		if (val[0] != t[0]) {
		    console.log('province no ');
		    const citys = [];
		    const countys = [];

		    for (let i = 0; i < cityData[val[0]].sub.length; i++) {
		        citys.push(cityData[val[0]].sub[i].name)
		    }
		    for (let i = 0; i < cityData[val[0]].sub[0].sub.length; i++) {
		        countys.push(cityData[val[0]].sub[0].sub[i].name)
		    }

		    this.setData({
		        province: this.data.provinces[val[0]],
		        city: cityData[val[0]].sub[0].name,
		        citys: citys,
		        county: cityData[val[0]].sub[0].sub[0].name,
		        countys: countys,
		        values: val,
		        value: [val[0], 0, 0]
		    })

		    return;
		}
		if (val[1] != t[1]) {
		    console.log('city no');
		    const countys = [];

		    for (let i = 0; i < cityData[val[0]].sub[val[1]].sub.length; i++) {
		        countys.push(cityData[val[0]].sub[val[1]].sub[i].name)
		    }

		    this.setData({
		        city: this.data.citys[val[1]],
		        county: cityData[val[0]].sub[val[1]].sub[0].name,
		        countys: countys,
		        values: val,
		        value: [val[0], val[1], 0]
		    })
		    return;
		}
		if (val[2] != t[2]) {
		    console.log('county no');
		    this.setData({
		        county: this.data.countys[val[2]],
		        values: val
		    })
		    return;
		}
		let addrInfo = `${this.data.province}-${this.data.city}-${this.data.county}`
		this.setData({
			addrInfo: addrInfo
		})
  },
  open:function(){
  		let addrInfo = `${this.data.province}-${this.data.city}-${this.data.county}`
	    this.setData({
	      condition:!this.data.condition,
	      showModal: true,
	      addrInfo: addrInfo
	    })
	    if (!this.data.condition) {
	    	this.closeModal()
	    };
  },
  closeModal: function(){
	  	this.setData({
	  		showModal: false,
	  		condition: false,
	  		showArea: false,
	  		showResource: false,
	  		showFinance: false,
	  		showService: false,
	  		showInvertFinance: false,
	  		showInvertArea: false
	  	})
  },
  resetCity: function(){
	  	this.setData({
	  		value:[0,0,0],
	  		values:[0,0,0],
	  		addrInfo: '点击选择'
	  	})
	  	this.closeModal()
	  	this.initCity()
  },
  initCity: function() {
	  	const that = this;	
	  	tcity.init(that);
	  	var cityData = that.data.cityData;	
	  	const provinces = [];
	  	const citys = [];
	  	const countys = [];
	  	for(let i=0;i<cityData.length;i++){
	  	  	provinces.push(cityData[i].name);
	  	}
	  	//console.log('省份完成');
	  	for (let i = 0 ; i < cityData[0].sub.length; i++) {
	  	  	citys.push(cityData[0].sub[i].name)
	  	}
	  	//console.log('city完成');
	  	for (let i = 0 ; i < cityData[0].sub[0].sub.length; i++) {
	  	  	countys.push(cityData[0].sub[0].sub[i].name)
	  	}
	  	that.setData({
	  	  'provinces': provinces,
	  	  'citys':citys,
	  	  'countys':countys,
	  	  'province':cityData[0].name,
	  	  'city':cityData[0].sub[0].name,
	  	  'county':cityData[0].sub[0].sub[0].name
	  	})
  },
  isPublic: function(e) {
	  	let id = e.currentTarget.dataset.id
      let businessCard = this.data.businessCard
      businessCard.isOpen = id
	  	this.setData({
	  		isPublic: id,
        businessCard: businessCard
	  	})
  },
  chooseIdentity: function(e) {
  	let id = e.currentTarget.dataset.id
    let businessCard = this.data.businessCard
    businessCard.identity = id
  	this.setData({
  		selectedIdentity: id,
      businessCard: businessCard
  	})
  },
  chooseCode: function(e){

  },
  inputName: function(e) {
    let businessCard = this.data.businessCard
    businessCard.bcName = e.detail.value
  	this.setData({
  		businessCard: businessCard,
      uname: e.detail.value
  	})
  },
  inputMobile: function(e) {//手机号
    let businessCard = this.data.businessCard
    businessCard.bcMobile = e.detail.value
    this.setData({
      validTel: this.validPhoneNumber(e.detail.value)
    })
  	this.setData({
      businessCard: businessCard
    })
  },
  inputCode: function(e) {//验证码
    this.setData({
  		code: e.detail.value
  	})
  },
  inputCompany: function(e) {//公司
    let businessCard = this.data.businessCard
    businessCard.company = e.detail.value
  },
  inputJob: function(e) {//职务
    let businessCard = this.data.businessCard
    businessCard.post = e.detail.value
  },
  inputWechat: function(e) {//微信号
    let businessCard = this.data.businessCard
    businessCard.wxNumber = e.detail.value
    this.setData({
  		wechat: e.detail.value
  	})
  },
  inputDetailAddr: function(e) {
    let businessCard = this.data.businessCard
    businessCard.address = e.detail.value
  	this.setData({
      businessCard: businessCard
    })
    this.setData({
  		detailAddr: e.detail.value
  	})
  },
  inputEntrep: function(e) {//项目简介
    let businessCard = this.data.businessCard
    businessCard.projectBrief = e.detail.value
  	this.setData({
      businessCard: businessCard
    })
  },
  inputEmail: function(e) {
    let businessCard = this.data.businessCard
    businessCard.email = e.detail.value
  	this.setData({
      businessCard: businessCard
    })
  },
  inputInvertorArea: function(e) {
    this.setData({
  		invertorArea: e.detail.value
  	})
  },
  inputInvertorCase: function(e) {//投资案例
    let businessCard = this.data.businessCard
    businessCard.investmentCase = e.detail.value
  	this.setData({
      businessCard: businessCard
    })
  },
  inputSpaceDesc: function(e) {//空间简介
    let businessCard = this.data.businessCard
    businessCard.spaceSynopsis = e.detail.value
  	this.setData({
      businessCard: businessCard
    })
  },
  inputService: function(e) {
    let businessCard = this.data.businessCard
    businessCard.serviceBrief = e.detail.value
  	this.setData({
      businessCard: businessCard
    })
  },
  inputProjectName: function(e) {
    let businessCard = this.data.businessCard
    businessCard.projectName = e.detail.value
  	this.setData({
      businessCard: businessCard
    })
    this.setData({
  		projectName: e.detail.value
  	})
  },
  inputTransferRate: function(e) {
    let businessCard = this.data.businessCard
    businessCard.biLi = e.detail.value
  	this.setData({
      businessCard: businessCard
    })
    this.setData({
  		transferRate: e.detail.value
  	})
  },
  inputTransferMoney: function(e) {
    let businessCard = this.data.businessCard
    businessCard.money = e.detail.value    
  	this.setData({
      businessCard: businessCard
    })
    this.setData({
  		transferMoney: e.detail.value
  	})
  },
  inputTelephone: function(e) {
    let businessCard = this.data.businessCard
    businessCard.landlineNumber = e.detail.value   
  	this.setData({
      businessCard: businessCard
    })
  },
  inputFax: function (e) {
    let businessCard = this.data.businessCard
    businessCard.faxNumber = e.detail.value
    this.setData({
      businessCard: businessCard
    })
  },
  inputUrl: function(e) {
    let businessCard = this.data.businessCard
    businessCard.webSite = e.detail.value
  	this.setData({
      businessCard: businessCard
    })
  },
  inputWeibo: function(e) {
    let businessCard = this.data.businessCard
    businessCard.weibo = e.detail.value
  	this.setData({
      businessCard: businessCard
    })
    this.setData({
  		weibo: e.detail.value
  	})
  },
  inputInvestorCase: function(e) {
    let businessCard = this.data.businessCard
    businessCard.investmentCase = e.detail.value
  	this.setData({
      businessCard: businessCard
    })
    this.setData({
  		invCase: e.detail.value
  	})
  },
  inputQq: function(e) {
    let businessCard = this.data.businessCard
    businessCard.qqNumber = e.detail.value
  	this.setData({
      businessCard: businessCard
    })
    this.setData({
  		qq: e.detail.value
  	})
  },
  inputIntroduce: function(e) {//个人简介
    let businessCard = this.data.businessCard
    businessCard.bcBrief = e.detail.value
  	this.setData({
      businessCard: businessCard
    })
    this.setData({
  		introduce: e.detail.value
  	})
  },
})
