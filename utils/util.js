var base64 = require('base64.js')
var mpToken = base64.base64encode('wx97346cb0dfdde678')
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
// 时间戳转日期
function getLocalTime(nS) {
  var date = new Date(nS),
      Y = date.getFullYear() + '-',
      M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-',
      D = date.getDate() + ' '
  return Y + M + D
}
function wxPromisify(fn) {  
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }
      obj.fail = function (res) {
        reject(res)
      }
      fn(obj)
    })
  }
}
function login(){
  return new Promise((resolve,reject)=>{
    wx.login({
      success: resolve,
      fail: reject
    })
  })
}
function getUserInfo() {
  return new Promise((resolve,reject)=> {
    wx.getUserInfo({
      success: function(res) {
        resolve(res)
      },
      fail: function(err) {
        reject(err)
      }
    })
  })
}
function getAccessToken(code) {
  return new Promise((resolve,reject)=> {
    wx.request({
      url: 'https://list.luyanquna.com/venture-test/api/user/getAccessToken',
      data: {
          'code': code
      },
      header: {
          'Accept': 'application/json',
          'mp-token': mpToken
      },
      success: function(value) {
        resolve(value)
      },
      fail: function(err) {
        reject(err)
      }
    })
  })
}
function validAccessToken(encryptedData,iv,accessToken) {
  return new Promise((resolve,reject)=> {
    wx.request({
      url: 'https://list.luyanquna.com/venture-test/api/user/encode',
      data: {
          'encryptedData': encryptedData,
          'iv': iv
      },
      header: {
          'Accept': 'application/json',
          'access-token': accessToken
      },
      success: function(val) {
        resolve(val)
      },
      fail: function(err) {
        reject(err)
      }
    })
  })
}
function setStorage(accessToken) {
  return new Promise((resolve,reject) => {
    wx.setStorage({
      key: "accessToken", 
      data: accessToken,
      success: function(val) {
        resolve(val)
      },
      fail: function(err) {
        reject(err)
      }
    })
  })
}
var code,encryptedData,iv,accessToken = ''

/*function wxLogin(cb) {
  login().then(val => {
    code = val.code  
    return getUserInfo() 
    console.log(val)
  })
  .then(res => {
    console.log(res)
    wx.setStorage({
      key:'userInfo',
      data: res.userInfo
    })
    encryptedData = res.encryptedData
    iv = res.iv
    return getAccessToken(code)
  })
  .then( value => {
    console.log(value)
    accessToken = value.data.data.accessToken
    return validAccessToken(encryptedData,iv,accessToken)
  })
  .then(()=>{
    return setStorage(accessToken)
  })
  .then(()=> {
    console.log(cb)
    if (cb && typeof cb == 'function') {
      cb(accessToken)
    };
  })
}*/
function get401(val,func, that, options) {
  if (val.data.code == 401) {
    wxLogin(func, that, options)
  };
}
function wxLogin(cb, that, options) {
    if(typeof(cb) === 'undefined') {
      var cb = function(){
        console.log('this is a demo')
      }
    }
    var encryptedData = '';
    var iv = '';
    wx.login({
        success: function(res) {
            console.log("login...")
            var code = res.code
            console.log("code is " + code)
            console.log("mpToken is " + mpToken)
            let promise = new Promise(function(resolve,reject){
              wx.getUserInfo({
                  success: resolve
              })
            })
            promise.then(function(value){
              console.log('getUserInfo succ...')
              try {
                  wx.setStorageSync('iv', value.iv)
                  wx.setStorageSync('userInfo', value.userInfo)
                  wx.setStorageSync('encryptedData', value.encryptedData)
                  wx.setStorageSync('mpToken', mpToken)
              } catch (e) {    
                  console.log(e)
              }   
              encryptedData = value.encryptedData
              iv = value.iv 

            }).then(function(value) {
              wx.request({
                url: 'https://list.luyanquna.com/venture-test/api/user/getAccessToken',
                data: {
                    'code': code
                },
                header: {
                    'Accept': 'application/json',
                    'mp-token': mpToken
                },
                success: function(res) {
                  console.log("成功获取数据")
                  //console.log(res.data)
                  var a = res.data.data.accessToken
                  console.log(a)
                      //console.log('a'+a)
                      //typeof cb == "function" && cb(that.globalData.accessToken)
                  wx.request({
                    url: `https://list.luyanquna.com/venture-test/api/user/encode?encryptedData=${encryptedData}&iv=${iv}`,
                    method: 'POST',
                    header: {
                        'Accept': 'application/json',
                        'access-token': a
                    },
                    success: function(res) {
                      console.log(res.data)
                      var accessToken = res.data.data.accessToken
                      wx.setStorage({ 
                        key: "accessToken", 
                        data: accessToken,
                        success: function() {
                          that.setData({
                            accessToken: accessToken
                          })
                         cb(accessToken, options)
                        }
                      })
                    }
                  })
                }
              })
            }).catch(function(err) {
              console.log(err)
            })           
        }
    })  
}
 function splitStrToArray(str) {
  return str.split(';')
 }
 function validForm(obj) {
  if (obj.bcName && obj.bcMobile && obj.company && obj.post && obj.wxNumber) {
    if (obj.identity == 'entrepreneur' || obj.identity == 'space' || obj.identity == 'other') {
      return true
    }else if (obj.identity == 'investor' && obj.investmentStage.length > 0 && obj.investmentField.length > 0) {
      console.log(obj.investmentStage)
      return true
    }else if (obj.identity == 'post' && obj.serviceType.length > 0) {
      return true
    }
  }
  return false
}

var wxRequest = wxPromisify(wx.request)
var getStorageInfo = wxPromisify(wx.getStorage)
//var getUserInfo = wxPromisify(wx.getUserInfo)
function getStorageAccessToken () {
  return getStorage({
    key: 'accessToken'
  })
}
function modalInfo(msg) {
  wx.showModal({
    title:'',
    content:msg,
    showCancel: false,
    success:function(){

    }
  })
}
module.exports = {
  formatTime: formatTime,
  getLocalTime: getLocalTime,
  wxPromisify: wxPromisify,
  wxRequest: wxRequest,
  getStorageInfo: getStorageInfo,
  getUserInfo:getUserInfo,
  mpToken: mpToken,
  wxLogin: wxLogin,
  validForm: validForm,
  get401: get401,
  splitStrToArray: splitStrToArray,
  getStorageAccessToken: getStorageAccessToken
}