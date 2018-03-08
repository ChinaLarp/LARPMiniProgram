//index.js
//获取应用实例
const app = getApp()
var larp = require('../../utils/util.js')
var md5 = require('../../utils/md5.js');
Page({
  data: {
    animationData: {},
    user_id: '',
    tableid: '',
    gameid: '',
    characterid: '',
    characterinfo: {},
    gameinfo: {},
    display: '0',
    acquiredclue: [],
    broadcast: [],
    vote: -1,
    voted: -1,
    voteresult: [],
    roundnumber: 0,
    // tab切换    
    currentTab: 0,
    hostname: '',
    usernickname: '',
    globalbroadcast: [],
    actionpoint: 0,
    cluestatus: [],
    currentclue: 0,
    picksend:null,
    touchtime: 0,
    plotopen: -1,
    infoopen: -1,
    instopen: -1,
    //图片放缩
    stv: {
      offsetX: 0,
      offsetY: 0,
      zoom: false, //是否缩放状态
      distance: 0,  //两指距离
      scale: 1,  //缩放倍数
    },
    seeimage:-1
  },
  diskindToggle: function (e) {
    wx.showToast({
      title: '还未进行到此回合',
      icon: 'loading'
    })
  },
  kindToggle: function (e) {
    if (this.data.plotopen == e.currentTarget.id) {
      this.setData({
        plotopen: -1
      });
    } else {
      this.setData({
        plotopen: e.currentTarget.id
      });
    }
  },
  infokindToggle: function (e) {
    if (this.data.infoopen == e.currentTarget.id) {
      this.setData({
        infoopen: -1
      });
    } else {
      this.setData({
        infoopen: e.currentTarget.id
      });
    }
  },
  instkindToggle: function (e) {
    if (this.data.instopen == e.currentTarget.id) {
      this.setData({
        instopen: -1
      });
    } else {
      this.setData({
        instopen: e.currentTarget.id
      });
    }
  },
  refresh: function (e) {
    let that = this
    if (that.data.table_id) {
      wx.showToast({
        title: '获取房间信息',
        icon: "loading"
      })
      wx.request({
        url: larp.backendurl + '/' + that.data.table_id,
        success: function (res) {
          wx.hideToast()
          if (res.statusCode == 404) {
            wx.showModal({
              title: '房间不存在',
              content: '房间不存在, 请从转发链接重新进入',
              showCancel: false,
              complete: function (res) {
                if (that.data.user_id) {
                  wx.request({
                    url: larp.backendurl + '/' + that.data.user_id,
                    method: 'DELETE',
                    data: {
                      signature: md5.hexMD5(that.data.user_id+"xiaomaomi")
                    },
                    success: function () {
                      console.log("deleted")
                    },
                  })
                }
              }
            })
            larp.cleardata()
          } else {
            that.setData({
              roundnumber: res.data.roundnumber,
              hostname: res.data.hostid,
              cluestatus: res.data.cluestatus
            })
          }
        }
      })
    }
    if (that.data.user_id) {
      wx.showToast({
        title: '获取玩家信息',
        icon: "loading"
      })
      wx.request({
        url: larp.backendurl + '/' + that.data.user_id,
        success: function (res) {
          that.setData({
            acquiredclue: res.data.acquiredclue,
            broadcast: res.data.broadcast,
            vote: res.data.vote,
            actionpoint: res.data.actionpoint
          })
          wx.hideToast()
        },
      });
    }
    if (!(that.data.user_id && that.data.table_id )) {
      larp.cleardata()
      wx.showModal({
        title: '数据过期',
        content: '数据过期, 请从转发链接重新进入',
        showCancel: false,
        complete: function (res) {
        }
      })
    }
  },
  swiperH: function (e) {
    //console.log(e);
    this.setData({
      currentTab: e.detail.current
    })
  },
  swiperV: function (e) {
    //console.log(e.detail.current);
    this.setData({
      currentclue: e.detail.current,
    })
  },


  touchstartCallback: function (e) {
    let that=this
    //触摸开始
    that.data.touchtime = e.timeStamp;
    console.log('touchstartCallback');
    console.log(e);
    //图片缩放
    if (e.touches.length === 1) {
      let { clientX, clientY } = e.touches[0];
      this.startX = clientX;
      this.startY = clientY;
      this.touchStartEvent = e.touches;
    } else {
      let xMove = e.touches[1].clientX - e.touches[0].clientX;
      let yMove = e.touches[1].clientY - e.touches[0].clientY;
      let distance = Math.sqrt(xMove * xMove + yMove * yMove);
      this.setData({
        'stv.distance': distance,
        'stv.zoom': true, //缩放状态
      })
    }

  },
  touchmoveCallback: function (e) {
    //触摸移动中
    //console.log('touchmoveCallback');
    //console.log(e);

    if (e.touches.length === 1) {
      //单指移动
      if (this.data.stv.zoom) {
        //缩放状态，不处理单指
        return;
      }
      let { clientX, clientY } = e.touches[0];
      let offsetX = clientX - this.startX;
      let offsetY = clientY - this.startY;
      this.startX = clientX;
      this.startY = clientY;
      let { stv } = this.data;
      stv.offsetX += offsetX;
      stv.offsetY += offsetY;
      stv.offsetLeftX = -stv.offsetX;
      stv.offsetLeftY = -stv.offsetLeftY;
      this.setData({
        stv: stv
      });

    } else {
      //双指缩放
      let xMove = e.touches[1].clientX - e.touches[0].clientX;
      let yMove = e.touches[1].clientY - e.touches[0].clientY;
      let distance = Math.sqrt(xMove * xMove + yMove * yMove);
      let distanceDiff = distance - this.data.stv.distance;
      let newScale = this.data.stv.scale + 0.005 * distanceDiff;
      this.setData({
        'stv.distance': distance,
        'stv.scale': newScale,
      })
    }
  },
  touchendCallback: function (e) {
    let that=this
    //触摸结束
    console.log('touchendCallback');
    console.log(e);
    if (e.touches.length === 0) {
      this.setData({
        'stv.zoom': false, //重置缩放状态
      })
      if(e.timeStamp - that.data.touchtime < 200){
        this.setData({
          seeimage: -1,
          stv: {
            offsetX: 0,
            offsetY: 0,
            zoom: false, //是否缩放状态
            distance: 0,  //两指距离
            scale: 1,  //缩放倍数
          }
          
        })
      }
    }
  },
  //sendClueTo
  sendclueto: function () {
    let that = this
    var tempacquiredclue =[]
    var tempuser_id
    if (this.data.characterid==this.data.picksend){
      wx.showModal({
        title: '发送失败',
        content: '线索不能发给自己。',
        showCancel:false
      })
      //wx.showToast({ title: '不能发给自己', icon: 'loading', duration: 1000 });
    } else if (this.data.acquiredclue[this.data.currentclue].cluenumber == -1){
      wx.showModal({
        title: '发送失败',
        content: '此线索已经被发送过。',
        showCancel: false
      })
      //wx.showToast({ title: '此线索已被发出', icon: 'loading', duration: 1000 });
    } else {
    //animation
    var animation = wx.createAnimation({
      duration: 600,
      timingFunction: 'ease-in',
    });
    var self = this;
    this.animation = animation;
    this.animation.matrix3d(0.4, 0, 0.00, 0, 0.00, 0.4, 0.00, 0, 0, 0, 1, 0, 0, 0, 0, 1).step();
    this.animation.matrix3d(0.05, 0, 0.00, 0.0001, 0.00, 0.05, 0.00, 0, 0, 0, 1, 0, 800, 0, 0, 1).step();
    this.setData({
      animationData: this.animation.export()
    });
    setTimeout(function () {
      wx.request({
        url: larp.backendurl + '?type=user&tableid=' + that.data.tableid + '&characterid=' + that.data.picksend,
        success: function (res) {
          if (res.data.length==0){
            wx.showToast({
              title: '角色不存在',
              image:"/images/warn.png" ,
              duration: 2000
            })
          }else{
            tempacquiredclue = res.data[0].acquiredclue
            tempuser_id = res.data[0]._id
            wx.request({
              url: larp.backendurl + '/' + tempuser_id,
              data: {
                acquiredclue: tempacquiredclue.concat(that.data.acquiredclue[that.data.currentclue]),
                signature: md5.hexMD5(tempuser_id + "xiaomaomi")
              },
              method: 'PUT',
              success: function (res) {
                console.log('send complete')
                var newacquiredclue = that.data.acquiredclue
                newacquiredclue[that.data.currentclue] = { "content": that.data.acquiredclue[that.data.currentclue].content + "(该线索已发送给" + that.data.gameinfo.characterlist[that.data.picksend].name + ")。", "cluenumber": -1, "cluelocation": that.data.acquiredclue[that.data.currentclue].cluelocation }
                that.setData({
                  acquiredclue: newacquiredclue
                })
                wx.sendSocketMessage({
                  data: JSON.stringify({
                    table_id: that.data.table_id, message: 'sendclue', user_id: tempuser_id
                  }),
                })
                wx.request({
                  url: larp.backendurl + '/' + that.data.user_id,
                  data: {
                    acquiredclue: that.data.acquiredclue,
                    signature: md5.hexMD5(that.data.user_id + "xiaomaomi")
                  },
                  method: "PUT",
                  success: function (res) {
                    console.log("sync succeeded")
                  },
                });
              }
            });
          }
        }
      });
      var animation = wx.createAnimation({
        timingFunction: 'step-end',
      });
      animation.opacity(0).matrix3d(1, 0, 0.00, 0, 0.00, 1, 0.00, 0, 0, 0, 1, 0, 0, 0, 0, 1).step();
      animation.opacity(1).step();
      self.setData({
        animationData: animation.export(),
      })
    }, 1000);
    }
  },

  picksend: function (e) {
    let that = this
    this.setData({
      picksend: e.detail.value
    })
  },
  enlarge: function (e) {
    this.setData({
      seeimage: e.target.id
    })
  },
  //navigator
  navigate: function (e) {
    console.log(e);
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current,
      })
    }
    this.setData({
      display: e.target.id
    })
  },

  nextround: function () {
    let that = this
    wx.showToast({
      title: '进入下回合',
      icon: "loading"
    })
    wx.request({
      url: larp.backendurl + '?type=user&tableid=' + that.data.tableid,
      success: function (res) {
        if (that.data.gameinfo.mainplot.length > that.data.roundnumber+1){
          var plotname = '确认进入下一回合：“' + that.data.gameinfo.mainplot[that.data.roundnumber + 1].plotname + '” 吗?'
          var end = false
        }else {
          //console.log(e)
          var plotname = "确定删除房间吗?请确认已阅读真相。"
          var end = true
        }
        if (res.data.length != that.data.gameinfo.playernumber) {
          plotname = "人数未齐！"+plotname
        }
        wx.hideToast()
        wx.showModal({
          title: '进入下回合',
          content:plotname,
          success: function (res) {
            if (end && res.confirm){
              wx.showToast({
                title: '正在删除房间',
                icon: "loading"
              })
              var user
              wx.request({
                url: larp.backendurl + '/' + that.data.table_id,
                method: 'DELETE',
                data: {
                  signature: md5.hexMD5(that.data.table_id + "xiaomaomi")
                },
                complete: function () {
                  wx.removeStorageSync('createdtable')
                  wx.removeStorageSync('createdgame')
                  console.log('deleted')
                  wx.reLaunch({
                    url: '../shop/shop'
                  })
                  wx.hideToast()
                }
              })
              wx.request({
                url: larp.backendurl + '?type=user&tableid=' + that.data.tableid,
                success: function (res) {
                  console.log(res.data)
                  for (user in res.data) {
                    wx.request({
                      url: larp.backendurl + '/' + res.data[user]._id,
                      data: {
                        signature: md5.hexMD5(res.data[user]._id + "xiaomaomi")
                      },
                      method: 'DELETE',
                      success: function () {
                      },
                    })
                  }
                },
              })
            }else if (res.confirm) {
              wx.request({
                url: larp.backendurl + '/' + that.data.table_id,
                data: {
                  roundnumber: that.data.roundnumber + 1,
                  signature: md5.hexMD5(that.data.table_id+"xiaomaomi")
                },
                method: "PUT",
                success: function (res) {
                  larp.socketsend(that, 'refresh')
                },
              })
            } else {
            }
          }
        })
      },
    })
  },
  vote: function () {
    let that = this
        wx.request({
          url: larp.backendurl + '/' + that.data.user_id,
          data: {
            vote: that.data.pickvote,
            signature: md5.hexMD5(that.data.user_id + "xiaomaomi")
          },
          method: "PUT",
          success: function (res) {
            console.log("succeeded")
          },
        });
        this.setData({
          vote: that.data.pickvote
        })
        console.log(that.data.vote)
  }, 
  pickvote: function (e) {
    let that = this
    this.setData({
      pickvote: e.detail.value
    })
  },

  showresult: function () {
    var content = ''
    var vote
    let that = this
    wx.request({
      url: larp.backendurl + '?type=user&tableid=' + that.data.tableid + '&select=characterid&select=vote',
      success: function (res) {
        that.setData({
          voteresult: res.data
        })
        console.log(res.data)
        for (vote in res.data) {
          console.log(res.data[vote].vote)
          if (res.data[vote].vote > -1 && res.data[vote].characterid!=-1) {
            content = content + that.data.gameinfo.characterlist[res.data[vote].characterid].name + ' : ' + that.data.gameinfo.characterlist[res.data[vote].vote].name + ' \ '
          }
        }
        wx.showModal({
          title: '结果',
          content: content,
          showCancel: false
        })
      },
    })
  },

  getclue: function (e) {
    let that = this;
    var locationid = e.target.id;
    var cluecount = this.data.gameinfo.cluelocation[locationid].count
    console.log(that.data.gameinfo.cluemethod)
    if (that.data.gameinfo.cluemethod == "return") {
      var cluenumber = Math.floor(Math.random() * cluecount)
      if (that.data.actionpoint > 0) {
        this.setData({
          actionpoint: that.data.actionpoint - 1
        })
        wx.showModal({
          title: '线索',
          content: that.data.gameinfo.cluelocation[locationid].clues[cluenumber].content + '    你的剩余行动点：' + that.data.actionpoint,
          showCancel:false
        })
        that.setData({
          acquiredclue: that.data.acquiredclue.concat(that.data.gameinfo.cluelocation[locationid].clues[cluenumber])
        })
        wx.request({
          url: larp.backendurl + '/' + that.data.user_id,
          data: {
            acquiredclue: that.data.acquiredclue,
            broadcast: that.data.broadcast,
            vote: that.data.vote,
            actionpoint: that.data.actionpoint,
            signature: md5.hexMD5(that.data.user_id + "xiaomaomi")
          },
          method: "PUT",
          success: function () {
            console.log("succeeded")
          },
        });
      } else {
        wx.showModal({
          title: '线索',
          content: '你的剩余行动点：' + that.data.actionpoint,
          showCancel:false
        })
      }
    } else if (that.data.gameinfo.cluemethod == "order") {
    } else if (that.data.gameinfo.cluemethod == "random") {
      if (that.data.actionpoint > 0) {
        wx.showToast({
          title: '正在获取',
          icon: "loading"
        })
        that.setData({
          actionpoint: that.data.actionpoint - 1
        })
        wx.request({
          url: larp.backendbaseurl + '/clue',
          data:{
            table_id: that.data.table_id,
            locationid:locationid
          },
          method: "POST",
          success: function (res) {
            console.log(locationid)
            console.log(res.data.clueid)
            wx.hideLoading()
            if (res.data.clueid>=0){
              wx.showModal({
                title: '线索',
                content: that.data.gameinfo.cluelocation[locationid].clues[res.data.clueid].content + '    你的剩余行动点：' + that.data.actionpoint,
                showCancel: false
              })
              that.setData({
                acquiredclue: that.data.acquiredclue.concat(that.data.gameinfo.cluelocation[locationid].clues[res.data.clueid])
              })
            }else{
              wx.showModal({
                title: '线索',
                content: '你毫无所获。你的剩余行动点：' + that.data.actionpoint,
                showCancel: false
              })
            }
            wx.request({
              url: larp.backendurl + '/' + that.data.user_id,
              data: {
                acquiredclue: that.data.acquiredclue,
                actionpoint: that.data.actionpoint,
                signature: md5.hexMD5(that.data.user_id + "xiaomaomi")
              },
              method: "PUT",
              success: function () {
                console.log("succeeded")
              },
            });
          },
        })
      } else {
        wx.showModal({
          title: '线索',
          content: '你的剩余行动点：' + that.data.actionpoint,
          showCancel: false
        })
      }
    } else {
      console.log("unknown method")
    }
  },

  bindTextAreaBlur: function (e) {
    console.log(e.detail.value)
  },

  broadcastSubmit: function (e) {
    let that = this
    function mapfunction(obj){
      if (obj.characterid == that.data.characterid) {
        return { characterid: that.data.characterid, broadcast: e.detail.value.textarea }
      }
      return obj
    }
    that.setData({
      globalbroadcast: that.data.globalbroadcast.map(mapfunction)
    })
    wx.request({
      url: larp.backendurl + '/' + that.data.user_id,
      data: {
        broadcast: e.detail.value.textarea,
        signature: md5.hexMD5(that.data.user_id + "xiaomaomi")
      },
      method: "PUT",
      success: function (res) {
        console.log("succeeded")
        larp.socketsend(that, 'broadcast')
      }
    });
  },
  /*
  save: function (e) {
    let that = this
    console.log(this.data.user_id)
    wx.request({
      url: larp.backendurl + '/' + that.data.user_id,
      data: {
        acquiredclue: that.data.acquiredclue,
        broadcast: that.data.broadcast,
        vote: that.data.vote,
        actionpoint: that.data.actionpoint
      },
      method: "PUT",
      success: function (res) {
        console.log("succeeded")
      },
    });
  },
  clearinfo: function (e) {
    larp.cleardata()
  },*/
  setactionpoint: function (e) {
    var point = e.detail.value.point
    var user
    let that = this
    wx.showModal({
      title: '发放行动点',
      content: '你确定要向所有玩家发放'+ point +'点行动点吗?',
      complete: function (res) {
        if (res.confirm) {
          larp.socketsendData(that, 'actionpoint', point)
          /*
          wx.request({
            url: larp.backendurl + '?type=user&tableid=' + that.data.tableid,
            success: function (res) {
              for (user in res.data) {
                wx.request({
                  url: larp.backendurl + '/' + res.data[user]._id,
                  data: {
                    actionpoint: res.data[user].actionpoint + point,
                    signature: md5.hexMD5(res.data[user]._id + "xiaomaomi")
                  },
                  method: "PUT",
                  success: function (res) {
                    console.log("point added")
                  },
                });
              }
            },
          });
          */
        }
      }
    })

  },
  revote: function (e) {
    let that=this
    var user
    wx.request({
      url: larp.backendurl + '?type=user&tableid=' + that.data.tableid,
      success: function (res) {
        for (user in res.data) {
          wx.request({
            url: larp.backendurl + '/' + res.data[user]._id,
            data: {
              vote: -1,
              signature: md5.hexMD5(res.data[user]._id+"xiaomaomi")
            },
            method: "PUT",
            success: function (res) {
              console.log("vote removed")
              larp.socketsend(that, 'revote')
            },
          });
        }
      },
    });
  },
  getsession: function (ispaused){
    let that = this
    ispaused = true
    if (!app.globalData.unionid) {
      console.log("waiting unionid")
      setTimeout(function () { that.getsession() }, 300);
    } else {
      if (wx.getStorageSync('tableid') && wx.getStorageSync('gameid') && wx.getStorageSync('characterid') && wx.getStorageSync('user_id') && wx.getStorageSync('table_id') ){
      that.setData({
        tableid: wx.getStorageSync('tableid'),
        gameid: wx.getStorageSync('gameid'),
        characterid: wx.getStorageSync('characterid'),
        user_id: wx.getStorageSync('user_id'),
        table_id: wx.getStorageSync('table_id'),
        usernickname: app.globalData.unionid
      })
      }else{
        wx.showModal({
          title: '数据加载失败',
          content: '请从人物码重新进入',
        })
      }
    }
    ispaused = false
  },
  heartbeat: function () {
    let that = this
    larp.socketping()
    console.log("ping")
    setTimeout(function () { that.heartbeat() }, 40000);
  },
  Pageload: function (ispaused) {
    let that=this
    this.getsession()
    if (ispaused) {
      console.log("waiting session")
      setTimeout(function () { that.Pageload(ispaused) }, 300);
    } else {
      wx.request({
        url: larp.backendurl + '/' + that.data.table_id,
        success: function (res) {
          console.log(res.satusCode)
          if ((res.statusCode == 404 && that.data.table_id) || !that.data.table_id) {
            wx.showModal({
              title: '房间不存在',
              content: '房间不存在或数据过期, 请从转发链接重新进入',
              showCancel: false,
              complete: function (res) {
                larp.cleardata()
              }
            })
          } else {
            that.setData({
              roundnumber: res.data.roundnumber,
              hostname: res.data.hostid,
              cluestatus: res.data.cluestatus
            })
          }
        }
      });
      wx.request({
        url: larp.backendurl + '/' + that.data.user_id,
        success: function (res) {
          that.setData({
            acquiredclue: res.data.acquiredclue,
            broadcast: res.data.broadcast,
            vote: res.data.vote,
            actionpoint: res.data.actionpoint
          })
        },
      });
      wx.request({
        url: larp.backendurl + '?type=character&gameid=' + that.data.gameid + '&characterid=' + that.data.characterid,
        success: function (res) {
          if (res.data.length>0){
            that.setData({
              characterinfo: res.data[0]
            })
          }
        },
      });
      wx.request({
        url: larp.backendurl + '?type=game&id=' + that.data.gameid,
        success: function (res) {
          that.setData({
            gameinfo: res.data[0],
            cluestatus: res.data[0].cluestatus
          })
          wx.hideToast()
        },
        complete: function () {
          wx.request({
            url: larp.backendurl + '?type=user&select=characterid&select=broadcast&tableid=' + that.data.tableid,
            success: function (res) {
              console.log(res.data)
              that.setData({
                globalbroadcast: res.data
              })
            },
          })
        }
      });
      wx.connectSocket({
        url: 'wss://chinabackend.bestlarp.com',
      })
      wx.onSocketOpen(function (res) {
        console.log('WebSocket is on.')
        larp.socketsend(that, 'join')
        that.heartbeat()
      })
      wx.onSocketMessage(function (res) {
        console.log("socketwork")
        var recieved = JSON.parse(res.data)
        console.log(recieved)
        if (recieved.message == "ping" ){
          console.log("pong")
        } else if (recieved.table_id == that.data.table_id) {
          if (recieved.message == "join") {
            wx.showToast({ title: '信息更新', icon: 'loading', duration: 500 });
            var content = ''
            var cast
            wx.request({
              url: larp.backendurl + '/' + that.data.table_id,
              success: function (res) {
                that.setData({
                  roundnumber: res.data.roundnumber
                })
              },
            })
            wx.request({
              url: larp.backendurl + '?type=user&select=characterid&select=broadcast&tableid=' + that.data.tableid,
              success: function (res) {
                console.log(res.data)
                that.setData({
                  globalbroadcast: res.data
                })
              },
            })
          } else if (recieved.message == "refresh") {
            wx.showToast({ title: '信息更新', icon: 'loading', duration: 500 });
            wx.request({
              url: larp.backendurl + '/' + that.data.table_id,
              success: function (res) {
                that.setData({
                  roundnumber: res.data.roundnumber
                })
                var content = (that.data.gameinfo.mainplot[res.data.roundnumber].enableclue > 0 ? "此回合可以搜证，":"")+ (that.data.gameinfo.mainplot[res.data.roundnumber].enablevote > 0 ? "此回合可以公投，":"")+"请阅读剧本信息"
                wx.showModal({
                  title: that.data.gameinfo.mainplot[res.data.roundnumber].plotname,
                  content: content,
                  showCancel:false
                })
              },
            })
          }else if (recieved.message == "broadcast") {
            wx.showToast({ title: '信息更新', icon: 'loading', duration: 500 });
            console.log("I get that")
            wx.request({
              url: larp.backendurl + '?type=user&select=characterid&select=broadcast&tableid=' + that.data.tableid,
              success: function (res) {
                console.log(res.data)
                that.setData({
                  globalbroadcast: res.data
                })
              },
            })
          }else if (recieved.message == "actionpoint") {
            wx.showToast({ title: '获得行动点', icon: 'loading', duration: 1000 });
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
            wx.showModal({
              title: '重新投票',
              content: '请重新投票',
              showCancel:false
            })
            wx.showToast({ title: '重新投票', icon: 'loading', duration: 1000 });
            that.setData({
              vote: -1
            })
          }
        }
      })
      wx.onSocketClose(function (res) {
        wx.showToast({
          title: '断线重连',
          icon: "loading"
        })
        wx.connectSocket({
          url: 'wss://chinabackend.bestlarp.com',
        })
      })
    }
  },
  onLoad: function (options) {
    let that = this
    var content = ''
    var cast
    console.log("Loading page")
    wx.showToast({
      title: '正在加载数据',
      icon: "loading"
    })
    if (options) {
      if (options.firsttime == 0) {
        that.setData({
          currenttutorial: 0
        })
      }
    }
    var ispaused=false
    this.Pageload(ispaused)
  },
  onHide: function () {
    console.log(this.data.user_id)
    larp.databackup(this)
  }
})
