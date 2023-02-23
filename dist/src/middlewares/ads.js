"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueryModifier = void 0;
function createQueryModifier(req, res, next) {
    req.query["address.city"] = req.query.city;
    delete req.query.city;
    next();
}
exports.createQueryModifier = createQueryModifier;
