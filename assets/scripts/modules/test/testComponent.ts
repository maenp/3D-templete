import { _decorator, Component, Node, instantiate } from 'cc';
import resload from "../../frame/core/ResLoader";
const { ccclass, property } = _decorator;

@ccclass('testComponent')
export class testComponent extends Component {

    start() {

    }
    handleStartGame() {
    }
    handleBtn() {
        resload.loadPrefab('test#popup',(err,Prefab)=>{
            const node = instantiate(Prefab)
            this.node.addChild(node)
        })
    }
    update(deltaTime: number) {
        
    }
}

