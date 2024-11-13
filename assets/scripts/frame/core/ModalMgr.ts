import { UIWindow } from "./UIForm";
import resload from "./ResLoader";
import { instantiate, find, Prefab, Node, NodeEventType, Sprite, tween, UIOpacity, Color, log } from 'cc';
import AdapterMgr, { AdapterType } from "./AdapterMgr";
/**
 * 遮罩管理
 */
export default class ModalMgr {
	public static popupRoot = 'Canvas/ROOT/UI_POPUP';
	public static _inst: ModalMgr = null;
	public static get inst() {
		if (this._inst === null) {
			this._inst = new ModalMgr();
		}
		return this._inst;
	}
	uiModal:Node = null;
	firstPopup: UIWindow = null;//当前展示的弹窗（最上层）
	async checkModalWindow(coms: UIWindow[]){
		if (this.uiModal === null){
			await this.loadModel();
		}

		const opacityComp = this.uiModal.getComponent(UIOpacity);

		// 需要关闭modal时
		if (coms.length <= 0) {
			tween(opacityComp).to(0.1, { opacity: 50 }).call(()=>{
				this.uiModal.active = false;
			}).start()
			return;
		}
		
		// 最后一个弹窗在最上层
		this.firstPopup = coms[coms.length - 1];
		// 设置modal层级为firstPopup层级-1
		this.uiModal.setSiblingIndex(Math.max(this.firstPopup.node.getSiblingIndex() - 1, 0));

		
		// modal 渐变打开
		let startOpacity = 50;
		let endOpacity = this.firstPopup.opacity * 255;
		// 之前modal存在 (再次打开|打开两个弹窗，关闭第一个)
		if (this.uiModal.active) {
			// 改变初始透明度为当前透明度
			startOpacity = opacityComp.opacity;
			// 判断弹窗是 再次打开，再次打开加深结束透明度
			if (coms.length >= 2){
				endOpacity += startOpacity*0.5;
			}
		}

		opacityComp.opacity = startOpacity;
		
		this.uiModal.active = true;
		tween(opacityComp).to(0.3, { opacity: endOpacity }).start()
		
	}
	clickMaskWindow(){
		if (this.firstPopup.clickMaskClose){
			this.firstPopup.closeSelf();
		}
	}
	loadModel(){
		return new Promise<void>((resolve, reject) => {
			resload.loadPrefab('common#prefabs/Model', (err, Prefab: Prefab) => {
				if (!err && Prefab) {
					const node = instantiate(Prefab);
					find(ModalMgr.popupRoot).insertChild(node, 0);
					node.on(NodeEventType.TOUCH_START, this.clickMaskWindow, this);
					AdapterMgr.inst.adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, node);
					this.uiModal = node;
					resolve();
				}
			})
		})
	}
}