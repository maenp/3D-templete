import { getCookie, getEnvType, getUrlParams } from "../utils/tool";
export const HOST = 'https://biz-vip.immomo.com';
export const TEST_HOST = 'https://test-biz-vip.immomo.com';
export const BASE_URL = '/vCenter/';

export const LOG_CLASS = 'Red';
export const activityId = 'vip_red_rain';

export class GameConfig{
	static envType = getEnvType();
	// static token = getCookie("momo_csrf_token");
	// static category = getUrlParams("category");
	// static scene_id = getUrlParams("scene_id");
	static source = getUrlParams("source");
	static shareId = getUrlParams("shareId");
}