 // pages/development/development-confirm/development-confirm.js

var app = getApp()
var wxRequest = app.globalData.wxRequest
var getStorage = app.globalData.getStorage
var get401 = app.globalData.get401
var url = app.globalData.url

Page({

  /**
   * 页面的初始数据
   */
  data: {
    details: ''
  },

  /**
   * 页面的初始数据
   */
  onReady: function () {
    //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this
    if (options.bpTemplateName && options.budget) {
      this.setData({
        budget: options.budget,
        bpTemplateName: options.bpTemplateName
      })
    } else if (options.requirementType && options.budget) {
      this.setData({
        budget: options.budget,
        requirementType: options.requirementType
      })
    }
    wx.getStorage({
      key: 'card',
      success: function (res) {
        console.log(res)
        self.setData({
          bcName: res.data[0].bcName || '',
          tel: res.data[0].bcMobile || '',
          company: res.data[0].company || '',
          wechat: res.data[0].wxNumber || '',
          imgurl: res.data[0].bcPhoto || '',
          id: res.data[0].id || '',
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  /**
   * 填写需求详情
   */
  detailsInput: function (e) {
    this.setData({
      details: e.detail.value
    })
  },

  /**
   * 确认提交
   */
  development: function () {
    var API
    var data = {
      budget: this.data.budget,
      details: this.data.details
    }
    if (this.data.requirementType && this.data.details) { //技术外包
      data.requirementType = this.data.requirementType
      API = 'api/Outsourcing/commit'
      this.request(API, data)
    } else if (this.data.bpTemplateName && this.data.details) {//BP撰写
      data.bpTemplateName = this.data.bpTemplateName
      API = 'api/BpCompile/commit'
      this.request(API, data)
    } else {
      this.setData({
        message: '请将信息填写完整'
      })
      this.dialog.showDialog()
    }
  },

  /**
   * 数据请求
   */
  request: function (API, data) {
    var self = this
    self.setData({
      loading: true
    })
    getStorage({
      key: 'accessToken'
    })
      .then(val => {
        wxRequest({
          url: `${url}${API}`,
          method: 'POST',
          header: {
            "access-token": val.data
          },
          data: data
        })
          .then(val => {
            console.log(val)
            self.setData({
              loading: false
            })
            if (val.data && val.data.code === 0) {
              wx.navigateTo({
                url: `/pages/common/success/success`
              })
            } else {
              self.setData({
                message: val.data.msg || '服务器请求出错了'
              })
              self.dialog.showDialog()
            }
          })
          .catch(err => {
            console.log(err)
            self.setData({
              loading: false
            })
            self.setData({
              message: '服务器请求出错了'
            })
            self.dialog.showDialog()
          })
      })
      .catch(err => {
        console.log(err)
      })
  }
})