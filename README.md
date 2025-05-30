# FoundryVTT MGS Style Communication
![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/kaiibottai/metal-gear-codec/total)

---
## Overview

Snake? Snake? SNAAAAAAKE!!!
Got your attention? Good. Incomming transmission!
Add flair to your Foundry Games with a classic Science Fiction update with insipiration from Metal Gear Solid Codec screen!

![](images/incoming-communication-window-example01.png)

## Features

Select tokens from your scene and pull up a custom MGS Styled Codec Communication screen between your players for added roleplay theme. Additionally, the Codec Communication screen handles Themes just like our previous [FoundryVTT RSS Scroller](https://github.com/KaiibottAI/foundry-rss-scroller)!

![](images/incoming-communication-window-example03.png)
![](images/incoming-communication-window-example04.png)

## Installation

1. Paste the `module.json` into your Foundry Module Manifest or clone the module into your FoundryVTT modules directory.

```
https://raw.githubusercontent.com/KaiibottAI/metal-gear-codec/main/module.json
```

or clone the repo to your FoundryVTT modules directory.

```cmd
git clone https://github.com/KaiibottAI/metal-gear-codec.git
```

2. Add the module to your game via Manage Modules in FoundryVTT.
3. Enable it in your world modules.

## How Does It Work?

The Codec Communication screen displays the name and image for both the left and right sides based on the GM's currently selected tokens:

* If only one token is selected, its details appear on the right side.
* If two tokens are selected, the first token appears on the left, and the second on the right.

Alternatively, token data can be passed as parameters, which will override any selected tokens.

> **Note:** The token art is sourced from actor.img, meaning it will use the portrait image if it's different from the token's visual.

## Macros available

Toggle the Codec Communication Window. This macro is included in a compendium on install for ease of access. This is only usable by the **active GM** of the world.

```javascript

// Opens or closes the Codec window.
// If only one token is selected, it's placed on the right side.
openCodecForAll(); // same as new Codec().reverse(1).toggle()

// Opens a new Codec window. Does nothing if one is already open.
new Codec().open();

// Closes the Codec window if open. Does nothing if already closed.
new Codec().close();

// Toggles the Codec window open/closed based on its current state.
new Codec().toggle();

// Reverses the token sides.
// Optional `n` parameter controls when to reverse:
// n === 1 → reverse if only 1 token is provided (token on left, right is blank)
// n === 2 → reverse if 2 tokens are provided (token order swapped)
new Codec().reverse(n);

/*
You can override selected tokens by passing token data as parameters.
Accepted formats:
- A string (actor ID)
- An object (actor with an ID)
*/
new Codec(firstToken, "321GHDAS231").open();

/*
Codec supports events when the window is opened or closed,
either via the UI or programmatically.
*/
const codec = new Codec();
codec.on('open', () => console.log('Codec opened!'));
codec.on('close', () => console.log('Codec closed!'));
codec.open();

```
