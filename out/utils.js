"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reg_exp_escape = void 0;
function reg_exp_escape(raw_str) {
    return raw_str.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}
exports.reg_exp_escape = reg_exp_escape;
