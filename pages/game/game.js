Page({
  data: {
    background: ['green', 'red', 'yellow'],
    gameinfo: null,
  },
  purchase:function(){
  wx.request({
    method: "POST",
    data: {
      openid: res.data
    },
    url: 'http://localhost:8089/unifiedorder',
    success: function (res) {
      console.log(res.data.xml.prepay_id)
      wx.requestPayment(
        {
          'timeStamp': '1490840662',
          'nonceStr': '123',
          'package': 'prepay_id=' + res.data.xml.prepay_id,
          'signType': 'MD5',
          'paySign': md5.hexMD5("appId=wxf0487d45228f02d3&nonceStr=123&package=prepay_id=" + res.data.xml.prepay_id + "&signType=MD5&timeStamp=1490840662&key=6e11af317a7a85a14b3387d5c6c71d3a").toUpperCase(),
          'success': function (res) { console.log("success") },
          'fail': function (res) { console.log("failed") },
          'complete': function (res) { console.log("complete") }
        })
    }
  })
  },
  onLoad: function (options) {
    let that = this
    if (options.gameid) {
      wx.request({
        url: 'https://chinabackend.bestlarp.com/api/app/' + options.gameid,
        success: function (res) {
          if (res.data.length != 0) {
            that.setData({
              gameinfo: res.data,
            })
          }
        }
      })
    }
  },

  onShow: function (e) {

  }
})
