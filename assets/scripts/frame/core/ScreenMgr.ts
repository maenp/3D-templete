import UIManager from "./UIManager";
import {warn} from 'cc';

const TAG = "ScreenMgr";

class ScreenMgr {
	private _screens: Array<string> = [];
	private _curScreen: string = "";

	public getCurrScene() {
		return UIManager.ins.getForm(this._curScreen);
	}

	/** 打开 */
	public async open(screenPath: string, params?: any) {
		if (this._curScreen == screenPath) {
			warn(TAG, "当前场景和需要open的场景是同一个");
			return null;
		}

		if (this._screens.length > 0) {
			let curScreen = this._screens[this._screens.length - 1];
			await UIManager.ins.closeForm(curScreen);
		}
		let idx = this._screens.indexOf(screenPath);
		if (idx === -1) {
			this._screens.push(screenPath);
		} else {
			this._screens.length = idx + 1;//裁剪
		}

		this._curScreen = screenPath;
		
		let com = await UIManager.ins.openForm(screenPath, params);
		return com;
	}

	/** 回退 */
	public async back(params?: any) {
		if (this._screens.length <= 1) {
			// warn(TAG, "已经是最后一个场景了, 无处可退");
			// todo: 退出游戏
			return false;
		}
		let curScreen = this._screens.pop();
		await UIManager.ins.closeForm(curScreen);

		this._curScreen = this._screens[this._screens.length - 1];
		await UIManager.ins.openForm(this._curScreen, params);
	}

	public async close(screenPath: string) {
		let com = UIManager.ins.getForm(screenPath);
		if (com) {
			return UIManager.ins.closeForm(screenPath);
		}
	}

	/**重置打开记录 */
	public resetScreen(screenPath: string, params?: any) {
		this._screens.length = 0;
		this.open(screenPath, params);
	}
}

export default new ScreenMgr();