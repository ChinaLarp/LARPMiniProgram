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

  preview: function (e) {
    wx.previewImage({
      urls: ['https://chinabackend.bestlarp.com/pic/background.png'],
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
  entercreatedgame: function (e) {
    wx.navigateTo({
      url: '../create/create?tableid=' + this.data.createdtable
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
        url: larp.backendurl + '?type=game&select=id&select=_id&select=name&select=category&select=descripion&select=iconurl',
        success: function (res) {
          that.setData({
            gamelist: res.data
          })
          wx.hideToast()
        },
      });
      wx.request({
        url: larp.backendurl + '?type=table&select=tableid&select=gameid&hostid=' + app.globalData.unionid,
        success: function (res) {
          if (res.data.length != 0) {
            console.log("game exists")
            that.setData({
              createdgame:res.data[0].gameid,
              createdtable: res.data[0].tableid
            })
            wx.setStorage({
              key: "createdgame",
              data: res.data[0].gameid
            });
            wx.setStorage({
              key: "createdtable",
              data: res.data[0].tableid
            });
            wx.showModal({
              title: '已创建房间',
              content: '您有已创建的房间，是否直接进入创建页面？',
              confirmText: '进入',
              cancelText: '暂不进入',
              success: function (res) {
                console.log(res)
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../create/create?tableid=' + that.data.createdtable
                  })
                } else if (res.cancel) {
                }
              }
            })
          }
        }
      })
      /*
      wx.request({
        url: larp.backendurl + '?type=user&usernickname=' + app.globalData.unionid,
        success: function (res) {
        }
      })*/
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