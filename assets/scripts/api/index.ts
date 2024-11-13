import { activityId, BASE_URL } from "../config";
import HttpUtils from "../utils/HttpUtils";

/** 活动初始化 */
export const indexApi = () => HttpUtils.Request(`${BASE_URL}template/index`, { activityId })
