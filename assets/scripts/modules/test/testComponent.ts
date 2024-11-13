import { _decorator, Component, Node, instantiate } from 'cc';
import { ResLoader } from "../../frame/core";
const { ccclass, property } = _decorator;

@ccclass('testComponent')
export class testComponent extends Component {
    private _resload: ResLoader = new ResLoader();

    start() {

    }
    handleStartGame() {
    }
    handleBtn() {
        this._resload.loadPrefab('test#popup',(err,Prefab)=>{
            const node = instantiate(Prefab)
            this.node.addChild(node)
        })
    }
    update(deltaTime: number) {
        
    }
}

