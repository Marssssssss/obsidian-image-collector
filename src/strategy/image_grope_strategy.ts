import { Plugin, TFile } from "obsidian";
import path from "path";
import { ImageManager } from "../image_manager";

export interface IImageGropeStrategy {
    tip: string;
    search(plugin: Plugin, image_manager: ImageManager, target_path: string): Promise<string | null>; // Given target image path, return real image path by strategy
}


class AccurateSearch implements IImageGropeStrategy{
    tip: string = `Accurate search strategy will search image by url in markdown exactly.If the url is wrong, then search fail!`;

    async search(plugin: Plugin, _: ImageManager, target_path: string): Promise<string | null> {
        if (!await plugin.app.vault.adapter.exists(target_path))
            return null;
        return target_path;
    }
}


class FileNameSearch implements IImageGropeStrategy {
    tip: string = `File name search strategy will search image by file name in the url. Search root path is vault root path by default`;

    async search(plugin: Plugin, image_manager: ImageManager, target_path: string): Promise<string | null> {
        let base_name: string = path.basename(target_path);
        let extension: string = path.extname(base_name);
        let files: TFile[] = plugin.app.vault.getFiles();

        base_name = base_name.replace(extension, "");
        for (let file of files) {
            if (file.basename === base_name && "." + file.extension === extension && path.relative(image_manager.base_path, file.path).startsWith("..")) {
                return file.path;
            }
        }
        return null;
    }
}


export const ImageGropeStrategy = {
    AccurateSearch: new AccurateSearch(),
    FileNameSearch: new FileNameSearch(),
}
export type ImageGropeStrategyNameType = keyof typeof ImageGropeStrategy;
export const DefaultGropeStrategyName = "AccurateSearch";
export const DefaultGropeStrategy = ImageGropeStrategy[DefaultGropeStrategyName];
