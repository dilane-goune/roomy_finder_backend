"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
dotenv_1.default.config();
require("./src/functions/firebase");
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("./src/data/constants");
const user_1 = __importDefault(require("./src/routes/user"));
const ads_1 = __importDefault(require("./src/routes/ads"));
const booking_1 = __importDefault(require("./src/routes/booking"));
const fcm_helper_1 = __importDefault(require("./src/classes/fcm_helper"));
mongoose_1.default.set("strictQuery", true);
// database connection
mongoose_1.default
    .connect(constants_1.DATA_BASE_URL)
    .catch(function (e) {
    console.log("SERVER :: ", e);
    process.exit();
});
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use("/public", express_1.default.static(process.cwd() + "/public"));
app.set("view engine", "ejs");
const server = http_1.default.createServer(app);
// Express routes
app.get("/", (req, res) => res.json({ message: "Room Finder" }));
app.use("/api/v1", user_1.default);
app.use("/api/v1/ads", ads_1.default);
app.use("/api/v1/bookings", booking_1.default);
const listenner = server.listen(constants_1.PORT, constants_1.ADDRESS, function () {
    return console.log(`Server running on port ${constants_1.PORT}`);
});
process.on("exit", (_) => listenner.close());
app.get("/test-fcm", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fcm_helper_1.default.sendNofication("new-booking", "cfrmARdETbmpzKMrVVfHuW:APA91bHqfd6veM_Dn0SrEF6_aP4Gp3QsGUF8YcpiPON1G2SNWF9mXdlcPsanoctzmSjidhQNcmKU4yya-Ap6aDGkfd3oWb3XqSMfW9d8tK-RLVlbUOIdIdBm5Ni1eUiD9xYNNPIuGCPB", { tpye: "property" });
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
