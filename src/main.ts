import {Plugin} from "obsidian";
import { ImageManager } from "./image_manager";
import { MarkdownParser, Block, ImageBlock } from "./markdown_parser";
import {IImageGropeStrategy, ImageGropeStrategy} from "./strategy/image_grope_strategy";
import {IImageTransferStrategy, ImageTransferStrategy} from "./strategy/image_transfer_strategy";
import utils from "./utils";
import path from "path";

export default class ObsidianImageManager extends Plugin {
    md_parser: MarkdownParser | undefined;
    image_manager: ImageManager | undefined;
    image_grope_strategy: IImageGropeStrategy | undefined;
    image_transfer_strategy: IImageTransferStrategy | undefined;

    async onload() {
        console.log("loading " + this.manifest.name + "name");

        this.md_parser = new MarkdownParser();
        this.image_manager = new ImageManager("./test", this);
        this.image_grope_strategy = ImageGropeStrategy.AccurateSearch;
        this.image_transfer_strategy = ImageTransferStrategy.FollowMarkdownFileName;

        this.register_events();
    }

    register_events() {
        // hook right click context menu
        this.registerEvent(
            this.app.workspace.on("file-menu", (menu, file, source) => {
                if (source !== "file-explorer-context-menu") {
                    return;
                }
                menu
                    .addSeparator()
                    .addItem((item) => {
                        item
                            .setTitle(`IM: Collect images`)
                            .setIcon('plus-circle')
                            .setSection("action")
                            .onClick(async (_) => {
                                if (this.image_manager === undefined) {
                                    return;
                                }
                                let file_stat = await this.app.vault.adapter.stat(file.path);
                                if (file_stat === null) return;
                                else if (file_stat.type === "file") {
                                    this.collect_file_images(file.path);
                                } else if ( file_stat.type === "folder") {
                                    this.collect_folder_images(file.path);
                                }
                            });
                    });
            })
        );
    }

    async collect_file_images(file_path: string) {
        if (this.image_manager === undefined || this.md_parser === undefined)
            return;
        if (path.extname(file_path) !== ".md")
            return;
        this._collect_file_images(file_path);
    }

    async collect_folder_images(dir_path: string) {
        if (this.image_manager === undefined || this.image_manager === undefined)
            return;

        let listed_info = await this.app.vault.adapter.list(dir_path);
        let listed_files = listed_info.files;
        let listed_folders = listed_info.folders;
        for (let index in listed_files) {
            let file_path = listed_files[index];
            if (path.extname(file_path) !== ".md")
                continue;
            this._collect_file_images(file_path);
        }
        for (let index in listed_folders) {
            let folder_path = listed_folders[index];
            this.collect_folder_images(folder_path);
        }
    }

    private async _collect_file_images(file_path: string) {
        let file_content = await this.app.vault.adapter.read(file_path);
        let blocks: Block[] | null | undefined = this.md_parser?.parse(file_content);
        if (blocks === null || blocks === undefined)
            return;

        let old_dir_path = path.dirname(file_path);
        for (let block of blocks) {
            if (!(block instanceof ImageBlock)) {
                continue;
            }

            let image_src = utils.trans_url_space_to_path_space(block.src);
            let old_image_path = await this.image_grope_strategy?.search(this, path.join(old_dir_path, image_src));
            if (old_image_path === null)
                continue;

            let new_image_path = await this.image_transfer_strategy?.transfer(this, this.image_manager as ImageManager, file_path, image_src);
            if (new_image_path === null)
                continue;
            block.src = utils.trans_path_space_to_url_space(path.relative(old_dir_path, new_image_path as string));
        }

        let new_md_content = this.md_parser?.unparse(blocks);
        new_md_content && this.app.vault.adapter.write(file_path, new_md_content);
    }
}
