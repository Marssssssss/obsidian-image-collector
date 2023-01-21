import { Plugin } from "obsidian"
import { ImageManager } from "../image_manager";
import path from "path";

export interface IImageTransferStrategy {
    transfer(plugin: Plugin, image_manager: ImageManager, md_path: string, origin_image_src: string): Promise<string | null> // transfer old image to new place by strategy with some params, return new image path
}


class FollowMarkdownFileName implements IImageTransferStrategy{
    // This strategy will use markdown file name for renaming image name
    // If image has existed, the name will split by a increasingly number
    async transfer(plugin: Plugin, image_manager: ImageManager, md_path: string, origin_image_src: string){   
        let origin_image_path = path.join(path.dirname(md_path), origin_image_src); 
        let image_name = path.basename(origin_image_src);
        let image_ext = path.extname(origin_image_src);
        let inc_num = 1;
        let file_base_name = path.basename(md_path);

        if (path.relative(path.join(image_manager.base_path, image_name), origin_image_path) === "")
            return null;

        file_base_name = file_base_name.replace(path.extname(file_base_name), "");
        image_name = file_base_name + image_ext;
        while (await image_manager.check_image_exists(image_name)) {
            image_name = file_base_name  + inc_num.toString() + image_ext;
            inc_num += 1;
        }

        let new_image_path = await image_manager.copy_image(origin_image_path, image_name);
        plugin.app.vault.adapter.remove(origin_image_src);
        return new_image_path;
    }
}

export var ImageTransferStrategy = {
    FollowMarkdownFileName: new FollowMarkdownFileName(),
}