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

    // collect all images from markdown file which recursively exist in `md_dir`
    public collect_markdown_images_by_file_name(md_dir: string, target_image_dir: string): boolean {
        if (!path.isAbsolute(md_dir)) {
            console.log("collect markdown images by name error: md_dir should be absolute path");
            return false;
        }
        
        if (!path.isAbsolute(target_image_dir)) {
            console.log("collect markdown images by name error: target_image_dir should be absolute path");
            return false;
        }

        if (!utils.is_directory(md_dir)) {
            console.log("collect markdown images by name error: md_dir should be directory");
            return false;
        }

        if (!utils.is_directory(target_image_dir)) {
            console.log("collect markdown images by name error: target_image_dir should be directory");
            return false;
        }

        // collect all possible image ext
        let images: Map<string, Map<string, string[]>> = new Map<string, Map<string, string[]>>();
        let md_paths: string[] = utils.collect_files(md_dir, ".md");
        for (let md_path of md_paths) {
            let file_content: string = fs.readFileSync(md_path).toString();
            let blocks: Block[] | null = this.md_parser.parse(file_content);
            if (blocks == null) {
                continue;
            }
            for (let block of blocks) {
                if (!(block instanceof ImageBlock)) {
                    continue;
                }
                
                // collect images of specified ext name
                // if I have a image path like "C:\\Users\\xxx.png", images will become a Map like {".png": {"xxx.png": ["C:\\Users\\xxx.png"]}}
                let ext_name: string = path.extname(block.src);
                if (!images.has(ext_name)) {
                    images.set(ext_name, new Map<string, string[]>);

                    let ext_map = images.get(ext_name) as Map<string, string[]>;
                    let image_paths: string[] = utils.collect_files(md_dir, ext_name);

                    for (let image_path of image_paths) {
                        let base_name: string = path.basename(image_path);
                        if (ext_map.has(base_name)) {
                            if (!(ext_map.get(base_name) as string[]).includes(image_path))
                                (ext_map.get(base_name) as string[]).push(image_path);
                        } else {
                            ext_map.set(base_name, [image_path]);
                        }
                    }
                }

                // try to move image to target dir
                let base_name: string = path.basename(block.src);
                let target_image_path: string = path.join(target_image_dir, base_name);
                let images_by_ext: Map<string, string[]> = images.get(ext_name) as Map<string, string[]>;
                let images_by_base_name: string[] | undefined = images_by_ext.get(utils.trans_url_space_to_path_space(base_name));

                if (!fs.existsSync(utils.trans_url_space_to_path_space(path.join(target_image_dir, base_name)))) {
                    if (!images_by_base_name) {
                        console.log(`collect markdown images by name error: no image named ${base_name} under ${md_dir}`);
                        continue;
                    }
    
                    if (images_by_base_name.length != 1) {
                        console.log(`collect markdown images by name error: number of ${base_name} under ${target_image_dir} does not equal to 1!`);
                        continue;
                    }

                    let image_path: string = images_by_base_name[0];
                    fs.moveSync(utils.trans_url_space_to_path_space(image_path), utils.trans_url_space_to_path_space(path.join(target_image_dir, base_name)));
                    // delete base_name map, because after move, there must be a same name image in target dir, so we need not to do move once again
                    images_by_base_name.splice(images_by_base_name.indexOf(image_path), 1);
                    images_by_ext.delete(base_name);
                }

                block.src = path.relative(path.dirname(md_path), target_image_path);
            }

            // write markdown file
            let content: string = this.md_parser.unparse(blocks);
            fs.writeFileSync(md_path, content);
        }

        return true;
    }
    
    // collect all markdown files' images to target dir
    public collect_markdown_images_to_target_dir(md_dir: string, image_dir: string): void {
        // check absolute path
        if (!path.isAbsolute(md_dir) || !path.isAbsolute(image_dir)) {
            console.log("collect markdown images to target dir error: md_dir or image_dir should be absolute path");
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
            console.log("move image to target dir error: src_path should be absolute path!");
            return;
        }

        if (target_path && !path.isAbsolute(target_path)) {
            console.log("move image to target dir error: target_path should be absolute path!");
            return;
        }

        if (!utils.is_directory(image_dir)) {
            console.log("move image to target dir error: image_dir should be directory!");
            return;
        }

        if (!utils.is_file(md_path) || (target_path && !utils.is_file(target_path))) {
            console.log("move image to target dir error: md_path and target_path should be file!");
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
            fs.moveSync(utils.trans_url_space_to_path_space(image_path), utils.trans_url_space_to_path_space(target_image_path));
            block.src = path.relative(path.dirname(target_path), target_image_path);
        }

        // write back to file
        let content: string = this.md_parser.unparse(blocks);
        fs.writeFileSync(target_path, content);
    }
}


let main_logic = new MainLogic();
// main_logic.move_image_to_target_dir(path.resolve("../big_test_md/notes/计算机/框架工具学习/笔记工具/Obsidian/Obsidian 插件开发.md"), path.resolve("../big_test_md/new_attachments"));
// main_logic.collect_markdown_images_to_target_dir(path.resolve("../test_md"), path.resolve("../test_md/image_new"));
console.log(main_logic.collect_markdown_images_by_file_name(path.resolve("../big_test_md"), path.resolve("../big_test_md/attachments")));