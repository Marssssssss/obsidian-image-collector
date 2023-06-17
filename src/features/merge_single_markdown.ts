import {Plugin, normalizePath} from "obsidian";
import {Block, ImageBlock, Base64PngLinkBlock} from "../markdown_parser";
import { ImageManager } from "../image_manager";
import utils from "../utils";
import { ImageGropeStrategy, ImageGropeStrategyNameType } from "../strategy/image_grope_strategy";
import path from "path";


async function merge_single_markdown(plugin: Plugin, md_path: string) {
    var blocks: Block[] = (plugin as any).md_parser.parse(await plugin.app.vault.adapter.read(normalizePath(md_path)));
    if (blocks === null) {
        console.log("merge failed!");
        return;
    }
    
    // iter all blocks
    for (let block of blocks) {
        if (!(block instanceof ImageBlock)) {
            continue;
        }

        // find image
        let dir_path = path.dirname(md_path);
        let strategy_name = (plugin as any).settings?.image_grope_strategy;
        let image_path = await ImageGropeStrategy[strategy_name as ImageGropeStrategyNameType]?.search(
            plugin, 
            (plugin as any).image_manager as ImageManager, 
            path.join(dir_path, utils.decode_markdown_uri(block.src))
        );
        if (!image_path)
            continue;

        // read image

    }
}
