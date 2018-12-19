// pages/my/applyMaster/applyMaster.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var get401 = app.globalData.get401
Page({

  /**
   * 页面的初始数据
   */
  data: {
    area: ['金融', '体育', '旅游', '教育', '游戏', '物流', '电商', '硬件', '社交', '新媒体', '房地产', '智能家居', '物联网', '大数据', '新农业', '企业服务', '人工智能', '消费升级', '广告营销', '医疗健康', '文化娱乐', '汽车交通', '工具软件', '本地生活', '知识付费', '新零售', '区块链', '共享经济', 'AR/VR', '社会公益', '其他'],
    experience: ['3-5年','5-10年','10年以上'],
    topicTime: ['0.5小时','1小时','1.5小时','2小时','2.5小时','3小时'],
    fieldIndex: '',
    experienceIndex: '',
    topicTimeIndex: '',
    selected: false,
    selectInvArea: [],
    imageUrlList: [], // 上传图片后返回的http链接列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.questionHome)
    if (typeof app.questionHome != 'undefined') {
      var data = app.questionHome
      // var area = data.investmentFields.split(',')
      var experience = this.data.experience
      var topicTime = this.data.topicTime
      if (data.investmentFields.length > 0) {
        this.setData({
          selectInvArea: data.investmentFields
        })
      }
      for (let i = 0; i < experience.length; i++) {
        if (experience[i] == data.investmentExperience) {
          data.investmentExperience = i
        }
      }
      for (let i = 0; i < topicTime.length; i++) {
        if (topicTime[i] == data.duration) {
          data.duration = i
        }
      }
      this.setData({
        name: data.name,
        city: data.city,
        scope: data.scope,
        investmentFields: data.investmentFields,
        experienceIndex: data.investmentExperience,
        servingOrganization: data.servingOrganization,
        fundIntroduced: data.fundIntroduced,
        position: data.position,
        education: data.education,
        professional: data.professional,
        imgUrl: data.imgUrl,
        questionUnitPrice: data.questionUnitPrice,
        meetingTopic: data.meetingTopic,
        topicTimeIndex: data.topicTimeIndex,
        meetingUnitPrice: data.meetingUnitPrice,
        achievement: data.achievement,
        id: data.id
      })
    }
    this.getToken()
    this.getStorage()
  },

  /**
 * 页面的初始数据
 */
  onReady: function () {
    //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
  },

  /**
 * 获取token
 */
  getToken: function () {
    let that = this
    wx.getStorage({
      key: 'accessToken',
      success: function (res) {
        if (typeof res.data == 'undefined') {
          console.log(res)
        } else {
          that.setData({
            accessToken: res.data
          })
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },

   /**
   * 获取本地存储用户信息
   */
  getStorage: function () {
    let that = this
    wx.getStorage({
      key: 'card',
      success: function (res) {
        if (res.data.length > 0) {
          if (typeof res.data[0].bcPhoto != 'undefined') {
            that.setData({
              avatarUrl: res.data[0].bcPhoto
            })
          }
        }
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },

 /**
   * 关闭模态框
   */
  close: function () {
    this.setData({
      isModal: false,
      PModal: false
    })
  },

  /**
   * 投资领域
   */
  bindField: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      fieldIndex: e.detail.value
    })
  },

   /**
   * 行业经验
   */
  bindExperience: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      experienceIndex: e.detail.value
    })
  },

  /**
   * 约见时长
   */
  bindTime: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      topicTimeIndex: e.detail.value
    })
  },

  // 开通约见
  bindSelected: function () {
    var that = this
    this.setData({
      selected: !that.data.selected
    })
  },

  /**
 * 选择图片
 */
  chooseImage: function () {
    var that = this
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.uploadImg(res.tempFilePaths)
        wx.showLoading({
          title: '上传中...',
          mask: true
        })
      }
    })
  },

  /**
 * 上传图片
 */
  uploadImg: function (imgUrl) {
    var that = this
    var imageUrlList = this.data.imageUrlList
    for (var i = 0; i < imgUrl.length; i++) {
      wx.uploadFile({
        url: `${url}api/file/upload`, //仅为示例，非真实的接口地址
        filePath: imgUrl[i],
        name: 'file',
        success: function (val) {
          var data = JSON.parse(val.data)
          if (data.code == 0) {
            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 1000
            })
            imageUrlList.push(data.data.url)
            console.log(imageUrlList)
            that.setData({
              credentials: imageUrlList,
              imageUrlList: imageUrlList
            })
          } else {
            wx.showToast({
              title: '上传失败',
              duration: 1000
            })
          }
        },
        fail: function (err) {
          wx.showToast({
            title: '上传失败',
            duration: 1000
          })
        }
      })
    }
  },

  /**
   * 表单验证
   */
  formSubmit: function (e) {
    let data = e.detail.value
    if (data.name && data.city && data.investmentFields && data.investmentExperience && data.servingOrganization && data.position && data.questionUnitPrice) {
      data.investmentFields = data.investmentFields.split(',')
      data.credentials = this.data.credentials
      data.status = 1
      console.log(data)
      this.postInvestor(data)
    } else {
      this.setData({
        message: '请填写必要的信息'
      })
      this.dialog.showDialog()
    }
  },

  /**
   * 提交表单，请求接口
   */
  postInvestor: function (data) {
    var that = this
    var postUrl,
          delta
    if (this.data.id) {
      postUrl = `${url}api/investor/update`
      delta = 2
    } else {
      postUrl = `${url}api/investor/add`
      delta = 1
    }
    console.log(data)
    wxRequest({
      url: postUrl,
      header: {
        "access-token": that.data.accessToken
      },
      data: data, 
      method: 'POST'
    }).then(val => {
      if (val.data.code == 0) {
        wx.navigateBack({
          delta: delta
        })
      } else if (val.data.code == 500 ) {
        this.setData({
          message: val.data.msg
        })
        this.dialog.showDialog()
      } else {
        get401(val, that.postInvestor, that, data)
      }
    }).catch(err => {
      this.setData({
        message: '服务器请求出错了'
      })
      this.dialog.showDialog()
    })
  },

  chooseInvestArea: function () {
    this.setData({
      showInvertArea: true,
      showModal: true
    })
    if (typeof this.data.invArea == 'undefined') {
      let area = this.data.area
      for (var i = 0, invArea = []; i < area.length; i++) {
        invArea.push('-1')
      }
      this.setData({
        invArea: invArea
      })
    };

  },
  // 选择投资领域
  chooseInvertorArea: function (e) {
    let id = e.currentTarget.dataset.id
    let area = this.data.area
    let invArea = this.data.invArea
    for (var i = 0; i < area.length; i++) {
      if (id == i && invArea[i] != area[i]) {
        invArea[i] = area[i]
        break;
      } else if (id == i && invArea[i] == area[i]) {
        invArea[i] = -1
        break;
      }
    }
    for (var i = 0, selectInvArea = []; i < invArea.length; i++) {
      if (invArea[i] != -1) {
        selectInvArea.push(invArea[i])
      }
    };
    this.setData({
      invArea: invArea,
      selectInvArea: selectInvArea,
      investmentFields: selectInvArea
    })
  },

  closeModal: function () {
    this.setData({
      showModal: false,
      showInvertArea: false
    })
  },
  // 关闭多选框
  resetInvertArea: function () {
    let selectInvArea = this.data.selectInvArea
    if (Array.isArray(selectInvArea)) {
      this.setData({
        selectInvArea: []
      })
    }
    let area = this.data.area
    for (var i = 0, invArea = []; i < area.length; i++) {
      invArea.push('-1')
    }
    this.setData({
      invArea: invArea
    })
  },
})