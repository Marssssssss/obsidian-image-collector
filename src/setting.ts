import { PluginSettingTab, Setting } from "obsidian";
import { DefaultGropeStrategyName, ImageGropeStrategy, ImageGropeStrategyNameType } from "./strategy/image_grope_strategy"
import { DefaultTransferStrategyName, IImageTransferStrategy, ImageTransferStrategy, ImageTransferStrategyNameType } from "./strategy/image_transfer_strategy"


export class ObsidianImageManagerSettingsTab extends PluginSettingTab {
    display(): void {
        const { containerEl } = this;
        const plugin = (this as any).plugin;
        
        containerEl.empty();
        
        // Collect Settings
        containerEl.createEl("h2", { text: "Collect Settings"});

        let grope_strategy_tip = "The strategy used when finding a image by url.";
        let grope_strategy_el = new Setting(containerEl)
            .setName("Image Grope Strategy")
            .setDesc(grope_strategy_tip)
            .addDropdown((dropdown) => {
                Object.keys(ImageGropeStrategy).forEach((strategy_name, _, __) => {
                    dropdown.addOption(strategy_name, strategy_name);
                });
                dropdown.setValue(plugin.settings.image_grope_strategy);
                dropdown.onChange(async (option) => {
                    plugin.settings.image_grope_strategy = option;
                    plugin.saveData();
                });
            });

        let translate_strategy_tip = "The strategy used when transfer origin image to target path, and the path is dictated by strategy.";
        let translate_strategy_el = new Setting(containerEl)
            .setName("Image Transfer Strategy")
            .setDesc(translate_strategy_tip)
            .addDropdown((dropdown) => {
                Object.keys(ImageTransferStrategy).forEach((strategy_name, _, __) => {
                    dropdown.addOption(strategy_name, strategy_name);
                });
                dropdown.setValue(plugin.settings.image_transfer_strategy);
                dropdown.onChange(async (option) => {
                    plugin.settings.image_transfer_strategy = option;
                    plugin.saveData();
                })
            });
        
        containerEl.onClickEvent((_) => {
            grope_strategy_el.setDesc(ImageGropeStrategy[plugin.settings.image_grope_strategy as ImageGropeStrategyNameType].tip || grope_strategy_tip);
            translate_strategy_el.setDesc(ImageTransferStrategy[plugin.settings.image_transfer_strategy as ImageTransferStrategyNameType].tip || translate_strategy_tip);
        });
    }
}


export interface ObsidianImageManagerSettings {
    image_grope_strategy: string,
    image_transfer_strategy: string,
}

export const DEFAULT_SETTINGS: ObsidianImageManagerSettings = {
    image_grope_strategy: DefaultGropeStrategyName,
    image_transfer_strategy: DefaultTransferStrategyName,
}
