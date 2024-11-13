import * as cc from 'cc';
import { TableView } from "../../../component";
const { ccclass, property } = cc._decorator;

let ICONS = [
    "arrContinuous",
    "arrowDouble",
    "arrowFire",
    "arrowice",
    "arrowLaunch",
    "arrowLightning",
    "arrowPenetrate",
    "arrowRebound",
    "arrowReverse",
]

const ICON_SIZE = ICONS.length;

@ccclass('TableViewDrawcallTest')
export class TableViewDrawcallTest extends cc.Component {

    @property(TableView)
    private listview : TableView = null!;

    start() {
        let listdata = [];
        for(let i = 0; i < 100; i++)
        {
            let idx = i;
            // console.log("index", i, idx);

            let item = {
                name : ICONS[idx],
                icon : `test#skillIcon/${ICONS[idx]}`,
                num : 3,
                total : 300,
            }
            listdata.push(item);
        }
        // console.log("litdata", listdata)
        this.listview.setData(listdata);
        this.listview.reloadData();
    }

}