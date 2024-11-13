import { _decorator, Component, Node } from 'cc';
import { UIScreen } from "../../frame/core/UIForm";
import Toast from "../common/Toast";
import popup from './UITestPopup';
import UITestScreen from "./UITestScreen";
import { indexApi } from "../../api";

const { ccclass, property } = _decorator;
@ccclass('UIHome')
export default class UIHome extends UIScreen {
    static prefabPath = 'app#screen/home';
    permanentNode = true;
    start() {

    }


    handleBtn(e, key) {
        switch (key) {
            case '1':
                popup.openView()
                break;
            case '2':
                UITestScreen.openView()
                break;
            case '3':
                Toast.popUp('欢迎回来欢迎回来')
                break;
            case '4':
                indexApi()
                break;

            default:
                break;
        }
    }
}

