import { Plugin } from "obsidian";

export interface IImageGropeStrategy {
    search(plugin: Plugin, target_path: string): Promise<string | null> // Given target image path, return real image path by strategy
}


class AccurateSearch implements IImageGropeStrategy{
    // Accurate search strategy will search image by url in markdown exactly.
    // If the url is wrong, then search fail!
    async search(plugin: Plugin, target_path: string) {
        if (!plugin.app.vault.adapter.exists(target_path))
            return null;
        return target_path;
    }
}

export var ImageGropeStrategy = {
    AccurateSearch: new AccurateSearch(),
}