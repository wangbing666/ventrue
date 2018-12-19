// pages/my/questionHome/questionDetail/questionDetail.js
var audit = require('../../../../common/lib/audio.js')
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var get401 = app.globalData.get401
const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()
var playTimeInterval
var recordTimeInterval
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recording: false,
    playing: false,
    hasRecord: false,
    recordTime: 0,
    playTime: 0,
    formatedRecordTime: '00',
    formatedPlayTime: '00',
    audio: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
    this.setData({
      questionDetail: app.globalquestionDetail
    })
    this.getToken()
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
          app.globalData.wxLogin(that.examineQuestion, that)
        } else {
          that.setData({
            accessToken: res.data
          })
          that.examineQuestion()
        }
      },
      fail: function (res) {
        app.globalData.wxLogin(that.examineQuestion, that)
      }
    })
  },

  /**
 * 查看问题
 */
  examineQuestion: function () {
    let that = this
    wxRequest({
      url: `${url}api/question/look?questionId=${that.data.questionDetail.id}`,
      header: {
        "access-token": that.data.accessToken
      }
    }).then(val => {
      if (val.data.code == 0) {
        console.log(val.data.data)
        that.setData({
          questionList: val.data.data.contents
        })
      } else {
        get401(val, that.examineQuestion, that)
      }
    }).catch(err => {
      console.log(err)
    })
  },

   /**
   * 语音播放
   */
  audioPlay: function (e) {
    let audio = e.currentTarget.dataset.value
    console.log(audio.message)
    innerAudioContext.autoplay = true
    innerAudioContext.src = audio.message
    innerAudioContext.play()
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })

    innerAudioContext.onEnded((res) => {
      innerAudioContext.stop()
    })

    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },

   /**
   * 开始录音
   */
  startRecord: function () {
    var that = this

    recorderManager.onStart(() => { // 录音开始事件
      console.log('recorder start')
      that.setData({ recording: true, audio: false })
      recordTimeInterval = setInterval(function () {
        var recordTime = that.data.recordTime += 1
        that.setData({
          formatedRecordTime: audit.formatTime(that.data.recordTime),
          recordTime: recordTime,
        })
      }, 1000)
    })

    recorderManager.onError((err) => { //录音错误事件, 会回调错误信息
      console.log(err)
    })
    
    const options = {
      duration: 60000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'aac',
      frameSize: 50
    }
    recorderManager.start(options)
  },

  /**
   * 停止录音
   */
  stopRecord: function () {
    let that = this
    recorderManager.stop()
    recorderManager.onStop((res) => {
      console.log('recorder stop', res)
      that.setData({
        hasRecord: true,
        recording: false,
        tempFilePath: res.tempFilePath,
        formatedPlayTime: audit.formatTime(that.data.playTime)
      })
      clearInterval(recordTimeInterval)
    })
  },

  /**
   * 播放录音
   */
  playVoice: function () {
    var that = this
    playTimeInterval = setInterval(function () {
      var playTime = that.data.playTime + 1
      that.setData({
        playing: true,
        formatedPlayTime: audit.formatTime(playTime),
        playTime: playTime
      })
    }, 1000)
    innerAudioContext.autoplay = true
    innerAudioContext.src = that.data.tempFilePath
    console.log(that.data.tempFilePath)
    innerAudioContext.play()
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })

    innerAudioContext.onEnded((res) => {
      console.log('自动停止')
      clearInterval(playTimeInterval)
      innerAudioContext.stop()
      that.setData({
        playing: false,
        formatedPlayTime: "00",
        playTime: 0
      })
    })

    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },

  /**
   * 停止播放
   */
  stopVoice: function () {
    let that = this
    clearInterval(playTimeInterval)
    innerAudioContext.stop()
    innerAudioContext.onStop(() => { // 停止播放
      that.setData({
        playing: false,
        formatedPlayTime: "00",
        playTime: 0
      })
    })
  },

  /**
   * 清除录音
   */
  clear: function () {
    clearInterval(playTimeInterval)
    this.stopVoice()
    this.setData({
      playing: false,
      hasRecord: false,
      tempFilePath: '',
      formatedRecordTime: audit.formatTime(0),
      recordTime: 0,
      playTime: 0
    })
  },

  /**
   * 新增录音
   */
  addAnswer: function () {
    this.setData({
      addAnswer: true
    })
  },

  /**
   * 确认或取消发送
   * 
   */
  submitAudio: function () {
    let that = this
    wx.showModal({
      content: "为防手滑误点，请确认录音满意后再发送",
      confirmText: "确认发送",
      cancelText: "检查一下",
      cancelColor: '#ccc',
      confirmColor: "#f97663",
      success: function (res) {
        if (res.confirm) {
          that.uploadAudio()
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 上传语音
   * 上传成功后请求回答问题接口
   */
  uploadAudio: function () {
    var that = this
    wx.uploadFile({
      url: `${url}api/file/upload`, //仅为示例，非真实的接口地址
      filePath: that.data.tempFilePath,
      name: 'file',
      success: function (val) {
        console.log(val)
        console.log(that.data.tempFilePath)
        var data = JSON.parse(val.data)
        if (data.code == 0) {
          wx.showToast({
            title: '上传成功',
            icon: 'success',
            duration: 1000
          })
          console.log(data)
          that.setData({
            message: data.data.url
          })
          // 判断是重新录音还是直接回答，分别调用不同的接口
          if (that.data.again) {
            that.anewAnswer(that.data.questionContentId)
          } else {
            that.questionReply()
          }
        } else {
          wx.showToast({
            title: '上传失败',
            duration: 1000
          })
        }
      },
      fail: function (err) {
        console.log(err)
        wx.showToast({
          title: '上传失败',
          duration: 1000
        })
      }
    })
  },

  /**
   * 回答问题
   */
  questionReply: function () {
    let data = {
      length: this.data.formatedRecordTime,
      message: this.data.message,
      messageType: 2,
      openness: this.data.questionDetail.openness,
      type: 0
    }
    let that = this
    wxRequest({
      url: `${url}api/question/reply?questionId=${that.data.questionDetail.id}`,
      header: {
        "access-token": that.data.accessToken
      },
      data: data,
      method: 'POST'
    }).then(val => {
      if (val.data.code == 0) {
        that.setData({
          message: '回答成功！',
          addAnswer: false
        })
        that.dialog.showDialog()
        that.clear()
        that.examineQuestion()
      } else {
        get401(val, that.questionReply, that)
      }
    }).catch(err => {
      console.log(err)
    })
  },

   /**
   * 拒绝回答
   */
  refusedAnswer: function () {
    let that = this
    console.log(this.data.questionDetail)
    wxRequest({
      url: `${url}api/question/relation/refuse`,
      header: {
        "access-token": that.data.accessToken,
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {questionId: this.data.questionDetail.id},
      method: 'POST'
    }).then(val => {
      if (val.data.code == 0) {
        that.setData({
          message: '拒绝成功！',
          refuse: true
        })
        that.dialog.showDialog()
        that.examineQuestion()
      } else {
        get401(val, that.refusedAnswer, that)
      }
    }).catch(err => {
      console.log(err)
    })
  },

  /**
   * 重新回答弹框
   */
  anewAnswerModal: function (e) {
    let that = this
    let value = e.currentTarget.dataset.value
    wx.showModal({
      content: "回答后1小时内，可重新录制一条语音，替换现有回答？",
      confirmText: "重答",
      cancelText: "不用了",
      cancelColor: '#ccc',
      confirmColor: "#f97663",
      success: function (res) {
        if (res.confirm) {
          that.setData({
            addAnswer: true,
            again: true,
            questionContentId: value.id
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

   /**
   * 重新回答
   */
  anewAnswer: function (id) {
    let data = {
      message: this.data.message,
      messageType: 2,
      contentType: 1,
      questionContentId: id
    }
    let that = this
    wxRequest({
      url: `${url}api/question/relation/update?length=${that.data.formatedRecordTime}`,
      header: {
        "access-token": that.data.accessToken,
        "content-type": "application/x-www-form-urlencoded"
      },
      data: data,
      method: 'POST'
    }).then(val => {
      if (val.data.code == 0) {
        that.setData({
          message: '回答成功！',
          addAnswer: false,
          again: false
        })
        that.dialog.showDialog()
        that.clear()
        that.examineQuestion()
      } else {
        get401(val, that.anewAnswer, that)
      }
    }).catch(err => {
      console.log(err)
    })
  },
  /**
   * 页面隐藏后销毁
   */
  onUnload: function () {
    console.log('页面卸载')
    this.stopVoice()
    this.stopRecord()
  }
})