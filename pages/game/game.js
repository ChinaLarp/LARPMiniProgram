Page({
  data: {
    background: ['green', 'red', 'yellow'],
    gameinfo: null,
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
