import { FormType } from "./SysDefine";
import { _decorator, v3, tween } from 'cc';
import UIBase from "./UIBase";
import ScreenMgr from "./ScreenMgr";

export class UIScreen extends UIBase {
    formType = FormType.Screen;
    willDestory = true;

    public static async openView(parmas?: any): Promise<UIBase> {
        return ScreenMgr.open(this.prefabPath, parmas);
    }

    public static async closeView(parmas?: any): Promise<boolean> {
        return ScreenMgr.back(parmas);
    }

    public async closeSelf(parmas?: any): Promise<boolean> {
        return ScreenMgr.back(parmas);
    }
}

export class UIWindow extends UIBase {
    public formType = FormType.Window;
    willDestory = true;
    public opacity = 0.8;              //透明度
    public clickMaskClose = true;      // 点击阴影关闭

    /** 显示效果 */
    public async showEffect() {
        return new Promise<void>((resolve, reject) => {
            this.node.scale = v3(0,0,0);
            tween(this.node).to(0.3, { scale: v3(1,1,1) }, {
                easing: "elasticInOut"
            }).call(() => {
                resolve();
            }).start();
        })
    }
    /**隐藏效果 */
    public async hideEffect() {
        return new Promise<void>((resolve, reject) => {
            tween(this.node).to(0.3, { scale: v3(0.1, 0.1, 0.1) }, { 
                easing: "cubicOut"    
            }).call(() => {
                resolve();
            }).start();
        })
    }
}