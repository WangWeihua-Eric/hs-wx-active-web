/**
 * 查询是否授权
 * @param scope 授权内容
 */
export function getSetting(scope) {
    return new Promise((resolve, reject) => {
        wx.getSetting({
            success: (res) => {
                resolve(res.authSetting[scope])
            },
            fail: (error) => {
                reject(error)
            }
        })
    })
}

/**
 * 获取微信缓存
 */
export function getStorage(key) {
    return new Promise((resolve, reject) => {
        wx.getStorage({
            key: key,
            success: (res) => {
                resolve(res.data)
            },
            fail: (error) => {
                reject(error)
            }
        })
    })
}

export  function getShareInfo(shareTicket) {
    return new Promise((resolve, reject) => {
        wx.getShareInfo({
            shareTicket: shareTicket,
            success: (shareInfo) => {
                resolve(shareInfo)
            },
            fail: (error) => {
                reject(error)
            }
        })
    })
}