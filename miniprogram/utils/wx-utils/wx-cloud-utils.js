export function login() {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
                resolve(res)
            },
            fail: error => {
                reject(error)
            }
        })
    })
}