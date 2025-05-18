const dialogueOptions = [
    "Mission briefing: secure the perimeter and await further instructions.",
    "Greetings, operative. Your target is a high-value asset inside the facility.",
    "Status report: all units are in position. Proceed on my mark.",
    "Alert: enemy patrols have increased in sector 7. Stay sharp.",
    "Welcome back, agent. We've intercepted new intel—check your comms."
];


function populateCodec({ frequency }) {
    const container = document.querySelector('.codec-container');
    container.querySelector('.frequency').textContent = frequency;

    // Pick a random dialogue and insert it
    const randomIndex = Math.floor(Math.random() * dialogueOptions.length);
    const randomText = dialogueOptions[randomIndex];
    container.querySelector('.dialogue-box p').textContent = randomText;
}


populateCodec({
    frequency: '27.8 MHz'
});
