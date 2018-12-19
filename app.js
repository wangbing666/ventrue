//app.js
var util = require("utils/util.js")
var getStorageInfo = util.getStorageInfo
var getUserInfo = util.getUserInfo
var mpToken = util.mpToken
var wxLogin = util.wxLogin 
var wxRequest = util.wxRequest
var get401 = util.get401
App({
  onLaunch: function (options) {
    if (options.scene == 1048) {
      wx.redirectTo({
        url:'/pages/cardDetail/cardDetail'
      })
    }
    //调用API从本地缓存中获取数据
    Date.prototype.format = function(fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }
    // getStorageInfo({
    //   key:'accessToken'
    // }).then(res => {
    //   console.log(res.data)
    // }).catch(res => {
    //   // wxLogin()
    // })
    // wx.checkSession({
    //   success: function(){

    //     //session 未过期，并且在本生命周期一直有效
    //   },
    //   fail: function(){
    //     //登录态过期
    //     wxLogin() //重新登录
    //   }
    // })
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  getValidCode: function(mobile) {
    const that = this
    wx.showLoading({
      title: '正在发送...',
      mask: true
    })
    wxRequest({
      url: `${that.globalData.url}/api/validator/sendCode`,
      data:{
        mobile: mobile
      },
    })
    .then(val=>{
      console.log(val.data)
      if (val.data.data) {
        wx.hideLoading()
        wx.showToast({
          title: '发送成功',
          icon: 'success',
          duration: 1500
        })
      }else {
        wx.hideLoading()
        wx.showToast({
          title: '发送失败',
          icon: 'success',
          duration: 1500
        })
      }
    })
  },
  validCode: function(mobile,code) {
    const that = this
    return wxRequest({
      url: `${that.globalData.url}/api/validator/validate`,
      data: {
        "mobile": mobile,
        "code": code
      },
      method:'POST',
      header: {
        "content-type": "application/x-www-form-urlencoded",
      }
    })
  },
  globalData:{
    userInfo:null,
    url: 'https://list.luyanquna.com/venture-test/',
    mpToken: mpToken,
    wxLogin: wxLogin,
    wxRequest: wxRequest,
    util: util,
    get401: get401,
    getStorage: getStorageInfo,
  }
})