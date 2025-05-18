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

    getData(options) {
        return {
            leftPortrait: "modules/metal-gear-codec/images/static.gif",
            rightPortrait: "modules/metal-gear-codec/images/static.gif",
            name: "Solid Snake",
            frequency: "140.85",
            text: "This is Snake. Colonel, can you hear me?"
        };
    }

};