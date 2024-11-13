import * as cc from 'cc';
import UIManager from "../../frame/core/UIManager";

import UIHome from "./UIHome";

const { ccclass, property } = cc._decorator;

@ccclass('scene')
export class scene extends cc.Component {
    start(){
        console.log(UIManager.ins);
        UIHome.openView()
        
    }


}