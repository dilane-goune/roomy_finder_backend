export interface IAppVersion {
  version: string;
  url: string;
  platform: "ANDROID" | "IOS";
  releaseDate: Date;
  releaseType: "ALPHA" | "BETA";
}

export interface IFeedBack {
  message: string;
  userName: string;
  creetedAt: Date;
}
