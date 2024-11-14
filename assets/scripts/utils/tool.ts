import * as cc from 'cc';

/**
 * 在一个数组中随机获取一个元素
 * @param arr 数组
 * @returns {any} 随机出来的结果
 */
export const randomArray = (arr: Array<any>): any => {
	var index: number = Math.floor(Math.random() * arr.length);
	return arr[index];
}

/**
* 获取一个区间的随机数
* @param $from 最小值
* @param $end 最大值
* @returns {number}
*/
export const limit = ($from: number, $end: number): number => {
	$from = Math.min($from, $end);
	$end = Math.max($from, $end);
	var range: number = $end - $from;
	return $from + Math.random() * range;
}
/**
 * 获取一个区间的随机数(帧数)
 * @param $from 最小值
 * @param $end 最大值
 * @returns {number}
 */
export const limitInteger = ($from: number, $end: number): number => {
	return Math.round(limit($from, $end));
}
export const removeArray = (arr: any[], item: any) => {
	var index = arr.indexOf(item);
	if (index > -1) {
		arr.splice(index, 1);
	}
}

// 获取链接参数
export function getUrlParams(name:string) {
	const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, "i"); // 定义正则表达式
	const r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]);
	return null;
}

export function getCookie(name:string) {
	const reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
	const arr = document.cookie.match(reg);
	if (arr) {
		return unescape(arr[2]);
	}
	return null;
}

export function setStorage(key:string,value:string|object){
    if(value===''){
        cc.error(`${key} [存储value:${value}] 错误`);
        return;
    }
    let jsonVal=typeof value==='string'?value:JSON.stringify(value);
    cc.sys.localStorage.setItem(key, jsonVal);
}
export function getStorage(key:string,type:'st'|'obj'='st'){
    let jsonVal:string=cc.sys.localStorage.getItem(key);
    if(type==='st'){
        return jsonVal;
    }else if(type==='obj'){
        if(jsonVal)return JSON.parse(jsonVal);
    }
}
export function clearStorage(){
    cc.sys.localStorage.clear();
}