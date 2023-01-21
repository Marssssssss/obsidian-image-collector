import { Plugin } from "obsidian"
import path from "path"

export class ImageManager {
    base_path: string
    plugin: Plugin

    constructor(base_path: string, plugin: Plugin) {
        this.plugin = plugin;
        this.base_path = base_path;
    }

    async check_image_exists(image_path: string) {
        return await this.plugin.app.vault.adapter.exists(path.join(this.base_path, image_path));
    }

    async add_image(image_name: string, image_data: ArrayBuffer) {
        await this.plugin.app.vault.createBinary(path.join(this.base_path, image_name), image_data);
    }

    async copy_image(old_image_path: string, image_name: string) {
        let new_image_path = path.join(this.base_path, image_name);
        await this.plugin.app.vault.adapter.copy(old_image_path, new_image_path);
        return new_image_path;
    }
}
