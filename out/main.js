"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
class MainLogic {
    constructor() {
        this.md_parser = new parser_1.MarkdownParser();
    }
}
let main_logic = new MainLogic();
