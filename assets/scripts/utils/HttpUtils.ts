import MMBridge from "./MMBridge";
import * as cc from 'cc';
import { HOST, GameConfig, TEST_HOST } from "../config";

//连点保护
let fastRequestList: Set<string> = new Set();
function getUrlHost() {
    const is_test = window.location.hostname;
    let urlHost = HOST;
    if (is_test.indexOf("test-") !== -1) {
        urlHost = TEST_HOST;
    } else if (is_test.indexOf("beta.") !== -1) {
        urlHost = window.location.origin;
    } else if (is_test.indexOf("local") !== -1 || is_test.indexOf("172.") !== -1) {
        // } else if (is_test.indexOf("local") !== -1) {
        urlHost = "";
    }
    return urlHost;
}

export default class HttpUtils {
    private static _timeout = 10000;
    private static _base_url = getUrlHost();

    static Request(pathname: string, data?: { [key: string]: any }, options?: { host: string,needErrCode:boolean }): Promise<Response["data"]> {
        return new Promise((resolve, reject) => {
            if (HttpUtils.checkFastRequest(pathname, data)) {
                reject({ ec: '请求过快' });
                return
            }

            var timeoutTag = null;
            var timeoutFlag = false;
            //超时处理
            if (this._timeout && this._timeout > 0) {
                timeoutTag = setTimeout(function () {
                    timeoutFlag = true;
                    HttpUtils.clearFastRequest(pathname, data);
                    console.error("http _timeout, pathname = " + pathname);
                    reject({ ec: '请求超时' });
                }, this._timeout);
            }

            const url = this._base_url + pathname;
            window.mk.ajax({
                host: (GameConfig.envType ==='dev') ? options?.host:undefined,
                url,
                data,
                success(res: Response) {
                    //超时处理
                    if (timeoutFlag == true) {
                        return
                    }
                    if (timeoutTag) {
                        clearTimeout(timeoutTag);
                        timeoutTag = null;
                    }
                    //返回数据
                    switch (res.ec) {
                        case 200:
                        case 0:
                            resolve(res.data);
                            break;
                        case 403:
                            setTimeout(()=>{
                                MMBridge.close();
                            },500)
                        default:
                            reject(res);
                            HttpUtils.handleError(res);
                            break;
                    }
                    HttpUtils.clearFastRequest(pathname, data);
                },
                error(err) {
                    //超时处理
                    if (timeoutFlag == true) {
                        return
                    }
                    if (timeoutTag) {
                        clearTimeout(timeoutTag);
                        timeoutTag = null;
                    }
                    HttpUtils.clearFastRequest(pathname, data);
                    reject(err);
                    HttpUtils.handleError(err);
                }
            })
        })

    }

    //频繁点击保护
    private static checkFastRequest(url: string, data?: { [key: string]: any }): boolean {
        let urlKey = url + JSON.stringify(data);
        if (fastRequestList.has(urlKey)) {
            return true;
        }
        fastRequestList.add(urlKey)
        return false;
    }

    private static clearFastRequest(url, data?: { [key: string]: any }) {
        let urlKey = url + JSON.stringify(data);
        if (fastRequestList.has(urlKey)) {
            fastRequestList.delete(urlKey);
        }
    }
    static handleError(err) {
        MMBridge.showMessage(err.em || err.message || "网络有点问题");
    }
}