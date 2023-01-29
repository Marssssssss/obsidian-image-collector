import { normalizePath, Plugin } from "obsidian";
import path from "path";

export class ImageManager {
    base_path: string
    plugin: Plugin

    constructor(base_path: string, plugin: Plugin) {
        this.plugin = plugin;
        this.base_path = base_path;
    }

    async reset_path(new_path: string) {
        this.base_path = new_path;
    }

    async make_sure_base_path() {
        if (await this.plugin.app.vault.adapter.exists(normalizePath(this.base_path))) {
            return;
        }
        await this.plugin.app.vault.createFolder(normalizePath(this.base_path));
    }

    async check_image_exists(image_path: string) {
        return await this.plugin.app.vault.adapter.exists(normalizePath(path.join(this.base_path, image_path)));
    }

    async add_image(image_name: string, image_data: ArrayBuffer) {
        await this.make_sure_base_path();
        await this.plugin.app.vault.createBinary(normalizePath(path.join(this.base_path, image_name)), image_data);
    }

    async copy_image(old_image_path: string, image_name: string) {
        await this.make_sure_base_path();

        let new_image_path = path.join(this.base_path, image_name);
        await this.plugin.app.vault.adapter.copy(normalizePath(old_image_path), normalizePath(new_image_path));
        return new_image_path;
    }
}
