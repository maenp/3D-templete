import { _decorator, Component, Node } from 'cc';
import { UIWindow } from "../../frame/core/UIForm";
import UITestPopup2 from "./UITestPopup2";
const { ccclass, property } = _decorator;

@ccclass('UITestPopup')
export default class UITestPopup extends UIWindow {
    static prefabPath = "app#popup";
    start() {

    }
    btnHandle(){
        UITestPopup2.openView('popup1 传入的参数')
    }

    update(deltaTime: number) {
        
    }
}

