"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultMessaging = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const config = {
    "type": "service_account",
    "project_id": "room-finder-54b9e",
    "private_key_id": "9b94913fc97c4a23b025d7b898c8e2258b54a7da",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDnkAnG8m7ra6G+\ndasEqKr/aLwEHwLLY21n+PcvWe+c6jLMp6wJXd9aHbQ4+kCyg+bd1VWENLSgmuLx\nTZ/2pniq7JCZ3/954obmGOxqlhg3z4qID7Gb2uZN1lESGgWJSv+NB8g54mUeoNJX\n2wpwXOmWLEREfHLx5RL8vCQXpO2dz3b8axtk0zRNWLZSeS6JhRnviuLKXySToRct\nVrp75SudAAbVd6QFLXE/Bs6jsCHIgNM/kTJoB6OIKdLM7wmOPNLRGgAKyB0b9MFW\n8WkkYdnVrLYIOP1tWDND2JWQUGaMbjCufosduYxnCOS+AHeJNLeTKm/0P/2NcMxa\nWNhu1EQTAgMBAAECggEAVns465BHVK0R7yvK/yZvFoxrC675QDSV+6rDxm90Sco9\nxqkoWycv71wAnvb3irQwWND/6ywz+XdfIne3Mkrh7hQDvTQnGcI8V1sfkH8V9GIS\nftY9otOSB6fvBy+ouanE30r0wImI8nNlm2I299f7dRZ7OIix9R10hedOI3Z5N+I5\ntJCvFiQJ4VSl3fAXjbompuQEQJnmZa5Yu/SkzUN14hYsUz/Mwu+esWqxXSOCAHHk\najzLbGn97tvEhYaXXGpBMsJSd9IQbLusoi2qlF/9YsiWEXD/9JV5xPdkVBxOLnkM\na8F/+PJ0jDbXyJo0wqYS8B1IzS8qiJ3GD/9RTMAQYQKBgQD8u1kKktrNtnVGeedY\nOonSInyRccdR0Re+iBRt+ut3PPghN89AzAPVmbqj77PeFmpreX9D8VAN4Y2zyld7\nQp+DLLU5tajtrvIK7AaBASVtvCBLMsqQLiEPVGUKyymzp054G3L4/sfZ7UeKjuT4\ne0dav0cYIFGTJLa6xDaNh94X/wKBgQDqjpx3P80kI1mtJt4sg+3jgc4mH0EFrgdV\ncR2kTK0xnl4DjmLQDeYxE4X00aN+2oDJoP1p/tbwDS0XrNXs5iSi+H2npMYR8YHM\nfPeTUBmjK4SLBuRvHO+d0pJcwTY8+DWntKl3UdWRL/Ybz51iuM0hsHMrNDLHtSjd\n24blko/z7QKBgQCeUz+UwCsSdBtD61pii0mLus8OzphvSO33Doi93VNlf2xyYuQT\nU7uTNJsX2DJ2DtTcP2Daz3G3QHXlC/2B2lrTck6VuJf7Tn2TGgl5B57K/++7LDZ5\n3GwZjmU+PcgCI+2kkI2WLwZEH8GRq7MFdzVcRDflhVmVNIrEteb3Awa/QQKBgQCi\nUYiz+YIUVSZU7kXoFnCE9apctVpA/Pr0RPBXZ/yfDtJOsbVt94BqS/Fyx7TWL43a\ner+EH6hMvUGMVb5BT87gvQfwANZVSoUhpwWJe3ASfCYgM+fXgPXNiRBigg7vyHER\nGrP/77DU5ZTyEA4BaJQEkWBR8LCHhbW/OpEyw+c8zQKBgCL5nt1TVCTkIu/adlbX\nYkdmmRNK/ECZwTbEzy+KZryzJpuVf7iILYi99nhDymFoxgQwJvhd6XWexyefqN6n\nu3EMGD9JT4ymow9B39iK+aA629AqjnFzb4uQ7QZWbSgk7dDvqU+BAGCnacDWO6bo\n+g6o2VFXzrkjPvJ15+/Clq5Y\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-cuse4@room-finder-54b9e.iam.gserviceaccount.com",
    "client_id": "113237996776525226963",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-cuse4%40room-finder-54b9e.iam.gserviceaccount.com",
};
const app = firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(config),
});
exports.defaultMessaging = firebase_admin_1.default.messaging(app);
