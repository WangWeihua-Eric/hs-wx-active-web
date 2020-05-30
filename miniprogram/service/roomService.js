import {HttpUtil} from "../utils/http-utils/http-util";

let singletonPattern = null;

export class RoomService {
    http = new HttpUtil()

    constructor() {
        if (singletonPattern) {
            return singletonPattern
        }
        singletonPattern = this
    }


    /**
     * 获取连麦列表
     */
    linkmicList(sessionId, roomId) {
        return new Promise((resolve, reject) => {
            const url = '/room/api/linkmic/list'
            const params = {
                appSign: 'hongsongkebiao',
                sessionId: sessionId,
                roomId: roomId
            }
            this.http.get(url, params).then(res => {
                if (res && res.state && res.state.code === '0') {
                    resolve(res.data)
                } else {
                    reject(res)
                }
            }).catch(err => {
                reject(err)
            })
        })
    }

    /**
     * 老师拒绝连麦
     */
    teacherLinkmicPop(sessionId, roomId, userId) {
        return new Promise((resolve, reject) => {
            const url = '/room/api/anchor/linkmic/pop'
            const params = {
                appSign: 'hongsongkebiao',
                sessionId: sessionId,
                roomId: roomId,
                userId: userId
            }
            this.http.post(url, params).then(res => {
                if (res && res.state && res.state.code === '0') {
                    resolve(res.data)
                } else {
                    reject(res)
                }
            }).catch(err => {
                reject(err)
            })
        })
    }

    /**
     * 老师注册获取sku
     */
    querySku() {

        const url = '/course/api/category/skutolecturer'

        return this.http.newPost(url, {})
    }

    /**
     * 获取手机验证码
     */
    queryCode(phone) {

        const url = '/auth/api/dynamicget'
        const params = {
            appSign: 'hongsongkebiao',
            phone: phone,
        }

        return this.http.newPost(url, params)
    }


    /**
     * 老师注册
     */
    registered(info) {
        console.log(info)

        const url = '/lecturer/api/register'
        const params = {
            name: info.name,
            avatar: info.avatar,
            titles: info.titles,
            phone: info.phone,
            passwd: info.passwd,
            category: info.category,
            pendingCategory: info.pendingCategory,
            verificationCode: info.verificationCode,
            categoryId: info.categoryId
        }

        return this.http.newPost(url, params)
    }

    /**
     * 查询老师信息
     */
    queryTeacherInfo = sessionId => {
        const url = '/lecturer/api/querylecturerself'
        const params = {
            appSign: 'hongsongkebiao',
            sessionId: sessionId
        }
        return this.http.newPost(url, params)
    };

    /**
     * 查询老师招生
     */
    queryNewStudent(sessionId) {
        const url = '/lecturer/api/query/lecturerrecruitnew'
        const params = {
            sessionId: sessionId
        }
        return this.http.newPost(url, params)
    }

    /**
     * 查询招生地址
     */
    queryUrl(sessionId) {
        const url = '/user/api/getqrcode'
        const params = {
            sessionId: sessionId
        }
        return this.http.newPost(url, params)
    }
}