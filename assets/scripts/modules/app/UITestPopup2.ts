import { _decorator, Component, Node } from 'cc';
import { UIWindow } from "../../frame/core/UIForm";
const { ccclass, property } = _decorator;

@ccclass('UITestPopup2')
export default class UITestPopup2 extends UIWindow {
    static prefabPath = "app#popup2";
    start() {

    }
    onShow(param){
        console.log(param);
        
    }

    update(deltaTime: number) {
        
    }
}

