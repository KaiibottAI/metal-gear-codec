const moduleMGSCodecName = 'metal-gear-codec';

const dialogueOptions = [
    'DATA SYNC IN PROGRESS', 'PACKET DELIVERY CONFIRMED', 'ENCRYPTED PAYLOAD DEPLOYED',
    'FILE TRANSFER COMPLETE', 'MEMORY CORES LINKED', 'SYNCING DATA MODULES',
    'ARCHIVE ACCESSED', 'FILE SYSTEM ONLINE', 'DATA STREAM INTEGRATED',
    'INFORMATION LINK STABLE', 'COMMUNICATIONS ONLINE', 'TRANSMISSION IN PROGRESS',
    'SIGNAL BROADCASTING', 'RECEIVING UPLINK', 'MESSAGE RECEIVED',
    'DATA STREAM ACTIVE', 'AUDIO FEED LINKED', 'LIVE FEED ENGAGED',
    'UPLINK CONFIRMED', 'OPENING CHANNEL', 'BEACON EMITTING',
    'TRANSMISSION COMPLETE', 'REPLY SIGNAL RECEIVED', 'SECURE CHANNEL CONNECTING',
    'SECURE LINK ESTABLISHED', 'TRANSMISSION LINKED', 'ENCRYPTED LINK ACTIVE',
    'HANDSHAKE COMPLETE', 'SIGNAL ACQUIRED', 'AUTHENTICATION ACCEPTED',
    'PROTOCOL SYNCHRONIZED', 'CYBERLINK INITIATED', 'CONNECTION ENCRYPTED',
    'FREQUENCY LOCKED', 'ENCRYPTION VERIFIED', 'COMM TUNNEL STABILIZED',
    'SECURE PORT ENGAGED', 'CHANNEL OMEGA ONLINE'
];

const frequencyOptions = [
    "420.69", "111.11", "69.69", "57.89", "123.45", "89.98", "199.7"
];

class MGSCodec extends Application {
    constructor(data = {}, options = {}) {
        super(options);
        this._setData(data);
    }

    async close(options) {
        if (this._onCloseCallback) this._onCloseCallback();

        // cleanup of MGSCodec after pressinx "X Close" in Dialog
        if (ui.MGSCodec === this) {
            ui.MGSCodec = undefined;
        }

        return super.close(options);
    }

    onClose(callback) {
        this._onCloseCallback = callback;
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
        if (this.rendered) this.render(true, { focus: false });
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

        for (let i = 0; i < $barWidth.length; i++) {
            $barWidth.eq(i).css('width', 10 * ($barWidth.length - i) + '%');
        }

        let bSignal = $barWidth.length;
        let signalCount = bSignal;
        let dBar = true;
        let running = false;

        const barSignal = (chk = false) => {
            if (!running || chk) {
                setTimeout(() => {
                    running = true;
                    if (dBar) {
                        signalCount--;
                        $barWidth.eq(signalCount).css('background-color', 'var(--mgs-codec-bar-on)');
                        if (signalCount === 0) dBar = false;
                    } else {
                        signalCount++;
                        $barWidth.eq(signalCount).css('background-color', 'var(--mgs-codec-bar-off)');
                        if (signalCount === bSignal) {
                            dBar = true;
                            running = false;
                            return;
                        }
                    }
                    barSignal(true);
                }, 100);
            }
        };

        barSignal();
        $barWidth.eq(0).css('display', 'none');
    }
}

const Events = {
    Close: 'close',
    Open: 'open',
};

class Codec {
    tokens = [];
    subscribers = [];

    constructor(firstToken, secondToken) {
        const left = firstToken ?? canvas.tokens.controlled[0];
        const right = secondToken ?? canvas.tokens.controlled[1];
        this.tokens = [this.resolveId(left), this.resolveId(right)];
    }

    setLeftToken(token) {
        if (!token) return console.error("No token provided.");
        this.tokens[0] = this.resolveId(token);
    }

    setRightToken(token) {
        if (!token) return console.error("No token provided.");
        this.tokens[1] = this.resolveId(token);
    }

