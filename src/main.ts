import {MarkdownParser} from "./parser";
import {Block, ImageBlock} from "./block";
import utils from "./utils";
import path from "path";
import fs from "fs-extra";


class MainLogic {
    private md_parser: MarkdownParser

    constructor() {
        this.md_parser = new MarkdownParser();
    }
    
    // collect all markdown files' images to target dir
    public collect_markdown_images_to_target_dir(md_dir: string, image_dir: string): void {
        // check absolute path
        if (!path.isAbsolute(md_dir) || !path.isAbsolute(image_dir)) {
            console.log("collection markdown images to target dir error: md_dir or image_dir should be absolute path");
            return;
        }

        // check md_dir
        if (utils.is_file(md_dir)) {
            console.log("collect markdown images to target dir error: markdown path is file!");
            return;
        }

        // check image_dir
        if (utils.is_file(image_dir)) {
            console.log("collect markdown images to target dir error: image path is file!");
            return;
        }

        // start move images to target dir
        let md_paths: string[] = utils.collect_files(md_dir, ".md");
        for (let path of md_paths) {
            this.move_image_to_target_dir(path, image_dir);
        }
    }

    // move images markdown document contains and change url
    public move_image_to_target_dir(md_path: string, image_dir: string, target_path?:string): void {
        if (!path.isAbsolute(md_path)) {
            console.log("src_path should be absolute path!");
            return;
        }

        if (target_path && !path.isAbsolute(target_path)) {
            console.log("target_path should be absolute path!");
            return;
        }

        target_path = target_path || md_path;

        let file_content: string = fs.readFileSync(md_path).toString();
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
            let image_path: string = path.resolve(path.dirname(md_path), src);
            let image_base: string = path.basename(image_path);

            // avoid duplicated name
            let image_base1: string = image_base;
            let ext: string = path.extname(image_base);
            let n: number = 1;
            while (fs.existsSync(path.resolve(image_dir, image_base1))) {
                image_base1 = path.basename(image_base).replace(ext, "") + n.toString() + ext;
                n++;
            }

            // do move
            let target_image_path: string = path.resolve(image_dir, image_base1);
            fs.moveSync(image_path, target_image_path);
            block.src = path.relative(path.dirname(target_path), target_image_path);
        }

        // write back to file
        let content: string = this.md_parser.unparse(blocks);
        fs.writeFileSync(target_path, content);
    }
}


let main_logic = new MainLogic();
main_logic.collect_markdown_images_to_target_dir(path.resolve("../test_md"), path.resolve("../test_md/image_new"));