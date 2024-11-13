import { _decorator, Component, Node } from 'cc';
import { UIScreen } from "../../frame/core/UIForm";
const { ccclass, property } = _decorator;

@ccclass('UITestScreen')
export default class UITestScreen extends UIScreen {
    static prefabPath = 'app#screen/screen1';
    start() {

    }

    update(deltaTime: number) {
        
    }
}

