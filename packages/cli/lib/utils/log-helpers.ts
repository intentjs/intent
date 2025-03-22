import pc from "picocolors";
import { getTime } from "./helpers.js";

export const TIMESTAMP_LOG_PREFIX = pc.gray(`[${getTime()}] `);

export const SWC_DEBUG_LOG_PREFIX =
  TIMESTAMP_LOG_PREFIX + pc.bgWhite(pc.black(" SWC "));

export const TSC_DEBUG_LOG_PREFIX =
  TIMESTAMP_LOG_PREFIX + pc.bgWhite(pc.black(" TSC "));

export const TSC_LOG_PREFIX = TIMESTAMP_LOG_PREFIX + pc.bgRed(pc.bold(" TSC "));

export const INTENT_LOG_PREFIX =
  TIMESTAMP_LOG_PREFIX + pc.bgRed(pc.black(" INTENT "));
