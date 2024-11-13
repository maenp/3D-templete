import * as cc from 'cc';
import AdapterMgr, { AdapterType } from "./AdapterMgr";
import ModalMgr from "./ModalMgr";
import resload from "./ResLoader";
import { FormType } from "./SysDefine";
import UIBase from "./UIBase";
import { UIWindow } from "./UIForm";

export default class UIManager {
	private _ndScreen: cc.Node = null;  // 全屏显示的UI 挂载结点
	private _ndPopup: cc.Node = null;   // 弹出窗口
	public _ndTips: cc.Node = null;    // 独立窗体

	private _windows: UIWindow[] = [];                   // 存储弹出的窗体
	private _allForms: { [key: string]: UIBase } = cc.js.createMap();    // 所有已经挂载的窗体, 可能没有显示
	private _loadingForm: { [key: string]: ((value: UIBase) => void)[] } = cc.js.createMap();    // 正在加载的form 
	private _showingForms: { [key: string]: UIBase } = cc.js.createMap();    // 正在显示的窗体

	private static instance: UIManager = null;
	public static get ins(){
		if (this.instance === null){
			this.instance = new UIManager();
			const Canvas = cc.director.getScene().getChildByName("Canvas");
			let Root = Canvas.getChildByName("ROOT");
			if (!Root){
				Root = new cc.Node('ROOT');
				Root.addChild(this.instance._ndScreen = new cc.Node('UI_SCREEN'));
				Root.addChild(this.instance._ndPopup = new cc.Node('UI_POPUP'));
				Root.addChild(this.instance._ndTips = new cc.Node('UI_TIPS'));
				Canvas.addChild(Root);
			}else{
				this.instance._ndScreen = Root.getChildByName('UI_PAGE');
				this.instance._ndPopup = Root.getChildByName('UI_POPUP');
				this.instance._ndTips = Root.getChildByName('UI_TIPS');
			}
			cc.director.once(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, () => {
				resload.releaseAll();
				this.instance = null;
			});
		}
		return this.instance;
	}
	/**
	 * 重要方法 加载显示一个UIForm
	 * @param prefabPath 
	 * @param params 初始化信息, 可以不要
	 */
	public async openForm(prefabPath: string, params?: any){
		if (!prefabPath || prefabPath.length <= 0) {
			cc.warn(`${prefabPath}, 参数错误`);
			return;
		}
		
		if (this.checkFormStatus(prefabPath))return;

		let com = await this.loadForm(prefabPath);
		if (!com) {
			cc.warn(`${prefabPath} 加载失败了!`);
			return null;
		}
		
		com.prefabPath = prefabPath;

		switch (com.formType) {
			case FormType.Screen:
				await this.enterToScreen(prefabPath);
				break;
			case FormType.Window:
				await this.enterToPopup(prefabPath);
				break;
		}
		com.onShow(params);
		await this.showForm(com);
		com.onAfterShow(params);

		return com;
	}
	/**
	 * 重要方法 关闭一个UIForm
	 * @param prefabPath 
	 */
	public async closeForm(prefabPath: string) {
		if (!prefabPath || prefabPath.length <= 0) {
			cc.warn(`${prefabPath}, 参数错误`);
			return;
		};

		let com = this._allForms[prefabPath];
		if (!com) return false;
		if (com.permanentNode) return;
		com.onHide();
		await this.hideForm(com);
		com.onAfterHide();

		switch (com.formType) {
			case FormType.Window:
				await this.exitToPopup(prefabPath);
				break;
		}

		// 判断是否销毁该窗体
		if (com.willDestory) {
			this._allForms[com.prefabPath] = null;
			delete this._allForms[com.prefabPath];
			com.node.destroy();
		}

		return true;
	}
	private async loadForm(prefabPath: string): Promise<UIBase> {
		let com = this._allForms[prefabPath];
		if (com) return com;
		return new Promise((resolve, reject) => {
			if (this._loadingForm[prefabPath]) {
				this._loadingForm[prefabPath].push(resolve);
				return;
			}
			this._loadingForm[prefabPath] = [resolve];
			this._doLoadUIForm(prefabPath).then((com: UIBase) => {
				for (const func of this._loadingForm[prefabPath]) {
					func(com);
				}
				this._loadingForm[prefabPath] = null;
				delete this._loadingForm[prefabPath];
			});
		});
	}
	private async _doLoadUIForm(prefabPath: string) {
		let prefab = await resload.loadPrefabSync(prefabPath);
		const node = cc.instantiate(prefab);
		let com = node.getComponent(UIBase);
		if (!com) {
			cc.warn(`${prefabPath} 结点没有绑定UIBase`);
			return null;
		}
		switch (com.formType) {
			case FormType.Screen:
				this._ndScreen.addChild(node);
				break;
			case FormType.Window:
				this._ndPopup.addChild(node);
				break;
		}
		this._allForms[prefabPath] = com;
		return com;
	}
	private async showForm(baseUI: UIBase) {
		baseUI.node.active = true;
		await baseUI.showEffect();

		this._showingForms[baseUI.prefabPath] = baseUI;
	}
	private async hideForm(baseUI: UIBase) {
		await baseUI.hideEffect();
		baseUI.node.active = false;

		this._showingForms[baseUI.prefabPath] = null;
		delete this._showingForms[baseUI.prefabPath];
	}
	/** 添加到screen中 */
	async enterToScreen(path){
		let com = this._allForms[path];
		if (!com) return;
		// 关闭其他显示的窗口 
		let arr: Array<Promise<boolean>> = [];
		for (let key in this._showingForms) {
			// arr.push(UIManager.ins.closeForm(key));
			if (!this._showingForms[key].permanentNode){
				arr.push(this._showingForms[key].closeSelf());
			}
		}
		await Promise.all(arr);

		AdapterMgr.inst.adapteByType(AdapterType.StretchHeight | AdapterType.StretchWidth, com.node);
	}
	async enterToPopup(path:string){
		let com = this._allForms[path] as UIWindow;
		if (!com) return;
		this._windows.push(com);

		for (let i = 0; i < this._windows.length; i++) {
			this._windows[i].node.setSiblingIndex(i + 1);
		}

		ModalMgr.inst.checkModalWindow(this._windows);
	}
	async exitToPopup(path:string){
		if (this._windows.length <= 0) return;
		let com: UIWindow = null;
		for (let i = this._windows.length - 1; i >= 0; i--) {
			if (this._windows[i].prefabPath === path) {
				com = this._windows[i];
				this._windows.splice(i, 1);
			}
		}
		if (!com) return;
		
		ModalMgr.inst.checkModalWindow(this._windows);
	}
	/** 窗体是否正在显示 */
	public checkFormStatus(prefabPath: string) {

		let com = this._allForms[prefabPath];
		if (com) {
			if (com.permanentNode) {
				return true;
			}
			if (com.node.active) {
				cc.warn(`${prefabPath}, 窗体正在显示中`);
				return true;
			}
		}
		return false;
	}
	/** 获得Component */
	public getForm(fId: string) {
		return this._allForms[fId];
	}
}