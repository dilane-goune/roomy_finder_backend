"use strict";
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
const index_1 = __importDefault(require("./src/routes/booking/index"));
const utils_1 = __importDefault(require("./src/routes/utils"));
const webhooks_1 = __importDefault(require("./src/webhooks"));
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
app.use((req, res, next) => {
    if (req.originalUrl.includes("/webhooks/stripe")) {
        express_1.default.raw({ type: "application/json" })(req, res, next);
    }
    else {
        express_1.default.json()(req, res, next);
    }
});
app.use("/public", express_1.default.static(process.cwd() + "/public"));
app.set("view engine", "ejs");
const server = http_1.default.createServer(app);
// Express routes
app.get("/", (req, res) => res.json({ message: "Room Finder" }));
app.use("/api/v1", user_1.default);
app.use("/api/v1/ads", ads_1.default);
app.use("/api/v1/bookings", index_1.default);
app.use("/api/v1/utils", utils_1.default);
app.use("/api/v1/webhooks", webhooks_1.default);
const listenner = server.listen(constants_1.PORT, constants_1.ADDRESS, function () {
    return console.log(`Server running on port ${constants_1.PORT}`);
});
process.on("exit", (_) => listenner.close());
// Public routes
app.get("/rent-payemt/success", (req, res) => {
    res.sendFile(process.cwd() + "/public/rent_payment_success.html");
});
app.get("/rent-payemt/cancel", (req, res) => {
    res.sendFile(process.cwd() + "/public/rent_payment_cancel.html");
});
