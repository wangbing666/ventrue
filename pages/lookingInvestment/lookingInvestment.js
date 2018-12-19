// pages/lookingInvestment/lookingInvestment.js
var app = getApp()
var wxRequest = app.globalData.wxRequest
var url = app.globalData.url
var get401 = app.globalData.get401
Page({

  /**
   * 页面的初始数据
   */
  data: {
    city: ['北京', '上海', '广州', '深圳', '杭州', '天津', '重庆', '苏州', '武汉', '成都', '南京', '青岛', '长沙', '无锡', '宁波', '大连', '郑州', '沈阳', '西安', '厦门'],
    field: [ '金融', '体育', '旅游', '教育', '游戏', '物流', '电商', '硬件', '社交', '新媒体', '房地产', '智能家居', '物联网', '大数据', '新农业', '企业服务', '人工智能', '消费升级', '广告营销', '医疗健康', '文化娱乐', '汽车交通', '工具软件', '本地生活', '知识付费', '新零售', '区块链', '共享经济', 'AR/VR', '社会公益', '其他'],
    classification: [
      { label: "企业服务", imgUrl: '/image/lookingInvestment/3.2qiyefuwu.png', bg:'#f95f47'},
      { label: "消费升级", imgUrl: '/image/lookingInvestment/3.3xiaofei.png', bg: '#ffa252'},
      { label: "文化娱乐", imgUrl: '/image/lookingInvestment/3.4wenhuayule.png', bg:'#c9d545'},
      { label: "人工智能", imgUrl: '/image/lookingInvestment/3.5rengongzhineng.png', bg: '#65c6f8' },
      { label: "电子商务", imgUrl: '/image/lookingInvestment/3.6dianshang.png', bg: '#fca035'},
      { label: "物联网", imgUrl: '/image/lookingInvestment/3.7wulianwang.png', bg: '#52b8ef' },
      { label: "金融", imgUrl: '/image/lookingInvestment/3.8jinrong.png', bg: '#f58b77' }
    ],
    cityIndex: '',
    fieldIndex: '',
    page: 1,
    search: true
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
  onShow: function () {
    this.getToken()
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
          app.globalData.wxLogin(that.getInvestmentList, that)
        } else {
          that.setData({
            accessToken: res.data
          })
          that.getInvestmentList()
        }
      },
      fail: function (res) {
        app.globalData.wxLogin(that.getInvestmentList, that)
      }
    })
  },

  /**
  * 加载数据
  */
  getInvestmentList: function () {
    let that = this
    wxRequest({
      url: `${url}/api/investor/getInvestors?page=0&size=20`,
      header: {
        "access-token": that.data.accessToken
      }
    }).then(val => {
      wx.stopPullDownRefresh()
      if (val.data.code == 0) {
        that.setData({
          totalPages: val.data.data.totalPages,
          investmentList: val.data.data.content
        })
      } else {
        console.log(that)
        get401(val, that.getInvestmentList, that)
      }
    }).catch(err => {
      that.setData({
        message: '服务器请求出错了'
      })
      that.dialog.showDialog()
    })
  },

  /**
  * 搜索数据
  */
  searchInvestmentList: function (data) {
    let that = this
    wxRequest({
      url: `${url}/api/investor/searchInvestors?page=0&size=20&content=${data.content}&city=${data.city}&investmentField=${data.investmentField}`,
      header: {
        "access-token": that.data.accessToken
      }
    }).then(val => {
      wx.stopPullDownRefresh()
      if (val.data.code == 0) {
        that.setData({
          totalPages: val.data.data.totalPages,
          investmentList: val.data.data.content
        })
      } else {
        get401(val, that.searchInvestmentList, that, data)
      }
    }).catch(err => {
      that.setData({
        message: '服务器请求出错了'
      })
      that.dialog.showDialog()
    })
  },

  /**
   * 关注接口请求
   */
  getFocus: function (data) {
    let that = this
    wxRequest({
      url: `${url}api/investor/focusOrCancelFocusInvestor?investorId=${data.id}&status=${data.status}`,
      header: {
        "access-token": that.data.accessToken
      }
    }).then(val => {
      wx.stopPullDownRefresh()
      if (val.data.code == 0) {
        if (data.status == 1) {
          that.setData({
            message: '关注成功'
          })
        } else {
          that.setData({
            message: '取消关注成功'
          })
        }
        that.getInvestmentList()
        that.dialog.showDialog()
      } else {
        get401(val, that.getFocus, that, data)
      }
    }).catch(err => {
      that.setData({
        message: '服务器请求出错了'
      })
      that.dialog.showDialog()
    })
  },

  /**
   * 页面到底加载更多
   */
  onReachBottom: function () {
    const that = this
    if (that.data.page < that.data.totalPages) {
      wxRequest({
        url: `${url}/api/investor/getInvestors?page=${that.data.page}&size=20`,
        header: {
          "access-token": that.data.accessToken
        }
      }).then(val => {
        if (val.data.code == 0) {
          var investmentContent = that.data.investmentList
          val.data.data.content.forEach(value => {
            investmentContent.push(value)
          })
          that.setData({
            investmentList: investmentContent
          })
        } else {
          get401(val, that.loadMore, that)
        }
      })
      that.setData({
        page: ++that.data.page
      })
    }
  },

  /**
  * 地区选择
  */
  bindPickerCity: function (e) {
    this.setData({
      cityIndex: e.detail.value
    })
    let data = {}
    data.content = this.data.searchValue
    let cityIndex = this.data.cityIndex
    let fieldIndex = this.data.fieldIndex
    data.city = this.data.city[cityIndex]
    data.investmentField = this.data.field[fieldIndex]
    this.searchInvestmentList(data)
  },

  /**
   * 领域选择
   */
  bindPickerField: function (e) {
    this.setData({
      fieldIndex: e.detail.value
    })
    let data = {}
    data.content = this.data.searchValue
    let cityIndex = this.data.cityIndex
    let fieldIndex = this.data.fieldIndex
    data.city = this.data.field[cityIndex]
    data.investmentField = this.data.field[fieldIndex]
    this.searchInvestmentList(data)
  },

  /**
   * 关注事件
   */
  bindFocus: function (e) {
    let data = {}
    data.id = e.currentTarget.dataset.id
    data.status = e.currentTarget.dataset.status
    if (data.status == '1') {
      this.getFocus(data)
    } else {
      this.getFocus(data)
    }
  },

  /**
   * 获取输入值
   */
  searchInput: function (e) {
    this.setData({
      searchValue: e.detail.value
    })
  },
  
  /**
   * 搜索
   */
  search: function () {
    let data = {}
    data.content = this.data.searchValue
    let cityIndex = this.data.cityIndex
    let fieldIndex = this.data.fieldIndex
    data.city = this.data.field[cityIndex]
    data.investmentField = this.data.field[fieldIndex]    
    if (data.content) {
      this.searchInvestmentList(data)
    } else {
      this.getInvestmentList()
    }
  },

  /**
   * 提问
   */
  bindQuestions: function (e) {
    let value = e.currentTarget.dataset.value
    wx.navigateTo({
      url: `/pages/lookingInvestment/askQuestions/askQuestions?name=${value.name}.${value.city}&price=${value.questionUnitPrice}&id=${value.id}`,
    })
  },

  /**
   * 约见
   */
  bindAppointment: function (e) {
    let value = e.currentTarget.dataset.value
    app.appointment = value
    wx.navigateTo({
      url: '/pages/lookingInvestment/appoint/appoint',
    })
  },

  /**
   * 跳转到分类
   */
  bindClassification: function (e) {
    let value = e.currentTarget.dataset.value
    wx.navigateTo({
      url: `/pages/lookingInvestment/classification/classification?field=${value}`,
    })
  },

  /**
   * 更多分类
   */
  bindMore: function (e) {
    let value = this.data.field[e.detail.value]
    wx.navigateTo({
      url: `/pages/lookingInvestment/classification/classification?field=${value}`,
    })
  },

  /**
   * 投资人详情
   */
  investmentDetail: function (e) {
    let value = e.currentTarget.dataset.value
    wx.navigateTo({
      url: `/pages/lookingInvestment/InvestmentDetail/InvestmentDetail?id=${value.id}&focus=${value.focus}`,
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getInvestmentList()
  },

  /**
   * 页面相关事件处理函数--页面隐藏
   */
  onHide: function () {
    this.setData({
      cityIndex: '',
      fieldIndex: '',
      page: 1
    })
  },

  /**
   * 搜索框失去焦点图标显示
   */
  focusInput: function () {
    this.setData({
      search: false
    })
  },
   /**
   * 搜索框失去焦点图标显示
   */
  blurInput: function () {
    this.setData({
      search: true
    })
  }
})