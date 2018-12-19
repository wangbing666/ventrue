// upload.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var mpToken = app.globalData.mpToken
Page({

  /**
   * 页面的初始数据
   */
  data: {
    notany: false,
    haveany:true,
    bps: [],
    checked: false,
    checkedBP: []
  },

  notAny: function () {
    const that = this
    that.setData({
      notany:true,
      haveany:false
    })
  },
  haveAny: function () {
    const that = this
    that.setData({
      notany: false,
      haveany:true
    })
  },
  delete: function(e) {
    let id = e.currentTarget.dataset.id
    const that = this
    var bps = that.data.bps
    wx.getStorage({
      key: 'accessToken',
      success: function(res) {
        var accessToken = res.data
        wx.request({
          url: `${url}/api/file/bp/delete`,
          method:'POST',
          header: {
            'access-token':accessToken
          },
          data:JSON.stringify([id]),
          success: function(res) {
            if(res.data.code == 0) {
              bps.forEach((item,index) => {
                if(item == id){
                  bps.splice(index,1)
                }
              })
              if(bps.length == 0 ) {
                wx.removeStorage({
                  key: 'bps',
                  success: function(res) {},
                })
              }
              that.setData({
                bps:bps
              })
            }
          }
        })
      },
    })
  },
  goUpload: function() {
    wx.navigateTo({
      url: '/pages/uploadHelp/uploadHelp',
    })
  },
  scan: function() {
    wx.scanCode({
      success: (res) => {
        console.log(res)
        wx.reLaunch({
          url: '/' + res.path
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    var  type = options.type
    if(typeof type != 'undefined'){
      that.setData({
        others: true
      })
    }
    wx.getStorage({
      key: 'bps',
      success: res => {
        if (typeof res.data != 'undefined') {
          var list = []
          var type = []
           res.data.forEach(item => {
             list.push(item.substring(item.lastIndexOf('/')+1))
             type.push(item.substring(item.lastIndexOf('.') + 1))
           })
          that.setData({
            bps: res.data,
            list: list,
            type: type
          })
        }
      }
    })
  },
  showDetail: function(e) {
    let url = e.currentTarget.dataset.id
    wx.downloadFile({
      url: url, //仅为示例，并非真实的资源
      success: function(res) {
        var file = res.tempFilePath
        wx.openDocument({
          filePath: file,
          success: function (res) {
            console.log('打开文档成功')
          },
          fail: err => {
            console.log(err)
          }
        })
      }
    })
  },

  /**
   * 选择文件
   */
  checkboxChange: function (e) {
    let urlList = e.detail.value
    this.setData({
      urlList: urlList
    })
  },

  /**
   * 确认选择
   */
  confirm: function () {
    let that = this
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面
    prevPage.setData({ //直接给上移页面赋值
      urlList: that.data.urlList
    });
    wx.navigateBack({
      delta: 1
    })
  }
})