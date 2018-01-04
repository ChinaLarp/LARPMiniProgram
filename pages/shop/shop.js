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
    
    //wx.navigateTo({
      //url: '../shop/category/' + e.target.id,
    //})
  },
  introduction: function (e) {
    let that = this
    wx.request({
      url: larp.backendurl+ '?type=game&id=' + e.target.id,
      success: function (res) {
        var gameid = res.data[0].id
        var content = '游戏名称：' + res.data[0].name + '； 游戏人数：' + res.data[0].playernumber + '； 最少男性人数：' + res.data[0].malenumber + '； 最少女性人数：' + res.data[0].femalenumber + '； 游戏简介：' + res.data[0].descripion
        wx.showModal({
          title: '详细介绍',
          content: content,
          confirmText:'创建',
          success: function (res) {
            if (res.confirm) {
              wx.showLoading({
                title: '正在创建房间',
              })
              wx.request({
                url: larp.backendurl + '?type=table&hostid=' + app.globalData.unionid,
                success: function(res){
                  var table
                  for (table in res.data) {
                    wx.request({
                      url: larp.backendurl + '/' + res.data[table]._id,
                      method: 'DELETE'
                    })
                    wx.request({
                      url: larp.backendurl + '?type=user&tableid=' + res.data[table].tableid,
                      success: function (res) {
                        var player
                        wx.request({
                          url: larp.backendurl + '/' + res.data[player]._id,
                          method: 'DELETE'
                        })
                        }
                    })
                  }
                }
              })
              wx.request({
                url: larp.backendurl + '?type=user&usernickname=' + app.globalData.unionid,
                success: function (res) {
                  var user
                  for (user in res.data) {
                    wx.request({
                      url: larp.backendurl + '/' + res.data[user]._id,
                      method: 'DELETE',
                      success: function (res) {
                      }
                    })
                  }
                }
              })
              wx.navigateTo({
                url: '../create/create?gameid=' + gameid
              })
              wx.hideLoading()
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    });
    
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
              url: larp.backendurl + '?type=game&select=id&select=name&select=category&select=descripion&select=iconurl',
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