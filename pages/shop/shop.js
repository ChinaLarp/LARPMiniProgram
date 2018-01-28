var larp = require('../../utils/util.js')
var md5 = require('../../utils/md5.js')
const app = getApp()
Page({
  data: {
    background: ['1' ,'2', '3'],
    gamelist:[],
    currentgame:{}
  },
  onPullDownRefresh: function () {
    console.log('onPullDownRefresh');
    this.onShow()
    wx.stopPullDownRefresh()
  },
  navigate: function (e) {
    wx.showToast({ title: '敬请期待', icon: 'loading', duration: 1000 });
  },
  introduction: function (e) {
    wx.navigateTo({
      url: '../game/game?gameid=' + this.data.gamelist[e.currentTarget.id]._id
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
          console.log(res.data)
          if (res.data.length != 0) {
            wx.navigateTo({
              url: '../create/create?tableid=' + res.data[0].tableid
            })
          } else {
            wx.request({
              url: larp.backendurl + '?type=game&select=id _id name category descripion iconurl',
              success: function (res) {
                that.setData({
                  gamelist: res.data
                })
                wx.hideLoading()
              },
            });
          }
        }
      })

    }
  },
  onShow: function (e) {
    let that = this
    wx.showLoading({
      title: '获取游戏列表',
    })
    this.waitglobal()
  }
})