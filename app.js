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
            var unionid=res.data
            that.globalData.unionid = unionid
            wx.getUserInfo({
              success: res => {
                var userinfo = res.userInfo
                that.globalData.userInfo = userinfo
                wx.request({
                  url: 'https://chinabackend.bestlarp.com/api/app?select=_id&type=openid&id=' + unionid,
                  success: function (res) {
                    var real_id = res.data[0]._id
                    console.log("_id:" + res.data[0]._id)
                    wx.request({
                      url: 'https://chinabackend.bestlarp.com/api/app/' + res.data[0]._id,
                      method:'PUT',
                      data:{
                        name: userinfo.nickName + ";" + userinfo.gender + ";" + userinfo.country,
                        signature: md5.hexMD5(res.data[0]._id+"xiaomaomi")
                      },
                      success: function (res) {
                        console.log("update userinfo")
                      },
                    })
                    wx.getSystemInfo({
                      success: res => {
                        wx.request({
                          url: 'https://chinabackend.bestlarp.com/api/app/' + real_id,
                          method: 'PUT',
                          data: {
                            broadcast: res.brand + ";" + res.model + ";" + res.version + ";" + res.SDKVersion,
                            signature: md5.hexMD5(real_id + "xiaomaomi")
                          },
                          success: function (res) {
                            console.log("update sysinfo")
                          },
                        })
                        if (!res.SDKVersion){
                          wx.showModal({
                            title: '提示',
                            content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
                            showCancel: false,
                            success: function(res) {},
                            fail: function(res) {},
                            complete: function(res) {},
                          })
                        } else if (Number(res.SDKVersion.split(".")[1]) <5){
                          wx.showModal({
                            title: '版本更新',
                            content: '检测到您的微信不是最新版本， 这有可能导致一些功能不可用。建议先更新。',
                            showCancel: false,
                            success: function (res) { },
                            fail: function (res) { },
                            complete: function (res) { },
                          })
                        }
                      }
                    })
                  },
                })
              }
            })
            
          },
        })
      }
    })

    // 获取用户信息
    wx.getSystemInfo({
      success: res => {
        console.log(res)
      }
    })
  },
  globalData: {
    userInfo: null
  }
})