import { _decorator, Component } from 'cc';
import UIJelly from './UIJelly';
const { ccclass } = _decorator;

@ccclass('scene')
export class scene extends Component {
    start() {
        UIJelly.openView();
    }
}
