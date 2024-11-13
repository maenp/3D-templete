import { _decorator, Component } from 'cc';
import { FormType } from "./SysDefine";
import UIManager from "./UIManager";

const { ccclass, property } = _decorator;

export default class UIBase extends Component {
	/** 资源路径 */
	public static prefabPath = "";
	public prefabPath = "";
	/** 窗体类型 */
	public formType: FormType = 0;
	/** 关闭窗口后会销毁 */
	public willDestory = false;
	/** 常驻节点 不会关闭 */
	public permanentNode = false;

	public onShow(params: any) { }
	public onAfterShow(params: any) { }

	public onHide() { }
	public onAfterHide() { }

	/**
	 * 弹窗动画
	 */
	public async showEffect() { }
	public async hideEffect() { }

	public static async openView(parmas?: any): Promise<UIBase> {
		return UIManager.ins.openForm(this.prefabPath, parmas);
	}

	public static async closeView(): Promise<boolean> {
		return UIManager.ins.closeForm(this.prefabPath);
	}
	
	public async closeSelf(): Promise<boolean> {
		return UIManager.ins.closeForm(this.prefabPath);
	}
}