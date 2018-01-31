var md5 = require('utils/md5.js')//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    /*var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)*/
    var appid ="wxf0487d45228f02d3"
    var secret = "5cfc70f62660d126e14478a3db41d578"
    // 登录
    let that = this
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res)
        wx.request({
          url: 'https://chinabackend.bestlarp.com/unionid?appid=' + appid + '&secret=' + secret+'&js_code='+res.code+'&grant_type=authorization_code',
          success:function(res){
            console.log("unionid:" +res.data)
            that.globalData.unionid = res.data
          },
        })
      }
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (true) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
            }
          })
        }
      },
      fail: res => {
        console.log("failed")
      }
    })
  },
  globalData: {
    userInfo: null
  }
})