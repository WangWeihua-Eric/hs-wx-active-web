// miniprogram/pages/regidtered/index.js
import Toast from '@vant/weapp/toast/toast';
import {RoomService} from "../../service/roomService";
import {debounceForFunction} from "../../utils/time-utils/time-utils";

const roomService = new RoomService()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        step: 0,
        perInfo: {
            name: '',
            epithet: '',
            phone: '',
            code: '',
            pass: ""
        },

        newTag: '', //自定义sku name
        accountCheck: false,
        show: false,
        time: 60000 * 5,
        showCode: true, //验证码
        stepArr: [
            {
                name: 'mark',
                title: '选择您的专业技能',
                back: true,
                step: 0,
                show: true
            },
            {
                name: 'header',
                title: '填写个人信息',
                back: true,
                step: 1,
                show: false
            },
            {
                name: 'end',
                title: '',
                step: 2,
                show: false,
                back: false,
            },

            {
                name: 'message',
                title: '上传头像',
                back: true,
                step: 4,
                show: false
            },
        ],
        curTag: false,  // 选中的sku
        addTag: true,  // sku加号按钮
        tagList: []
    },

    changeSku(e) {
        let val = e.target.dataset.index
        let add = e.target.dataset.add
        let list = this.data.tagList
        let cur = {}


        list.forEach((item, index) => {
            if (index == val) {
                item.checked = true
                cur = item
            } else {
                item.checked = false
            }
        })
        this.setData({
            tagList: list,
            curTag: cur
        })
        if (add) {

            this.stepAdd(add)

            // return
        }

    },


    //个人信息
    onChange(event) {
        // event.detail 为当前输入的值
        let type = event.target.dataset.type
        let value = event.detail
        let list = this.data.perInfo
        let check = false

        if (list.name && list.phone && list.pass && list.epithet) {
            check = true
        }


        this.setData({
            perInfo: {
                ...this.data.perInfo,
                [type]: value
            },
            accountCheck: check

        })

    },

    loginError(msg = '请输入正确的手机号和密码') {
        Toast.clear()
        wx.showModal({
            content: msg,
            showCancel: false,
            success: () => {
            }
        })
    },

    countCheck() {
        const name = this.data.perInfo.name
        const phone = this.data.perInfo.phone
        const code = this.data.perInfo.code
        const pass = this.data.perInfo.pass
        const phonebool = /^1[3456789]\d{9}$/.test(phone)
        const passbool = /^([0-9]|[a-zA-Z]){6,16}$/.test(pass)
        const namebool = /[\u4E00-\u9FA5\uF900-\uFA2D]/.test(name)
        if (!name) {
            this.loginError('姓名不能为空')
            return
        }
        if (!namebool) {
            this.loginError('姓名输入有误')
            return
        }
        if (!phone || phone == null) {
            this.loginError('手机号不能为空')
            return
        }
        if (!phonebool) {
            this.loginError('手机号格式错误')
            return
        }
        if (!pass || pass == null) {
            this.loginError('密码不能为空')
            return
        }
        if (!passbool) {
            this.loginError('密码输入不正确')
            return
        }
        if (!code) {
            this.loginError('验证码不能为空')
            return
        }


        this.changeStep(true, true)

    },

    nextStep() {
        this.changeStep(true)
    },
    forwardStep() {
        this.changeStep(false)
    },


    //true:下一步 false:上一步 ,check为真校验成功
    changeStep(add, check = false) {
        if (this.data.step == 1 && !check && add) {
            this.countCheck()
            return
        }

        let list = this.data.stepArr;
        let number = this.data.step
        let nextStep;
        if (add) {
            nextStep = ++number
        } else {
            nextStep = --number
        }
        // 跳入注册
        if (nextStep == 2 && check) {
            this.registered()
            return;
        }
        // 非法步骤
        if (nextStep > 1 || nextStep < -1) {
            console.log('非法步骤')
            return;
        }
        if (nextStep === -1) {
            wx.navigateBack({
                delta: 1
            })
            this.setData({step: 0})
            return;
        }


        list.forEach(item => {
            if (item.step == nextStep) {
                item.show = true
            } else {
                item.show = false
            }
        })


        this.setData({
            step: nextStep,
            stepArr: list
        })


    },

    // sku 添加弹窗
    stepAdd(add = false) {
        if (debounceForFunction()) {
            return
        }
        if (add) {
            this.setData({show: true});
        } else {
            this.setData({
                show: true,
                // newTag:this.data.tagList[this.data.tagList.length-1].name
            })
        }

    },

    onClickHide() {
        this.setData({show: false})
    },


    //确认
    confirmTag() {
        //  修改自定义sku
        if (this.data.curTag.add) {

            let list = this.data.tagList
            let cur = {
                name: this.data.newTag,
                checked: true,
                add: true
            }
            list[list.length - 1] = cur

            this.setData({
                show: false,
                tagList: list,
                addTag: false,
                curTag: cur
            });

            return
        }

        // 新增 自定义sku

        if (!this.data.newTag) {
            this.setData({show: false});


        } else {
            let list = this.data.tagList
            let newTag = this.data.newTag
            let repeat = false
            console.log(list)
            let cur = {
                name: newTag,
                checked: true,
                add: true
            }
            list.forEach(item => {

                if (newTag === item.name) {
                    item.checked = true
                    repeat = true
                    cur = item
                } else {
                    item.checked = false
                }

            })

            // 不重复才推入
            if (!repeat) {
                list.push(cur)
            }


            this.setData({
                show: false,
                tagList: list,
                addTag: repeat,
                curTag: cur
            });
        }
    },
    onNewTag(event) {
        let value = event.detail
        this.setData({
            newTag: event.detail.replace(/\s+/g, '')
        })
    },
    // 发送验证ma
    codeOff() {
        if (debounceForFunction(200)) {
            return
        }
        const phone = this.data.perInfo.phone
        const phonebool = /^1[3456789]\d{9}$/.test(phone)
        if (!phone) {
            this.loginError('手机号不能为空')
            return
        }
        if (!phonebool) {
            this.loginError('手机号格式错误')
            return
        }
        // this.countCheck()
        roomService.queryCode(this.data.perInfo.phone).then(res => {
            this.setData({
                showCode: false,
            })
        }).catch(err => Toast('验证码发送失败' + err))

    },
    finished() {
        this.setData({
            showCode: true,
        })
    },
    backHome() {
        // const url = `../caster-login/caster-login`
        // wx.navigateTo({
        //     url:url
        // })
        wx.navigateBack({
            delta: 1
        })

    },
    querySku() {
        roomService.querySku().then(res => {

            res.forEach(item => {
                item.checked = false
            })
            this.setData({
                tagList: res
            })
        }).catch(err => console.log('获取sku失败', err))
    },
    // 注册成功跳入结束页
    registered() {
        Toast.loading({
            mask: true,
            message: '登录中...'
        })

        let tag = '';
        let newTag = '';
        let tagId = 0;
        if (this.data.curTag.add) {
            newTag = this.data.curTag.name
        } else {
            tag = this.data.curTag.name
            tagId = this.data.curTag.id
        }

        let info = this.data.perInfo
        let perInfo = {
            name: info.name,
            avatar: '',
            titles: info.epithet,
            phone: info.phone,
            passwd: info.pass,
            category: tag,
            pendingCategory: newTag,
            verificationCode: info.code,
            categoryId: tagId
        }
        roomService.registered(perInfo).then(res => {


            let list = this.data.stepArr
            list.forEach(item => {
                if (item.step == 2) {
                    item.show = true
                } else {
                    item.show = false
                }
            })
            this.setData({
                step: 2,
                stepArr: list
            })
            Toast.clear()
        }).catch(err => {
            Toast(err.result.data);
            this.init()
            console.log('注册失败:', err)


        })
    },
    init() {
        this.setData({
            perInfo: {
                name: '',
                epithet: '',
                phone: '',
                code: '',
                pass: ""
            },
            showCode: true,
            accountCheck: false
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.querySku()

    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        Toast.clear()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },


})