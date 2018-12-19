Page({
	data: {
		count: 60
	},
	savePhoneNumber: function (e) {
	  console.log(e.detail.value)
	  let isPassed = this.validPhoneNumber(e.detail.value)
	  this.setData({
	    phoneNumber: e.detail.value,
	    isPassed: isPassed
	  });
	},
	validPhoneNumber: function(num) {
    var myreg = /^1[34578][0-9]{9}$/; 
		if(!myreg.test(num)) return false
			return true
	},
	getValidCode: function() {
		const that = this
		if (that.data.phoneNumber && that.data.isPassed && that.data.count == 60){
			that.tick()
		}
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
	saveValidCode: function(e){
		var code = e.detail.value
		if (code) {
			this.setData({
				code: code,
				isValid: true
			})
		}
	},
})