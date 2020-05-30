//app.js
App({
    globalData: {
        scene: 0,
        shareTicket: '',
        userInfo: null,
        headerHeight: 0,
        statusBarHeight: 0
    },
    onLaunch: function (res) {

        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                // env 参数说明：
                //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
                //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
                //   如不填则使用默认环境（第一个创建的环境）
                env: 'hs-cloud-amf2z',
                traceUser: true,
            })
        }

        const {model, system, statusBarHeight} = wx.getSystemInfoSync();
        const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
        var headHeight;
        if (/iphone\s{0,}x/i.test(model)) {
            headHeight = 88;
        } else if (system.indexOf('Android') !== -1) {
            headHeight = 68;
        } else {
            headHeight = 64;
        }

        this.globalData = {
            headerHeight: headHeight,
            statusBarHeight: statusBarHeight,
            menuButtonInfo: menuButtonInfo
        }
    },
    onShow: function (res) {
        this.globalData.scene = res.scene;
        this.globalData.shareTicket = res.shareTicket;
    }
})
