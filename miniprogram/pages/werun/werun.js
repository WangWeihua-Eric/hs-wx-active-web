// pages/werun/werun.js

import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

const app = getApp()

const db = wx.cloud.database({
  env: 'hs-cloud-amf2z'
})

const todo = db.collection('todo')

const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '../../images/wxlogo.png',
    userInfo: {},
    step: 0,
    openid: '',
    needUserInfo: false,
    werun: false,
    show: false,
    content: '',
    weruninfotitle: '',
    totalJoin: '0',
    listData: [],
    nowRank: 0,
    opengid: '',
    qrcode: 'hskt018'
  },

  loopnumber: 0,
  timeHander: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    db.collection('qccode').where({
      t: 'code'
    })
      .get({
        success: (res) => {
          // res.data 是包含以上定义的两条记录的数组
          if (res && res.data && res.data.length) {
            const qrcode = res.data[0].qrcode;
            if (qrcode) {
              this.setData({
                qrcode: qrcode
              })
            }
          }
        }
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {


    wx.showShareMenu({
      withShareTicket: true
    })

    wx.getSetting({
      success: (res) => {
        const needUserInfo = !res.authSetting['scope.userInfo']
        if (needUserInfo) {
          this.getNeedUserInfo()
          this.setData({
            needUserInfo: needUserInfo,
            werun: false
          })
        } else {
          this.getWeRunInfo()
          this.setData({
            werun: true,
            needUserInfo: false
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    try {
      wx.clearStorageSync()
    } catch (e) {
      // Do something when catch error
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  bindGetUserInfo: function(e) {

  },

  onClickRule: function() {
    this.setData({
      show: true
    })
  },

  onClose() {
    this.setData({
      show: false
    });
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.getWeRunInfo()
      this.setData({
        needUserInfo: false,
        werun: true
      })
    }
  },

  getWeRunInfo: function() {
    Toast.loading({
      mask: true,
      message: '加载中...',
      duration: 0,
    });

    if (this.data.opengid) {
      // 获取详情
      this.getWeRunInfoNext()

    } else {
      this.readWerunShareTicket()
    }
  },

  readWerunShareTicket: function() {
    if (this.timeHander) {
      clearTimeout(this.timeHander)
    }
    wx.getStorage({
      key: 'shareTicket',
      success: (res) => {
        this.loopnumber = 0;
        const shareTicket = res.data;
        wx.getShareInfo({
          shareTicket: shareTicket,
          success: (shareInfo) => {
            const cloudID = shareInfo.cloudID
            if (cloudID) {
              wx.cloud.callFunction({
                name: 'opengid',
                data: {
                  encryptedData: wx.cloud.CloudID(cloudID), // 这个 CloudID 值到云函数端会被替换
                  obj: {
                    shareInfo: wx.cloud.CloudID(cloudID), // 非顶层字段的 CloudID 不会被替换，会原样字符串展示
                  }
                },
                success: (encryptedDataRes) => {
                  const opengid = encryptedDataRes.result.openGId.encryptedData.data.openGId
                  if (opengid) {
                    this.setData({
                      opengid: opengid
                    })
                    //  获取详情
                    this.getWeRunInfoNext()
                  }
                }
              })
            }
          }
        })
      },
      fail: () => {
        this.timeHander = setTimeout(() => {
          if (this.loopnumber < 100) {
            this.loopnumber++
              this.readWerunShareTicket()
          } else {
            Toast.clear()
            Dialog.alert({
              message: '您还不是红松学习群的成员，暂时无法参与我们的活动哦～'
            }).then(() => {
              // on close
            });
          }
        }, 100)
      }
    })
  },

  sendUserInfo: function() {





    const opengid = this.data.opengid
    const nowtime = this.getDayTime()
    const openid = this.data.openid
    const stepnumber = this.data.step

    todo.where({
        nowtime: _.eq(nowtime),
        opengid: _.eq(opengid),
        openid: _.eq(openid)
      })
      .get({
        success: (reslist) => {
          if (reslist && reslist.data && reslist.data.length) {
            // 有数据走更新逻辑
            const id = reslist.data[0]._id
            this.updateDB(id)
          } else {
            // 没数据走插入逻辑
            this.insertDB(opengid, nowtime)
          }
        }
      })
  },


  getDayTime: function() {
    const nowTime = new Date(new Date().toLocaleDateString()).getTime() / 100
    return nowTime;
  },

  updateDB: function(id) {
    const openid = this.data.openid
    const stepnumber = this.data.step

    wx.cloud.callFunction({
      name: 'dbupdate',
      data: {
        id: id,
        stepnumber: stepnumber
      },
      success: () => {
        const opengid = this.data.opengid
        if (opengid) {
          this.getRankList(opengid)
        }
      }
    })
  },

  insertDB: function(opengid, nowtime) {
    const sendDate = {
      nickname: this.data.userInfo.nickName,
      imgurl: this.data.avatarUrl,
      stepnumber: this.data.step,
      openid: this.data.openid,
      opengid: opengid,
      nowtime: nowtime,
      updatetime: new Date().getTime()
    }

    wx.cloud.callFunction({
      name: 'dbinsert',
      data: {
        sendDate: sendDate
      },
      success: () => {
        if (opengid) {
          this.getRankList(opengid)
        }
      }
    })
  },

  getRankList: function(opengid) {
    db.collection('todo').where({
        opengid: opengid,
        nowtime: this.getDayTime()
      }).orderBy('stepnumber', 'desc').limit(3)
      .get().then(res => {
        this.setData({
          listData: res.data
        })
        Toast.clear()
      })

    const stepnumber = this.data.step

    db.collection('todo').where({
      opengid: opengid,
      stepnumber: db.command.gt(stepnumber),
      nowtime: this.getDayTime()
    }).count().then(res => {
      this.setData({
        nowRank: res.total + 1
      })
    })

    this.setTotalJoin()
  },

  getNeedUserInfo: function() {
    if (this.timeHander) {
      clearTimeout(this.timeHander)
    }
    wx.getStorage({
      key: 'shareTicket',
      success: (res) => {
        this.loopnumber = 0;
        const shareTicket = res.data;

        wx.getShareInfo({
          shareTicket: shareTicket,
          success: (shareInfo) => {
            const cloudID = shareInfo.cloudID
            if (cloudID) {
              wx.cloud.callFunction({
                name: 'opengid',
                data: {
                  encryptedData: wx.cloud.CloudID(cloudID), // 这个 CloudID 值到云函数端会被替换
                  obj: {
                    shareInfo: wx.cloud.CloudID(cloudID), // 非顶层字段的 CloudID 不会被替换，会原样字符串展示
                  }
                },
                success: (encryptedDataRes) => {
                  const opengid = encryptedDataRes.result.openGId.encryptedData.data.openGId
                  if (opengid) {

                    this.setData({
                      opengid: opengid
                    })

                    this.setTotalJoin()
                  }
                }
              })
            }
          }
        })
      },
      fail: (res) => {
        this.timeHander = setTimeout(() => {
          if (this.loopnumber < 100) {
            this.loopnumber++
              this.getNeedUserInfo()
          } else {
            Toast.clear()
            Dialog.alert({
              message: '您还不是红松学习群的成员，暂时无法参与我们的活动哦～'
            }).then(() => {
              // on close
            });
          }
        }, 100)
      }
    })
  },
  getWeRunInfoNext: function() {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        const openid = res.result.openid
        if (openid) {
          this.setData({
            openid: openid
          })
          // 获取用户信息
          wx.getSetting({
            success: res => {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  success: res => {
                    this.setData({
                      avatarUrl: res.userInfo.avatarUrl,
                      userInfo: res.userInfo
                    })
                    wx.getWeRunData({
                      success: (res) => {
                        // 拿 encryptedData 到开发者后台解密开放数据
                        const encryptedData = res.encryptedData
                        // 或拿 cloudID 通过云调用直接获取开放数据
                        const cloudID = res.cloudID
                        if (cloudID) {
                          wx.cloud.callFunction({
                            name: 'werun',
                            data: {
                              weRunData: wx.cloud.CloudID(cloudID), // 这个 CloudID 值到云函数端会被替换
                              obj: {
                                shareInfo: wx.cloud.CloudID(cloudID), // 非顶层字段的 CloudID 不会被替换，会原样字符串展示
                              }
                            },
                            success: (werunRes) => {
                              const len = werunRes.result.list.data.stepInfoList.length;
                              const step = werunRes.result.list.data.stepInfoList[len - 1].step;
                              let weruninfotitle = ''
                              if (step < 3000) {
                                weruninfotitle = '恭喜你，在家里的御花园(阳台)里溜了个弯儿'
                              } else if (step < 6000) {
                                weruninfotitle = '你已经绕故宫逛了一圈啦！'
                              } else if (step < 10000) {
                                weruninfotitle = '今天的运动量很理想，有望夺冠哦'
                              } else {
                                weruninfotitle = '哇，长跑冠军！务必要注意劳逸结合哦～'
                              }
                              this.setData({
                                step: step,
                                weruninfotitle: weruninfotitle
                              })
                              this.sendUserInfo()
                            },
                          })
                        }
                      }
                    })
                  }
                })
              }
            }
          })
        }
      }
    })
  },
  setTotalJoin: function() {
    const opengid = this.data.opengid
    todo.where({
      opengid: opengid,
      nowtime: this.getDayTime()
    }).count().then(res => {
      const totalJoin = res.total
      this.setData({
        totalJoin: totalJoin + ''
      })
    })
  },

  onCopyCode: function() {
    let qrcode = this.data.qrcode
    if (!qrcode) {
      qrcode = 'hsxt018'
    }
    wx.setClipboardData({
      data: qrcode,
      success(res) {
        wx.getClipboardData({
          success: (res) => {}
        })
      }
    })
  }
})