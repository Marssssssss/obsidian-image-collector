import {MarkdownParser} from "./parser";
import {} from "./block_handler";
import {Block, ImageBlock} from "./block";
import fs from "fs-extra";


class MainLogic {
    private md_parser: MarkdownParser

    constructor() {
        this.md_parser = new MarkdownParser();
    }
}


let main_logic = new MainLogic();