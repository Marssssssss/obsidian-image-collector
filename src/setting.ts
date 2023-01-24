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

        new Setting(containerEl)
            .setName("Image Root Path")
            .setDesc("Collect all images here~")
            .addText((text_field) => {
                text_field
                    .setValue(plugin.settings.image_root_path)
                    .onChange(async (text) => {
                        plugin.settings.image_root_path = text;
                        plugin.image_manager.reset_path(plugin.settings.image_root_path);
                        plugin.save_settings();
                    });
            });

        let grope_strategy_el = new Setting(containerEl)
            .setName("Image Grope Strategy")
            .setDesc(ImageGropeStrategy[plugin.settings.image_grope_strategy as ImageGropeStrategyNameType].tip)
            .addDropdown((dropdown) => {
                Object.keys(ImageGropeStrategy).forEach((strategy_name, _, __) => {
                    dropdown.addOption(strategy_name, strategy_name);
                });
                dropdown.setValue(plugin.settings.image_grope_strategy);
                dropdown.onChange(async (option) => {
                    plugin.settings.image_grope_strategy = option;
                    plugin.save_settings();
                });
            });

        let translate_strategy_el = new Setting(containerEl)
            .setName("Image Transfer Strategy")
            .setDesc(ImageTransferStrategy[plugin.settings.image_transfer_strategy as ImageTransferStrategyNameType].tip)
            .addDropdown((dropdown) => {
                Object.keys(ImageTransferStrategy).forEach((strategy_name, _, __) => {
                    dropdown.addOption(strategy_name, strategy_name);
                });
                dropdown.setValue(plugin.settings.image_transfer_strategy);
                dropdown.onChange(async (option) => {
                    plugin.settings.image_transfer_strategy = option;
                    plugin.save_settings();
                })
            });
        
        containerEl.on("change", "*", (_, __) => {
            grope_strategy_el.setDesc(ImageGropeStrategy[plugin.settings.image_grope_strategy as ImageGropeStrategyNameType].tip);
            translate_strategy_el.setDesc(ImageTransferStrategy[plugin.settings.image_transfer_strategy as ImageTransferStrategyNameType].tip);
        });
    }
}


export interface ObsidianImageManagerSettings {
    image_grope_strategy: string,
    image_transfer_strategy: string,
    image_root_path: string,
}

export const DEFAULT_SETTINGS: ObsidianImageManagerSettings = {
    image_grope_strategy: DefaultGropeStrategyName,
    image_transfer_strategy: DefaultTransferStrategyName,
    image_root_path: "images",
}
