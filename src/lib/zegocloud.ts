import { ZegoExpressEngine } from "zego-express-engine-webrtc";

export const zg = new ZegoExpressEngine(
	parseInt(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID ?? ""),
	process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER ?? ""
);
