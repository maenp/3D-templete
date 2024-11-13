import * as cc from 'cc';
import { FormType } from "../../frame/core/SysDefine";
import UIManager from "../../frame/core/UIManager";
const { ccclass, property } = cc._decorator;

@ccclass('Toast')
export default class Toast extends cc.Component {
	public static prefabPath = "common#prefabs/Toast";
	public formType: FormType = 3;
	static async popUp(str: string){
		let prefab = await UIManager.ins.resload.loadPrefabSync(Toast.prefabPath);
		let node = cc.instantiate(prefab);
		let labelNode = node.getChildByName("Label");
		let lab = labelNode.getComponent(cc.Label);
		lab.string = str;
		let parent = UIManager.ins._ndTips;
		parent.addChild(node);
		
		node.getComponent(Toast).showAnim();
	}

	public showAnim() {
		this.node.setPosition(cc.v3(0,0,0));
		const opacityComp = this.node.getComponent(cc.UIOpacity);
		opacityComp.opacity = 0;

		cc.tween(opacityComp)
			.to(0.1, { opacity: 255 })
			.delay(2)
			.to(0.5, { opacity: 0 })
			.call(() => {
				this.node.destroy();
				this.node.removeFromParent();
			}).start();
	}
}