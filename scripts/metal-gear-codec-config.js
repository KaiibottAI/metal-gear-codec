const moduleName = 'metal-gear-codec'

class MGSCodec extends Application {

    constructor(data = {}, options = {}) {
        super(options);
        this._setData(data);
    }

    _setData(data) {
        this.leftPortrait = "modules/metal-gear-codec/images/snake.jpg" //"modules/metal-gear-codec/images/static.gif";
        this.rightPortrait = data?.img || "modules/metal-gear-codec/images/static.gif";
        this.name = data?.name || 'Snaaaaake (you should not see this, blame the dev)';
        this.frequency = frequencyOptions[Math.floor(Math.random() * frequencyOptions.length)];
        this.text = dialogueOptions[Math.floor(Math.random() * dialogueOptions.length)];
    }

    getData() {
        return {
            leftPortrait: this.leftPortrait,
            rightPortrait: this.rightPortrait,
            name: this.name,
            frequency: this.frequency,
            text: this.text
        };
    }

    updateData(data) {
        this._setData(data);
        if (this.rendered) {
            this.render(true, { focus: false }); // re-render with new context
        }
    }

    // Please help, I don't know how to get some default stuff to stick. I have it down in the ready hook since I can't figure it :D
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: moduleName,
            title: 'MGS-Codec',
            resizable: false,
            width: 800,
            height: 350,
            fontsize: 16,
            template: `modules/${moduleName}/templates/metal-gear-codec-screen.html`,
            classes: ["metal-gear-codec"]
        });
    }

    activateListeners(html) {
        super.activateListeners(html);

        const $barsCon = html.find('#bars-con');
        const $barWidth = $barsCon.children();

        // Set initial widths
        for (let i = 0; i < $barWidth.length; i++) {
            $barWidth.eq(i).css('width', 10 * ($barWidth.length - i) + '%');
        }

        // Bar color animation
        let bSignal = $barWidth.length;
        let signalCount = bSignal;
        let dBar = true;
        let endFunc = false;
        let running = false;

        function barSignal(chk = false) {
            if (!running || chk) {
                setTimeout(() => {
                    running = true;
                    if (dBar) {
                        // bar turns on
                        signalCount--;
                        $barWidth.eq(signalCount).css('background-color', 'var(--mgs-codec-bar-on)');
                        if (signalCount === 0) dBar = false;
                    } else {
                        // bar turns off
                        signalCount++;
                        $barWidth.eq(signalCount).css('background-color', 'var(--mgs-codec-bar-off)');
                        if (signalCount === bSignal) {
                            dBar = true;
                            if (endFunc) {
                                running = false;
                                return;
                            }
                        }
                    }
                    barSignal(true);
                }, 100);
            }
        }

        barSignal();
        $barWidth.eq(0).css('display', 'none'); // optional
    }

};

// array of strings that go in the middle of the codec
const dialogueOptions = [
    'DATA SYNC IN PROGRESS',
    'PACKET DELIVERY CONFIRMED',
    'ENCRYPTED PAYLOAD DEPLOYED',
    'FILE TRANSFER COMPLETE',
    'MEMORY CORES LINKED',
    'SYNCING DATA MODULES',
    'ARCHIVE ACCESSED',
    'FILE SYSTEM ONLINE',
    'DATA STREAM INTEGRATED',
    'INFORMATION LINK STABLE',
    'COMMUNICATIONS ONLINE',
    'TRANSMISSION IN PROGRESS',
    'SIGNAL BROADCASTING',
    'RECEIVING UPLINK',
    'MESSAGE RECEIVED',
    'DATA STREAM ACTIVE',
    'AUDIO FEED LINKED',
    'LIVE FEED ENGAGED',
    'UPLINK CONFIRMED',
    'OPENING CHANNEL',
    'BEACON EMITTING',
    'TRANSMISSION COMPLETE',
    'REPLY SIGNAL RECEIVED',
    'SECURE CHANNEL CONNECTING',
    'SECURE LINK ESTABLISHED',
    'TRANSMISSION LINKED',
    'ENCRYPTED LINK ACTIVE',
    'HANDSHAKE COMPLETE',
    'SIGNAL ACQUIRED',
    'AUTHENTICATION ACCEPTED',
    'PROTOCOL SYNCHRONIZED',
    'CYBERLINK INITIATED',
    'CONNECTION ENCRYPTED',
    'FREQUENCY LOCKED',
    'ENCRYPTION VERIFIED',
    'COMM TUNNEL STABILIZED',
    'SECURE PORT ENGAGED',
    'CHANNEL OMEGA ONLINE'
]

// frequency number choices for fun
const frequencyOptions = [
    "420.69",
    "111.11",
    "69.69",
    "57.89",
    "123.45",
    "89.98",
    "199.7"
]

// toggle the MGSCodec window
function toggleCodecScreen(tokenUUID) {

    const foundToken = game.actors.get(tokenUUID);

    // Ensure an instance exists
    // courtesy of @mxzf from FoundryVTT Discord 
    // JS has a fun little ??= operator, nullish coalescing assignment, which says "if this thing exists, cool; if it doesn't, assign this to it"
    ui['MGSCodec'] ??= new MGSCodec(foundToken);
    // If it's already rendered, close it (this doesn't delete it, it simply closes the app)
    // ui.MGSCodec.updateData(foundToken)

    if (ui.MGSCodec.rendered) {
        ui.notifications.info(`${moduleName} | Ending codec transmission`);
        ui.MGSCodec.close();
    }
    else {
        // Otherwise, if it's not rendered, render it
        ui.notifications.info(`${moduleName} | Recieving codec transmission`);
        ui.MGSCodec.updateData(foundToken)
        ui.MGSCodec.render(true);
    };
};

// toggle the codec window open/closed
function applyCodecTheme(theme) {
    game.settings.set(moduleName, 'codecTheme', theme);
    document.documentElement.setAttribute('data-mgs-codec-theme', theme);
};

// socket to open the codec screen for everyone
function openCodecForAll() {

    if (game.user !== game.users.activeGM) {
        ui.notifications.warn(`${moduleName} | Only the GM can open the codec for everyone`)
        return;
    }
    // else {
    //     ui.notifications.info(`${moduleName} | Sending Codec to everyone`);
    // };

    // Get Selected token
    function getSelectedTokensForCodec() {
        const selectedToken = canvas.tokens.controlled[0];
        return selectedToken;
    };

    const tokenForCodecScreen = getSelectedTokensForCodec()

    // ui.notifications.warn(`${moduleName} | working token uuid of ${tokenForCodecScreen?.actor._id}`)

    // socket that sends the 'open' command to the other clients
    game.socket.emit(`module.${moduleName}`, {
        action: "openCodec",
        data: {
            token: tokenForCodecScreen?.actor._id
        }
    });

    // open the codec for the initiator as well
    toggleCodecScreen(tokenForCodecScreen?.actor._id);
};

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
        if (payload.action === "openCodec") {
            // ui.notifications.info(`${moduleName} | Recieving codec transmission`);
            // ui.notifications.warn(`${moduleName} | Working token uuid of ${payload.data.token}`);
            toggleCodecScreen(payload.data.token);
        };
    });

    // Added these all down here since this is how I could get the settings to be 'retained' upon reloading. I still do not understand it.
    applyCodecTheme(game.settings.get(moduleName, 'codecTheme'));

});