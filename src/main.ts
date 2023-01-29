import { normalizePath, Plugin } from "obsidian";
import { ImageManager } from "./image_manager";
import { MarkdownParser, Block, ImageBlock } from "./markdown_parser";
import { ImageGropeStrategy, ImageGropeStrategyNameType } from "./strategy/image_grope_strategy";
import { ImageTransferStrategy, ImageTransferStrategyNameType } from "./strategy/image_transfer_strategy";
import utils from "./utils";
import path from "path";
import { DEFAULT_SETTINGS, ObsidianImageCollectorSettings, ObsidianImageCollectorSettingsTab } from "./setting";


export default class ObsidianImageCollector extends Plugin {
    settings: ObsidianImageCollectorSettings | undefined;
    md_parser: MarkdownParser | undefined;
    image_manager: ImageManager | undefined;

    async onload() {
        console.log("loading " + this.manifest.name + "name");
        await this.load_settings()

        this.md_parser = new MarkdownParser();
        this.image_manager = new ImageManager(this.settings?.image_root_path as string, this);

        this.register_events();

        this.addSettingTab(new ObsidianImageCollectorSettingsTab(this.app, this));
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
                                let file_stat = await this.app.vault.adapter.stat(normalizePath(file.path));
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

    async load_settings() {
        let data: ObsidianImageCollectorSettings = await this.loadData();
        if (data == undefined) {
            data = {} as any;
        }
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    }

    async save_settings() {
        await this.saveData(this.settings);
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

        let listed_info = await this.app.vault.adapter.list(normalizePath(dir_path));
        let listed_files = listed_info.files;
        let listed_folders = listed_info.folders;
        for (let index in listed_files) {
            let file_path = listed_files[index];
            if (path.extname(file_path) !== ".md")
                continue;
            await this._collect_file_images(file_path);
        }
        for (let index in listed_folders) {
            let folder_path = listed_folders[index];
            this.collect_folder_images(folder_path);
        }
    }

    private async _collect_file_images(file_path: string, file_content?: string) {
        if (!file_content) {
            file_content = await this.app.vault.adapter.read(normalizePath(file_path));
        }

        let blocks: Block[] | null | undefined = this.md_parser?.parse(file_content);
        if (blocks === null || blocks === undefined)
            return;

        let old_dir_path = path.dirname(file_path);
        for (let block of blocks) {
            if (!(block instanceof ImageBlock)) {
                continue;
            }

            let strategy_name = this.settings?.image_grope_strategy;
            if (!strategy_name) {
                // error
                continue;
            }
            let old_image_path = await ImageGropeStrategy[strategy_name as ImageGropeStrategyNameType]?.search(this, this.image_manager as ImageManager, path.join(old_dir_path, utils.decode_markdown_uri(block.src)));
            if (!old_image_path)
                continue;

            strategy_name = this.settings?.image_transfer_strategy;
            if (!strategy_name) {
                // error
                continue
            }
            let new_image_path = await ImageTransferStrategy[strategy_name as ImageTransferStrategyNameType]?.transfer(this, this.image_manager as ImageManager, file_path, old_image_path);
            if (!new_image_path)
                continue;
            block.src = utils.encode_markdown_uri(path.relative(old_dir_path, new_image_path as string));
        }

        let new_md_content = this.md_parser?.unparse(blocks);
        new_md_content && this.app.vault.adapter.write(normalizePath(file_path), new_md_content);
    }
}
