var larp = require('../../utils/util.js')
var md5 = require('../../utils/md5.js')
const app = getApp()
Page({
  data: {
    background: ['green', 'red', 'yellow'],
    gameinfo: null,
    characterlist: null,
    purchased:null
  },
  unlock:function(){
    wx.request({
      method: "POST",
      data: {
        openid: app.globalData.unionid
      },
      url: 'https://chinabackend.bestlarp.com/unifiedorder',
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
  create: function () {
    let that = this
    wx.showLoading({
      title: '正在创建房间',
    })
    wx.request({
      url: larp.backendurl + '?type=table&hostid=' + app.globalData.unionid,
      success: function (res) {
        var table
        for (table in res.data) {
          wx.request({
            url: larp.backendurl + '/' + res.data[table]._id,
            data: { signature: md5.hexMD5(res.data[table]._id + "xiaomaomi") },
            method: 'DELETE'
          })
          wx.request({
            url: larp.backendurl + '?type=user&tableid=' + res.data[table].tableid,
            success: function (res) {
              var player
              wx.request({
                url: larp.backendurl + '/' + res.data[player]._id,
                data: { signature: md5.hexMD5(res.data[player]._id + "xiaomaomi") },
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
            data: { signature: md5.hexMD5(res.data[user]._id + "xiaomaomi") },
            method: 'DELETE',
            success: function (res) {
            }
          })
        }
      }
    })
    wx.navigateTo({
      url: '../create/create?gameid=' + this.data.gameinfo.id
    })
    wx.hideLoading()

  },
  onLoad: function (options) {
    let that = this
    if (options.gameid) {
      wx.request({
        url: 'https://chinabackend.bestlarp.com/api/app?type=game&id=' + options.gameid + '&select=name descripion detailDescription femalenumber malenumber price id coverurl',
        success: function (res) {
          if (res.data.length != 0) {
            that.setData({
              gameinfo: res.data[0],
            })
          }
        }
      })
      wx.request({
        url: 'https://chinabackend.bestlarp.com/api/app?type=character&gameid=' + options.gameid + '&select=charactername characterdescription charactersex',
        success: function (res) {
          if (res.data.length != 0) {
            that.setData({
              characterlist: res.data,
            })
          }
        }
      })
      wx.request({
        url: 'https://chinabackend.bestlarp.com/api/app?type=openid&select=purchase&id=' + app.globalData.unionid ,
        success: function (res) {
          if (res.data.length != 0) {
            console.log(res.data[0].purchase.indexOf(options.gameid) > -1)
            that.setData({
              purchased: (res.data[0].purchase.indexOf(options.gameid)>-1),
            })
          }
        }
      })
    }
  },

  onShow: function (e) {

  }
})
