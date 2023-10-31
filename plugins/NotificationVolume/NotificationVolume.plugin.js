/**
 * @name NotificationVolume
 * @description Separate volume adjustment for notifications
 * @version 1.0.0
 * @author philipbry
 * @authorId 554994003318276106
 * @authorLink https://github.com/philipbry
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/
const config = {
    main: "index.js",
    id: "",
    name: "NotificationVolume",
    author: "philipbry",
    authorId: "554994003318276106",
    authorLink: "https://github.com/philipbry",
    version: "1.0.0",
    description: "Separate volume adjustment for notifications",
    website: "",
    source: "",
    patreon: "",
    donate: "",
    invite: "",
    changelog: [],
    defaultConfig: [
        {
            type: "slider",
            id: "notifvolume",
            name: "Notification Volume",
            note: "Select a volume used for notification sounds",
            min: 0,
            max: 100,
            value: 100,
            markers: [
                0,
                25,
                50,
                75,
                100
            ],
            units: "%"
        }
    ]
};
class Dummy {
    constructor() {this._config = config;}
    start() {}
    stop() {}
}
 
if (!global.ZeresPluginLibrary) {
    BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.name ?? config.info.name} is missing. Please click Download Now to install it.`, {
        confirmText: "Download Now",
        cancelText: "Cancel",
        onConfirm: () => {
            require("request").get("https://betterdiscord.app/gh-redirect?id=9", async (err, resp, body) => {
                if (err) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                if (resp.statusCode === 302) {
                    require("request").get(resp.headers.location, async (error, response, content) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), content, r));
                    });
                }
                else {
                    await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                }
            });
        }
    });
}
 
module.exports = !global.ZeresPluginLibrary ? Dummy : (([Plugin, Api]) => {
     const plugin = (Plugin, Library) => {
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
     return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/