    open() {
        // Only GM can open Codec
        if (game.user !== game.users.activeGM) {
            return ui.notifications.warn(`${moduleMGSCodecName} | Only the GM can open the codec for everyone`);
        }

        // Stoping execution of opening codec second time when another is already opened
        if (ui.MGSCodec) {
            return ui.notifications.warn(`${moduleMGSCodecName} | Codec is already opened`)
        }

        const data = { leftId: this.tokens[0], rightId: this.tokens[1] };
        const codec = new MGSCodec(data);
        codec.onClose(() => {
            this.emit(Events.Close)
        });

        ui.MGSCodec = codec

        ui.notifications.info(`${moduleMGSCodecName} | Receiving Transmission`);
        ui.MGSCodec.updateData(data);
        this.emit(Events.Open);

        // Emiting signal to ALL players, so they will have new Codec Dialog displayed
        game.socket.emit(`module.${moduleMGSCodecName}`, {
            action: "openCodec",
            data: {
                leftId: this.tokens[0],
                rightId: this.tokens[1]
            }
        });

        ui.MGSCodec.render(true);
    }

    close() {
        // Player might need to have an option to close transmition by themselves.

        // if (game.user !== game.users.activeGM) {
        //     return ui.notifications.warn(`${moduleMGSCodecName} | Only the GM can open the codec for everyone`);
        // }

        if (!ui.MGSCodec) {
            return ui.notifications.warn(`${moduleMGSCodecName} | There is no Codec to be closed`)
        }

        // Emit close event to all clients
        game.socket.emit(`module.${moduleMGSCodecName}`, {
            action: "closeCodec"
        });

        ui.MGSCodec?.close();
        ui.MGSCodec = undefined
    }

    toggle() {
        if (ui.MGSCodec) this.close()
        else this.open()
    }

    reverse(n) {
        // reverse at specific number of tokens
        console.log(n, this.tokens.filter(o => !!o).length)
        if (n && this.tokens.filter(o => !!o).length == n) this.tokens = this.tokens.reverse();

        // reverse always if n was not given
        else if (!n) this.tokens = this.tokens.reverse();
        return this;
    }

    on(event, callback) {
        this.subscribers.push({ event, callback });
        return this;
    }

    emit(event) {
        for (const sub of this.subscribers) {
            if (event === sub.event) sub.callback();
        }
    }

    resolveId(t) {
        if (!t) return null;
        if (typeof t === "string") return t;
        if (t.actor) return t.actor.id;
        if (t.id) return t.id;
        return null;
    }
}

const openCodecForAll = () => {
    return new Codec().reverse(1).toggle();
}


function applyCodecTheme(theme) {
    game.settings.set(moduleMGSCodecName, 'codecTheme', theme);
    document.documentElement.setAttribute('data-mgs-codec-theme', theme);
}

function updateCodecFont(selectedFont) {
    document.documentElement?.style.setProperty("--mgs-codec-font-family", `"${selectedFont}"`);
}

Hooks.once("init", () => {
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
        onChange: applyCodecTheme,
        requiresReload: false
    });
});

Hooks.once("ready", () => {
    game.socket.on(`module.${moduleMGSCodecName}`, (payload) => {
        if (payload.action === "openCodec") {
            const { leftId, rightId } = payload.data;
            const codec = new MGSCodec({ leftId, rightId });
            ui.MGSCodec = codec
            codec.render(true);
        }

        if (payload.action === "closeCodec") {
            console.log("Closing codec", ui.MGSCodec)
            if (ui.MGSCodec) {
                ui.MGSCodec.close();
                ui.MGSCodec = undefined;
            }
        }
    });

    game.settings.register(moduleMGSCodecName, 'codecFont', {
        name: "Codec Font",
        hint: "Select the font for the Codec Communication.",
        scope: "client",
        config: true,
        type: String,
        choices: Object.fromEntries(Object.keys(FontConfig.getAvailableFontChoices()).map(f => [f, f])),
        default: "Orbitron",
        onChange: updateCodecFont,
        requiresReload: false
    });

    updateCodecFont(game.settings.get(moduleMGSCodecName, 'codecFont'));
    applyCodecTheme(game.settings.get(moduleMGSCodecName, 'codecTheme'));
});
