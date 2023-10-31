/**
 * 
 * @param {import("zerespluginlibrary").Plugin} Plugin 
 * @param {import("zerespluginlibrary").BoundAPI} Library 
 * @returns 
 */
module.exports = (Plugin, Library) => {
    const bdapi = new BdApi('NotificationVolume');
    const {Webpack} = bdapi;
    const {Patcher} = Library;

    return class NotificationVolume extends Plugin {
        patches = [];

        onStart() {
            this.patches.push(Patcher.before(Webpack.getModule(Webpack.Filters.byPrototypeFields('_ensureAudio'), {searchExports: true}).prototype, '_ensureAudio', s => {
                s._volume *= this.settings['notifvolume'] / 100;
            }));
        }

        onStop() {
            Patcher.unpatchAll(this.patches);
        }

        getSettingsPanel() {
            const panel = this.buildSettingsPanel();
            panel.onChange = () => { this.saveSettings(this.settings); };
            return panel.getElement();
        }
    };
};