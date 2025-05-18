const moduleName = 'metal-gear-codec'

class MGSCodec extends Application {

    // Please help, I don't know how to get some default stuff to stick. I have it down in the ready hook since I can't figure it :D
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: moduleName,
            title: 'MGS-Codec',
            resizable: false,
            width: 800,
            height: 400,
            fontsize: 16,
            template: "modules/metal-gear-codec/templates/metal-gear-codec-screen.html",
            classes: ["metal-gear-codec"]
        });
    }

    getData() {
        return {
            leftPortrait: "modules/metal-gear-codec/images/static.gif",
            rightPortrait: "modules/metal-gear-codec/images/static.gif",
            name: "Solid Snake",
            frequency: "140.85",
            text: "This is Snake. Colonel, can you hear me?"
        };
    }

};


// open/close the MGSCodec window
function toggleCodecScreen() {
    // Ensure an instance exists
    // courtesy of @mxzf from FoundryVTT Discord 
    // JS has a fun little ??= operator, nullish coalescing assignment, which says "if this thing exists, cool; if it doesn't, assign this to it"
    ui['MGSCodec'] ??= new MGSCodec();
    // If it's already rendered, close it (this doesn't delete it, it simply closes the app)
    if (ui.MGSCodec.rendered) ui.MGSCodec.close();
    // Otherwise, if it's not rendered, render it
    else ui.MGSCodec.render(true);
};

// toggle the codec window open/closed
function applyCodecTheme(theme) {
    game.settings.set(moduleName, 'codecTheme', theme);
    document.documentElement.setAttribute('data-mgs-codec-theme', theme);
};

// socket to open the codec screen for everyone
function openCodecForAll() {
    ui.notifications.warn(`${moduleName} | Trying to send codec to all`);

    // socket that sends the 'open' command to the other clients
    game.socket.emit(`module.${moduleName}`, {
        action: "openCodec"
    });

    // open the codec for the initiator as well
    toggleCodecScreen();
}

Hooks.once("init", () => {

    // Set up all the module settings
    game.settings.register(moduleName, 'codecTheme', {
        name: 'Codec Theme',
        hint: 'Collection of pre-made themes for the Codec to have a unique style',
        scope: 'world',
        config: true,
        type: String,
        choices: {
            "classic": "Classic",
            "cyberpunk-red": "CyberpunkRED",
            "deep-blue": "Deep Blue",
            "fallout-nuclear": "Fallout Terminal Green"
        },
        default: 'classic',
        onChange: (value) => {
            applyCodecTheme(value)
        },
        requiresReload: false
    });
});

Hooks.once("ready", () => {

    // sockets
    game.socket.on(`module.${moduleName}`, (payload) => {
        ui.notifications.warn(`${moduleName} | recieved socket transmission`);
        if (payload.action === "openCodec") {
            toggleCodecScreen()
        }
    });

    // Added these all down here since this is how I could get the settings to be 'retained' upon reloading. I still do not understand it.
    applyCodecTheme(game.settings.get(moduleName, 'codecTheme'));

});