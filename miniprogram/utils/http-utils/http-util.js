import {http} from "../wx-utils/wx-cloud-utils";

let singletonPattern = null;

export class HttpUtil {
    host = 'https://www.hongsong.club'

    constructor() {
        if (singletonPattern) {
            return singletonPattern
        }
        singletonPattern = this


        let environment = 'prod'
        if (typeof __wxConfig === "object") {
            let version = __wxConfig.envVersion
            switch (version) {
                case 'develop': {
                    //  工具或者真机 开发环境
                    environment = 'dev'
                    break
                }
                case 'trial': {
                    //  测试环境(体验版)
                    environment = 'beta'
                    break
                }
                case 'release': {
                    //  正式环境
                    environment = 'prod'
                    break
                }
                default: {
                    //  默认环境
                    environment = 'prod'
                }
            }
        }
        switch (environment) {
            case 'dev': {
                this.host = 'https://dev.hongsong.club'
                break
            }
            case 'beta': {
                this.host = 'https://dev.hongsong.club'
                break
            }
            case 'prod': {
                this.host = 'https://www.hongsong.club'
                break
            }
            default: {
                this.host = 'https://www.hongsong.club'
            }
        }
    }

    post(url, param, sessionId = '') {
        if (sessionId) {
            param = {
                ...param,
                sessionId: sessionId
            }
        }
        return http(this.host + url, param, 'POST').then(res => {
            return res.result;
        })
    }

    get(url, param, sessionId = '') {
        if (sessionId) {
            param = {
                ...param,
                sessionId: sessionId
            }
        }
        return http(this.host + url, param, 'GET').then(res => {
            return res.result
        })
    }

    newGet(url, params) {
        return new Promise((resolve, reject) => {
            http(this.host + url, params, 'GET').then(res => {
                if (res && res.result && res.result.state && res.result.state.code === '0') {
                    resolve(res.result.data)
                } else {
                    reject(res)
                }
            }).catch(err => {
                reject(err)
            })
        })
    }

    newPost(url, params) {
        return new Promise((resolve, reject) => {
            http(this.host + url, params, 'POST').then(res => {
                if (res && res.result && res.result.state && res.result.state.code === '0') {
                    resolve(res.result.data)
                } else {
                    reject(res)
                }
            }).catch(err => {
                reject(err)
            })
        })
    }
}