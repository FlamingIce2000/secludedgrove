document.addEventListener('DOMContentLoaded', () => {
    const gameOutput = document.getElementById('game-output');
    const actionButton = document.getElementById('action-button');
    let candies = 0;

    actionButton.addEventListener('click', () => {
        let tabs = document.getElementById("tabs");
        let newTab = document.createElement("div");
        newTab.id = "grove-tab";
        newTab.innerText = "|     |\
                            |Grove|\
                            |     |";
        tabs.appendChild(newTab);

    });
});

function saveGame() {
    localStorage.setItem('candies', candies);
}

function loadGame() {
    candies = localStorage.getItem('candies') || 0;
    gameOutput.innerHTML = `You have ${candies} candies.`;
}

window.addEventListener('beforeunload', saveGame);
document.addEventListener('DOMContentLoaded', loadGame);
