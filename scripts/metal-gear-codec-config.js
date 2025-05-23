const moduleMGSCodecName = 'metal-gear-codec';

class MGSCodec extends Application {

    constructor(data = {}, options = {}) {
        super(options);
        this._setData(data);
    }

    _setData({ leftId = null, rightId = null } = {}) {
        const leftActor = leftId ? game.actors.get(leftId) : null;
        const rightActor = rightId ? game.actors.get(rightId) : null;

        this.leftPortrait = leftActor?.img || "modules/metal-gear-codec/images/static.gif";
        this.leftName = leftActor?.name || "???";

        this.rightPortrait = rightActor?.img || "modules/metal-gear-codec/images/static.gif";
        this.rightName = rightActor?.name || "???";

        this.name = leftActor?.name || rightActor?.name || '???';
        this.frequency = frequencyOptions[Math.floor(Math.random() * frequencyOptions.length)];
        this.text = dialogueOptions[Math.floor(Math.random() * dialogueOptions.length)];
    }

    getData() {
        return {
            leftPortrait: this.leftPortrait,
            leftName: this.leftName,
            rightPortrait: this.rightPortrait,
            rightName: this.rightName,
            name: this.name,
            frequency: this.frequency,
            text: this.text
        };
    }

    updateData(data) {
        this._setData(data);
        if (this.rendered) {
            this.render(true, { focus: false });
        }
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: moduleMGSCodecName,
            title: 'INCOMING COMMUNICATION',
            resizable: false,
            width: 800,
            height: 350,
            fontsize: 16,
            template: `modules/${moduleMGSCodecName}/templates/metal-gear-codec-screen.html`,
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
        $barWidth.eq(0).css('display', 'none');
    }
}

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
];

// frequency number choices for fun
const frequencyOptions = [
    "420.69",
    "111.11",
    "69.69",
    "57.89",
    "123.45",
    "89.98",
    "199.7"
];

// Show or toggle the Codec screen using one or two actor IDs
function _showCodecForIds(actorIds = []) {
    // handles which side the images go to
    const data = actorIds.length === 1
        ? { leftId: null, rightId: actorIds[0] }
        : { leftId: actorIds[0] || null, rightId: actorIds[1] || null };


    ui['MGSCodec'] ??= new MGSCodec(data);

    if (ui.MGSCodec.rendered) {
        ui.notifications.info(`${moduleMGSCodecName} | Ending Transmission`);
        return ui.MGSCodec.close();
    }

    ui.notifications.info(`${moduleMGSCodecName} | Receiving Transmission`);
    ui.MGSCodec.updateData(data);
    ui.MGSCodec.render(true);
}

// Called by GM to open codec window for all users
function openCodecForAll() {
    if (game.user !== game.users.activeGM) {
        return ui.notifications.warn(`${moduleMGSCodecName} | Only the GM can open the codec for everyone`);
    }

    const controlled = canvas.tokens.controlled.slice(0, 2);
    const actorIds = controlled.map(t => t.actor.id);

    game.socket.emit(`module.${moduleMGSCodecName}`, {
        action: "openCodec",
        data: { actorIds }
    });

    _showCodecForIds(actorIds);
}

// Apply the selected theme
function applyCodecTheme(theme) {
    game.settings.set(moduleMGSCodecName, 'codecTheme', theme);
    document.documentElement.setAttribute('data-mgs-codec-theme', theme);
}

function updateCodecFont(selectedFont) {
    document.documentElement?.style.setProperty("--mgs-codec-font-family", `"${selectedFont}"`);
};

Hooks.once("init", () => {

    // Set up all the module settings
    game.settings.register(moduleMGSCodecName, 'codecTheme', {
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
            applyCodecTheme(value);
        },
        requiresReload: false
    });
});

Hooks.once("ready", () => {
    game.socket.on(`module.${moduleMGSCodecName}`, (payload) => {
        if (payload.action === "openCodec") {
            const { actorIds } = payload.data;
            _showCodecForIds(actorIds);
        }
    });

    // This has to load later since Foundry loads fonts at a different time that is past `init` :(
    game.settings.register(moduleMGSCodecName, 'CodecFont', {
        name: "Codec Font",
        hint: "Select the font for the Codec Communicaiton. Supports Custom Fonts if uploaded to Foundry Font Settings.",
        scope: "client",
        config: true,
        type: String,
        choices: Object.fromEntries(Object.keys(FontConfig.getAvailableFontChoices()).map(f => [f, f])), // Get all fonts that are available for edit in Foundry, including custom upload
        default: "Orbitron",
        onChange: (value) => {
            updateCodecFont(value);
            game.settings.set(moduleMGSCodecName, 'CodecFont', value);
        },
        requiresReload: false
    });

    applyCodecTheme(game.settings.get(moduleMGSCodecName, 'codecTheme'));
});
