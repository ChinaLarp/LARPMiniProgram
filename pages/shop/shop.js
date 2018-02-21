var larp = require('../../utils/util.js')
var md5 = require('../../utils/md5.js')
const app = getApp()
Page({
  data: {
    background: ['1' ,'2', '3'],
    display:0
  },
  introduction: function (e) {
    wx.navigateTo({
      url: '../game/game?gameid=' + this.data.gamelist[e.currentTarget.id].id
    })
  },
  gamelist: function (e) {
    this.setData({
      display: 0
    })
  }, 
  aboutus: function (e) {
    this.setData({
      display: 1
    })
  },
  waitglobal:function() {
    let that=this
    if(app.globalData.unionid==undefined) {
      console.log("waiting")
      setTimeout(function () { that.waitglobal() }, 1000);
    } else {
      //console.log(app.globalData.unionid)
      wx.request({
        url: larp.backendurl + '?type=table&hostid=' + app.globalData.unionid,
        success: function (res) {
          if (res.data.length != 0) {
            wx.navigateTo({
              url: '../create/create?tableid=' + res.data[0].tableid
            })
          } else {
            wx.request({
              url: larp.backendurl + '?type=game&select=id&select=_id&select=name&select=category&select=descripion&select=iconurl',
              success: function (res) {
                that.setData({
                  gamelist: res.data
                })
                wx.hideToast()
              },
            });
          }
        }
      })

    }
  },
  onShow: function (e) {
    let that = this
    wx.showToast({
      title: '获取游戏列表',
      icon:"loading"
    })
    this.waitglobal()
  }
})