import {MarkdownParser} from "./parser";
import {Block, ImageBlock} from "./block";
import path from "path";
import fs from "fs-extra";


class MainLogic {
    private md_parser: MarkdownParser

    constructor() {
        this.md_parser = new MarkdownParser();
    }

    // src path means src markdown file path, dir path means target image dir path
    public move_image_to_target_dir(src_path: string, image_dir: string, target_path?:string): void {
        if (!path.isAbsolute(src_path)) {
            console.log("src_path should be absolute path!");
            return;
        }

        if (target_path && !path.isAbsolute(target_path)) {
            console.log("target_path should be absolute path!");
            return;
        }

        target_path = target_path || src_path;

        let file_content: string = fs.readFileSync(src_path).toString();
        let blocks: Block[] | null = this.md_parser.parse(file_content);
        if (blocks == null) {
            return;
        }

        for (let block of blocks) {
            if (!(block instanceof ImageBlock)) {
                continue;
            }
            // start move to target dir
            let src: string = block.src;
            let image_path: string = path.resolve(path.dirname(src_path), src);
            let image_base: string = path.basename(image_path);
            let target_image_path: string = path.resolve(image_dir, image_base);
            fs.moveSync(image_path, target_image_path);
            block.src = path.relative(path.dirname(target_path), target_image_path);
        }

        // write back to file
        let content: string = this.md_parser.unparse(blocks);
        fs.writeFileSync(target_path, content);
    }
}


let main_logic = new MainLogic();
main_logic.move_image_to_target_dir(path.resolve("../test.md"), path.resolve("../image_to"), path.resolve("../test_new.md"));