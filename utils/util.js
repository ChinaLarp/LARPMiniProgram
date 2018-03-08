const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
var backendurl ='https://chinabackend.bestlarp.com/api/app'
var backendbaseurl = 'https://chinabackend.bestlarp.com'
var socketsend=function(that,message){
  var senddata = JSON.stringify({
    table_id: that.data.table_id, message: message
  })
  console.log(senddata)
  wx.sendSocketMessage({
    data: senddata,
  })
}
var socketsendData = function (that, message, content) {
  var senddata = JSON.stringify({
    table_id: that.data.table_id, tableid: that.data.tableid, characterid: that.data.characterid, message: message, content: content
  })
  console.log(senddata)
  wx.sendSocketMessage({
    data: senddata,
  })
}
var socketping = function (that, message) {
  var senddata = JSON.stringify({
    message: "ping"
  })
  //console.log(senddata)
  wx.sendSocketMessage({
    data: senddata,
  })
}
var databackup = function (that) {
  wx.request({
    url: backendurl + '/' + that.data.user_id,
    data: {
      acquiredclue: that.data.acquiredclue,
      broadcast: that.data.broadcast,
      vote: that.data.vote,
      actionpoint: that.data.actionpoint
    },
    method: "PUT",
    success: function (res) {
      console.log("data backup succeeded")
    },
  });
}
var cleardata = function () {
  console.log("clear data and back to home.")
  wx.removeStorage({
    key: 'tableid'
  })
  wx.removeStorage({
    key: 'gameid'
  })
  wx.removeStorage({
    key: 'characterid'
  })
  wx.removeStorage({
    key: 'user_id'
  })
  wx.removeStorage({
    key: 'table_id'
  })
  wx.reLaunch({
    url: '../shop/shop'
  })
}
var socketwork = function (res) {
  console.log("socketwork")
  var recieved = JSON.parse(res.data)
  if (recieved.table_id == that.data.table_id) {

    if (recieved.message == "refresh" || recieved.message == "join") {
      //wx.showToast({ title: '信息更新', icon: 'loading', duration: 200 });
      var content = ''
      var cast
      wx.request({
        url: larp.backendurl + '/' + that.data.table_id,
        success: function (res) {
          that.setData({
            roundnumber: res.data.roundnumber,
            updatetab: [true, true, true, true, true, true]
          })
        },
      })
      wx.request({
        url: larp.backendurl + '?type=user&tableid=' + that.data.tableid,
        success: function (res) {
          console.log(res.data)
          that.setData({
            globalbroadcast: res.data
          })
        },
      })
    } else if (recieved.message == "setactionpoint") {
      wx.showToast({ title: '刷新行动点', icon: 'loading', duration: 1000 });
      wx.request({
        url: larp.backendurl + '/' + that.data.user_id,
        success: function (res) {
          console.log(res.data)
          that.setData({
            actionpoint: res.data.actionpoint
          })
        },
      })
    } else if (recieved.message == "sendclue") {
      if (recieved.user_id == that.data.user_id) {
        wx.showToast({ title: '收到线索', icon: 'loading', duration: 1000 });
        wx.request({
          url: larp.backendurl + '/' + that.data.user_id,
          success: function (res) {
            console.log(res.data)
            that.setData({
              acquiredclue: res.data.acquiredclue
            })
          },
        })
      }
    } else if (recieved.message == "revote") {
      wx.showToast({ title: '重新投票', icon: 'loading', duration: 1000 });
      wx.request({
        url: larp.backendurl + '/' + that.data.user_id,
        success: function (res) {
          console.log(res.data)
          that.setData({
            vote: res.data.vote
          })
        },
      })
    }
  }
}

var tableuserinfo = function(that){
  
}
module.exports = {
  formatTime: formatTime,
  socketsend: socketsend,
  socketsendData: socketsendData,
  socketping: socketping,
  databackup: databackup,
  backendurl: backendurl,
  backendbaseurl: backendbaseurl,
  cleardata: cleardata,
  socketwork: socketwork,
  tableuserinfo:tableuserinfo
}
