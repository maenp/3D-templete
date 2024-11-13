
const { mm } = window;
// 分享来源
function getFromType() {
    const TEST_FROM_TYPE = "mvip_immomo_com-test";
    const PRODUCT_FROM_TYPE = "mvip_immomo_com";
    const {
        hostname
    } = window.location;
    if (hostname === "test-mvip.immomo.com") {
        return TEST_FROM_TYPE;
    }
    if (hostname === "mvip.immomo.com") {
        return PRODUCT_FROM_TYPE;
    }
    return "";
}
export default class MMBridge {
// 分享面板
    static doShare(cb?) {
        const from_type = getFromType();
        mm.share.showSharePanel({
            from_type, // 分享来源，各业务方需向API申请拿单独key值，
            scene_id:"luck_cancellation", // 每个活动需要后端创建
            apps: ["momo_contacts"], // 分享渠道
            feed_pic: "", // 分享图片url。不传的话客户端拉取远端物料返回的图片。
            ignore_tip: "0", // 发送成功客户端toast是否需求取消， 0/不取消，1/取消
            extra: JSON.stringify({
                url: window.location.href
            }) // 透传给业务方的参数， 例如 "{\"party_id\":\"party25da05d382d0f6\"}"
        },
            res => {
                // app: ''",  // 触发分享的渠道，  好友：momo_friend，动态：momo_feed，讨论组：momo_discuss，群组：momo_group，好友：weixin_friend,  朋友圈： weixin,  微博：sina，qq，qzone;
                // status: 1,  // 0:成功、1:失败、2:取消
                // message: '失败'; // 失败时，返回具体原因
                if (Number(res.status) === 0) {
                    typeof cb === "function" && cb(res);
                }
            }
        );
    }
    //头部配置
    static setHeaderMode(mode: number) {
        mm.ui.setUI({
            nav: { // 头部整体配置
                // 导航栏文字及图标颜色模式，默认为0，7.5.1 add (与_ui_mode一致)
                // 0: webview默认颜色，文字及图标为黑色
                // 1: 文字及图标为白色
                mode: mode,
            }
        })
    }
    // 显示消息
    static showMessage(info) {
        window.mm.invoke("ui", "showMessage", {
            status: 2,
            message: info
        });
    }
    // 打开链接
    static openUrl(gotoUrl) {
        mm.ui.openUrl({
            target: 3,
            url: gotoUrl
        });
    }
    // 打开goto
    static openGoto(param) {
        mm.ui.openGoto({
            param: param // [表情商城|goto_emoteshop|1]
        });
    }

    static gotoPay() {
        const param = {
            m: {
            t: "",
            a: "goto_buy_momo_gold_model",
            prm: '{"product_charge":"0"}' // 需要花费的陌陌币
            }
        };
        this.openUrl(JSON.stringify(param));
    }

    static notCoinHint() {
        window.mm.ui.showConfirm({
            title: "", // 可选，无此值时，不显示标题
            content: "当前余额不足，请充值",
            btn1: "取消",
            btn2: "去充值", // 可选，无此值时，显示一个按钮
            callback1: () => {}, // btn1回调 (bridge封装，client忽略)
            callback2: () => {
            this.gotoPay();
            }, // btn2回调 (bridge封装，client忽略)
            cancel: () => {}, // ios 不支持，安卓点击浮层、物理返回键时回调 (bridge封装，client忽略)
            finish: () => {} // 无论做了什么，最后都回调此方法 (bridge封装，client忽略)
        });
    }

    static close(){
        window.mm.ui.close({ type: 1 });
    }
}