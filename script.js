//A wrapper class that let's me use pointers when I dont have pointers
class Box{
    constructor(val){
        this.val = val;
    }

    dec(){
        this.val--;
    }
}
const maxBerryBush = 20;
let numBerries = 0;
let progress = 0
let mons = [];
let intervals = new Set([]);
let resourceListeners = new Set([]);
let exploreCooldown = new Box(0);
let trapCooldown = new Box(0);
let alignment = 0;
let numExplores = 0;
let perks = new Set([]);
let buildListener = null;
let resources = {'fruit':0,'meat':0,'wood':0,'mystic herbs':0,'ore':0,'metal':0,'traps':0,'torch':0};
let exploreListener = null;
let feedListener = null;

let currentBattle = null;

let BASE_MON_FRUIT_PRODUCTION = 2;
let BASE_MON_MEAT_PRODUCTION = 4;
let BASE_MON_HERB_PRODUCTION = 0.25;
let BASE_MON_ORE_PRODUCTION = 1.0;
let BASE_MON_CONSUME = 2;
const ROW_SIZE = 50;
const EXPLORE_COST = 10;
const TILE_SIZE = 20;
function convertString(input){
    let output = '';
    let inputWords = input.split(' ');
    let currRow = 0;
    for(i of inputWords){
        if(currRow > 0 && currRow + i.length > ROW_SIZE){
            output.slice(0,-1);
            output += "\n" + i + ' ';
            currRow = i.length + 1;
        } else{
            output += i + ' ';
            currRow += i.length + 1;
        }
    }
    return output;
}
document.addEventListener('DOMContentLoaded', () => {
    get("select-mon").addEventListener('change',function() {updateMonCard()});
    setInterval(function() {
        for(i in mons){
            if (mons[i].tame < 100 && mons[i].resourceProduction == null){
                if(Math.random()*9000 < mons[i].tame*mons[i].tame){
                    mons[i].tame++;
                }
            }
        }
        for(i of intervals) {
            i();
        }
        if(mons.length > 0) updateMonCard("tameness");
        
    },10000);
    /*if(localStorage.getItem('fruit') != null){
        loadGame();
    } else */{
    const gameOutput = get('game-output');
    let actionButton = get('look-button');
    setOnClick(actionButton, () => {
        groveIcon = `
|     |
|Grove|
|     |
`;
        newTab("grove",groveIcon)
        forageIcon = `
|      |
|Forage|
|      |
`;
        newTab("forage", forageIcon);
        
        let text = get("grove-text");
        text.innerText = "You are alone. A lush forest surrounds you.\nMight as well look for food."
        get("look-button").remove();
        
        for(i = 0; i < 5; i++){
            addBerry(numBerries);
            numBerries++;
        }
        const bushGrowthId = setInterval(bushGrowth, 20000);
    });
    }
});

class coord {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}
function C(x,y){
    return new coord(x,y);
}
const berryLocations = [C(100,115),C(115,113),C(127,115),C(89,112),C(75,114),C(62,113),C(38,111),
    C(95,167),C(107,168),C(116,166),C(130,168),C(143,166),C(155,167),
    C(155,48),C(144,45),C(168,47),C(190,48),
    C(298,75),C(313,75),
    C(500,93),C(503,117),C(512,94),C(530,92),C(543,94),C(559,93),C(578,92),C(590,93),C(603,94)
    
];
function addBerry(){
    let thisCoord = berryLocations[Math.floor(Math.random() * berryLocations.length)];
    thisCoord.x -= Math.random()*2+4.5;
    thisCoord.y -= Math.random()*2+4.5;
    let berryDiv = newChild(get('bush-wrapper'),"div",null,"⚫︎","clickable berry");
    //let berryDiv = document.createElement("div");
    //berryDiv.innerText = "O";
    //berryDiv.classList = "clickable berry";
    berryDiv.style.left = thisCoord.x + "px";
    berryDiv.style.top = thisCoord.y + "px";
    berryDiv.style.fontWeight = "bold";
    setOnClick(berryDiv,collectBerry);

}
function saveGame() {
    localStorage.setItem('fruit', fruit);
    localStorage.setItem('progress',progress);
    localStorage.setItem('mons',mons);
    localStorage.setItem('grove text',get("grove-text").innerText);
}
function loadGame() {
    fruit = localStorage.getItem('fruit');
    progress = localStorage.getItem('progress');
    mons = localStorage.getItem('mons');
    let groveText = localStorage.getItem('grove text');
    const gameOutput = get('game-output');
    const actionButton = get('look-button');
        let groveIcon = `
|     |
|Grove|
|     |
`;
        newTab("grove",groveIcon)
        let forageIcon = `
|      |
|Forage|
|      |
`;
        newTab("forage", forageIcon);
        
        let text = get("grove-text");
        text.innerText = groveText;
        get("look-button").remove();
        updateResourceDisplay();
    const bushGrowthId = setInterval(bushGrowth, 20000);
}
//window.addEventListener('beforeunload', saveGame);
//document.addEventListener('DOMContentLoaded', loadGame);

function selectTab(tab){
        const screens = document.querySelectorAll('.screen');
            screens.forEach(screen => screen.classList.remove('active'));

            switch (tab)
            {
                case "explore":
                    activeScreen = get("explore-screen");
                    activeScreen.classList.add('active');
                    document.title = "An Untamed Forest"
                    break;
                case "forage":
                    activeScreen = get("forage-screen");
                    activeScreen.classList.add('active');
                    document.title = "A Fruit Tree";
                    break;
                case "war":
                    activeScreen = get("war-screen");
                    activeScreen.classList.add('active');
                    document.title = "A War Campaign";
                    break;
                case "grove":
                default:
                    activeScreen = get("grove-screen");
                    activeScreen.classList.add('active');
                    document.title = "A Secluded Grove";
                    if(mons.length < 1 && resources['fruit'] > 12 && progress < 1){
                        firstMonEvent();
                    }
                break;
            }
            
}

function collectBerry(){
    const berryDiv = event.target;
    resources['fruit']++;
    if(perks.has('basket')){
        resources['fruit']++;
    }
    updateResourceDisplay();
    numBerries--;
    berryDiv.remove();
}

function newTab(tabName, tabArt) {
        let tabs = get("tabs");
        let newTab = document.createElement("div");
        let newText = document.createElement("pre");
        newTab.id = tabName + "-tab";
        newText.innerText = tabArt;
        newTab.appendChild(newText);
        newTab.className = "clickable tab";
        tabs.appendChild(newTab);
        setOnClick(newTab, () => {
            selectTab(tabName);
        });
        
}

let sm = 0;
function bushGrowth(){
    let newBerries = 0;
    if(sm == 0){
        newBerries = Math.floor(Math.random() * 6)+3;
        sm++;
    } else {
        newBerries = Math.floor(Math.random() * 4)+2;
        sm--;
    }
    for(i = 0; i < newBerries; i++){
    if(numBerries >= maxBerryBush){
        return;
    }
    addBerry();
    numBerries++;
    }
}

function getResource(name){
    return resources[name];

}

function updateResourceDisplay(){
    notifyListeners();

    for(resourceName of ['fruit','meat','wood','ore','harness','metal','torch']){
        let resCount = get(resourceName + "-count");
        if(resCount == null && resources[resourceName] > 0){
            resCount = newChild(get("resource-screen"),"p",resourceName + "-count","","resource");
        }
        if(resCount != null){
        resCount.innerText = resourceName + "           " + Math.floor(resources[resourceName]);
        }
    }
    /*let meatCount = get("meat-count");
    if(meatCount == null && meat > 0){
        meatCount = newChild(get("resource-screen"),"p","meat-count","","resource")
    }
    if(meatCount != null){
    meatCount.innerText =  "meat          " + Math.floor(resources['meat']);
    }*/


    let herbCount = get("herb-count");
    if(herbCount == null && resources['mystic herbs'] > 0){
        herbCount = newChild(get("resource-screen"),"p","herb-count","","resource")
    }
    if(herbCount != null)
    {herbCount.innerText =  "mystic herbs  " + Math.floor(resources['mystic herbs'])};
}

function addTooltip(obj,text){
    obj.classList.add("tooltip-container");
    tooltip = newChild(obj,"span",null,text,"tooltip-text");
}
//This is called whenever we update the Resource Display to ensure that everything with a cost requirement checks to see if you meet the cost not
function notifyListeners(){

    for(listener of resourceListeners){
        listener.notify();
    }
}
function registerListener(obj){
    //Add a listener to the list, also notify the listener so that its initial state is correct
    resourceListeners.add(obj);
    obj.notify();
    //return resourceListeners.length - 1;
}
function registerButtonListener(button,resources,resourceRequirements){
    /*button.title = "";
    for(i = 0; i < resources.length;i++){
        button.title += resources[i] + " " + resourceRequirements[i] + "\n";
    }*/
    hoverText = "";
    for(i = 0; i < resources.length;i++){
        hoverText += resources[i] + " " + resourceRequirements[i] + "\n";
    }
    addTooltip(button,hoverText);
    buttonListener = new ButtonWrapper(button,resources,resourceRequirements);
    registerListener(buttonListener);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.removedNodes.forEach((node) => {
                if (node === button) {
                    console.log("button deleted. Removing resource listener");
                    unregisterListener(buttonListener);
                    observer.disconnect();
                }
            });
        });
    });
    observer.observe(button.parentNode,{ childList: true });
    return buttonListener;
}

function unregisterListener(listener){
    if(listener.client){
    if(listener.client.firstChild){
        for (child of listener.client.children){
            if(child.classList.contains('tooltip-text')){
                child.remove();
            }
        }
    }
    }
    resourceListeners.delete(listener);
    listener = null;
}

function firstMonEvent(){
    groveScreen = get("grove-screen");
    groveText = get("grove-text");

    groveText.innerText = "A fox, its body devoid of fat as starvation sets in,\nlimps into the clearing before collapsing.";
    if(get("initial-feed") == null) {
    let feedButton = newChild(groveScreen,"button","initial-feed","Feed");
    //feedButton.title = "fruit 10";
    addTooltip(feedButton,"fruit 10");
    
    setOnClick(feedButton, () => {
        feedButton.remove();
        groveText.innerText = "You carefully feed the fox some of your fruit. Soon, the\nfox has fallen into a peaceful slumber.";
        resources['fruit'] -= 10;
        updateResourceDisplay();
        progress = 1;
        setTimeout(function(){
            groveText.innerText = "The fox is now awake. It regards you with a little\n suspicion, but eyes your hand for more food.";
            let nameButton = newChild(groveScreen,"button",null,"Name it","");
            setOnClick(nameButton, () =>
            {
                const startingMon = new Mon();
                startingMon.level = 1;
                let name = prompt("Enter the name for your fox:");
                startingMon.nickname = name;
                startingMon.traits = new Set([]);
                startingMon.tame = 30;
                startingMon.speed = 3;
                startingMon.maxhp = 15;
                mons.push(startingMon);
                nameButton.remove();
                groveText.innerText = "Maybe if " + startingMon.nickname + " trusts you enough\nthey will gather materials for you";
                updateMonList();
                updateMonCard();

                registerListener(new GenericListener(unlockExplore,["fruit"],[30]));
            });
        },20000);
    })
    }
}
function unlockExplore(){
    progress = 2;
    groveText = get('grove-text');
    groveText.innerText = "The forest surrounding this clearing is\nvast. Exploring it could prove useful.";
    exploreButton = newChild(get("grove-screen"),"button","unlock-explore-button","Explore",null);
    exploreButton.style.top = "100px"
    exploreButton.style.position = "absolute"
    setOnClick(exploreButton, function() {
        let exploreIcon = `
|       |
|Explore|
|       |
`;
        newTab("explore",exploreIcon);
        exploreButton.remove();
        selectTab("explore");
        exploreListener = registerButtonListener(get("explore-button"),["fruit"],[EXPLORE_COST]);
        registerListener(new GenericListener(unlockBuild,["wood"],[10]));
    });
}
function resetExplore(){
    exploreButton = get("explore-button");
    exploreText = get("explore-text");
    exploreImage = get("explore-image");
    exploreText.innerText = "The untamed forest lies before you.\nWho knows what you might find?";
    //registerButtonListener(exploreButton,["fruit"],[EXPLORE_COST]);
    exploreButton.classList.remove("hidden");
    exploreCooldown.val = 15;
    updateExploreButton();
    cooldown(exploreCooldown,updateExploreButton);
    exploreImage.hidden = false;
}
function updateExploreButton(){
    exploreButton = get("explore-button");
    exploreButton.innerText = "Venture Forth";
    if(exploreCooldown.val > 0) {
        exploreButton.innerText += " (" + exploreCooldown.val + "s)";
        exploreButton.disabled = true;
    } else {
        //updateResourceDisplay();
        exploreListener = registerButtonListener(exploreButton,["fruit"],[EXPLORE_COST]);
    }
}
function explore(){
    unregisterListener(exploreListener);
    resources['fruit'] -= EXPLORE_COST;
    get("explore-image").hidden = true;
    updateResourceDisplay();
    if(numExplores < 10) {
        switch(Math.floor(Math.random()*18)){
            case 0:
            case 1:
                if(mons.length < 3){
                    event1();
                } else {
                    event4();
                }
                break;
            case 2:
                event1();
                break;
            case 3:
                event2();
                break;
            case 4:
            case 5:
            case 6:
                event3();
                break;
            case 7:
            case 8:
            case 9:
                event4();
                break;
            case 10:
                event5();
                break;
            case 11:
                event6();
                break;
            case 12:
            case 13:
            case 14:
                event7();
                break;
            case 15:
                event8();
                break;
            case 16:
                event9();
                break;
            case 17:
                event10();
                break;
            default:
                eventBoring();
        }
    }
     else if(numExplores == 10){
        eventTemple();
    } else if (numExplores == 30){
        eventContact();
    } else {
        switch(Math.floor(Math.random()*42)){
            case 0:
            case 1:
                if(!foundJaguar) {
                    event12();
                }
                break;
            case 2:
                if(mons.length < 10) {
                    event1();
                } else {
                    event15();
                }
                
                break;
            case 3:
                if(mons.length < 10) {
                    event2();
                } else {
                    event15();
                }
                break;
            case 4:
            case 5:
            case 6:
                event3();
                break;
            case 7:
            case 8:
            case 9:
                event4();
                break;
            case 10:
                if(mons.length < 10) {
                    event5();
                } else {
                    event15();
                }
                break;
            case 11:
                if(mons.length < 10) {
                    event6();
                } else {
                    event15();
                }
                break;
            case 12:
            case 13:
            case 14:
                event7();
                break;
            case 15:
            case 18:
                event8();
                break;
            case 16:
            case 19:
            case 20:
                event9();
                break;
            case 17:
                event10();
                break;
            case 21:
                if(mons.length < 10){
                    event11();
                } else {
                    event7();
                }
                break;
            case 22:
                if(mons.length < 10){
                    event13();
                } else {
                    event16();
                }
                break;
            case 23:
            case 24:
            case 25:
                event14();
            break;
            case 26:
            case 27:
            case 28:
            case 29:
                event15();
                break;
            case 30:
            case 31:
                event16();
                break;
            case 32:
            case 33:
                event17();
                break;
            case 34:
                if(mons.length < 10) {
                    event18();
                } else {
                    event17();
                }
                break;
            case 35:
            case 36:
                event19();
                break;
            case 37:
            case 38:
            case 39:
            case 40:
                event20();
                break;
            case 41:
                event21();
                break;
            default:
                eventBoring();
        }
    }
    
    numExplores++;

}
function event1(){ //tame squirrel
    let exploreText = get("explore-text");
    creatureType = (Math.random() < 0.5)?"squirrel":"chipmunk";
    exploreChoice(`You stumble across a ${creatureType} lying on the ground, a huge gash in its chest.`,
        "Bind its wound",[],[],
        () => {
            exploreText.innerText = convertString("With a strip of cloth made of plant fiber you bind the bleeding cut. You bring it back to your grove to oversee its recovery.");
            let newMon = new Mon();
            newMon.species = creatureType;
            newMon.level = 1;
            newMon.nickname = creatureType;
            newMon.nickname = newMon.nickname.charAt(0).toUpperCase() + newMon.nickname.slice(1);
            newMon.tame = 20;
            newMon.size = 4;
            mons.push(newMon);
            updateMonList();
            alignment += 3;
            setTimeout(resetExplore,20000);
        },
        "Leave it be",[],[],
        () => {
            exploreText.innerText = convertString("You leave the squirrel lying there in its blood. You continue, but find nothing before returning to the grove.");
            alignment -= 5;
            setTimeout(resetExplore,20000);
        }
    );
}
function event2(){ //tame wolf
    let exploreText = get("explore-text");
    exploreChoice("A lone wolf bares its teeth. It barely remains upright, you can tell its strength is nearly gone",
        "Toss it meat",["meat"],[10],
        () => {
            resources['meat'] -= 10;
            updateResourceDisplay();
            exploreText.innerText = convertString("You toss the meat towards it. Its anger vanishes the moment it smells food. After devouring what you gave it, it follows close at your heels.");
            let newMon = new Mon();
            newMon.species = "wolf";
            newMon.level = 1;
            newMon.nickname = "Wolf";
            newMon.tame = 40;
            newMon.carnivore = true;
            newMon.size = 8;
            mons.push(newMon);
            updateMonList();
            alignment += 3;
            setTimeout(resetExplore,20000);
        },
        "Finish it off",[],[],
        () => {
            exploreText.innerText = convertString("The fight is quick and bloody. You leave with bite marks on your arm and a new pelt.");
            resources['meat'] += 7;
            updateResourceDisplay();
            alignment -= 6;
            setTimeout(resetExplore,20000);
        }
    );
}
function event3(){ //wood
    let exploreText = get("explore-text");
    exploreButton = get("explore-button");
    if(!exploreButton.classList.contains('hidden')){
        exploreButton.classList.add('hidden');
    }
    exploreText.innerText = convertString(`Sticks and dead brush cover the forest floor. You collect as much as you can in your arms and bring it back to the grove. ${mons[0].nickname} walks over and greets you excitedly when you return.`);
    resources['wood'] += Math.floor(Math.random()*10)+10;
    updateResourceDisplay();
    setTimeout(resetExplore,15000);
}
function event4(){ //blackberries
    let exploreText = get("explore-text");
    exploreButton = get("explore-button");
    if(!exploreButton.classList.contains('hidden')){
        exploreButton.classList.add('hidden');
    }
    exploreText.innerText = convertString(`A grove of blackberry bushes filled with ripe berries greets you. You gather what you can carry. Back at camp ${mons[0].nickname} puts on puppy dog eyes to beg for one.`);
    resources['fruit'] += Math.floor(Math.random()*15)+15;
    updateResourceDisplay();
    setTimeout(resetExplore,15000);
}
function event5(){ //tame fawn
    let exploreText = get("explore-text");
    exploreChoice("A shivering fawn curls up next to its dead mother",
        "Coax the fawn with food",["fruit"],[10],
        () => {
            resources['fruit'] -= 10;
            updateResourceDisplay();
            exploreText.innerText = convertString("With a gentle hand you place a berry on the ground. The faun walks over and hungrily eats it. You lead the faun back to the safety of the grove.");
            let newMon = new Mon();
            newMon.species = "deer";
            newMon.level = 1;
            newMon.nickname = "Deer";
            newMon.tame = 35;
            newMon.size = 8;
            mons.push(newMon);
            updateMonList();
            alignment += 3;
            setTimeout(resetExplore,20000);
        },
        "Harvest the remains",[],[],
        () => {
            exploreText.innerText = convertString("No point in letting so much meat go to waste.");
            alignment -= 4;
            resources['meat'] += 20;
            updateResourceDisplay;
            setTimeout(resetExplore,20000);
        }
    );
}
function event6(){ //tame raven
    let exploreText = get("explore-text");
    exploreChoice("A raven stare at you intently from a nearby tree branch",
        "Hold out your arm",[],[],
        () => {
            exploreText.innerText = convertString("As you proffer your arm, the startled raven takes flight, soon disappearing out of sight.");
            alignment += 1;
            setTimeout(resetExplore,15000);
        },
        "Offer food",["fruit"],[5],
        () => {
            resources['fruit'] -= 5;
            updateResourceDisplay();
            event6a();
        },
        "Swiftly grab it",[],[],
        () => {
            exploreText.innerText = convertString("As you swipe your hand the bird quickly flies out of reach. Soon it is nowhere to be seen.");
            alignment -= 1;
            setTimeout(resetExplore,15000);
        }
    );
}
function event6a(){
    let exploreText = get("explore-text");
    exploreChoice("The raven cocks its head before cautiously eating the berry. It seems to relax a little.",
        "Hold out your arm",[],[],
        () => {
            exploreText.innerText = convertString("As you extend your arm, the bird considers it for a moment before hopping on.");
            let newMon = new Mon();
            newMon.species = "raven";
            newMon.level = 1;
            newMon.nickname = "Raven";
            newMon.tame = 10;
            newMon.size = 4;
            newMon.speed = 3;
            newMon.fly = true;
            mons.push(newMon);
            updateMonList();
            setTimeout(resetExplore,20000);
        },
        "Grab the bird",[],[],
        () => {
            exploreText.innerText = convertString("As you swipe your hand, the raven quickly flies out of reach. It seems to give you an almost critical glare before flying away.");
            alignment -= 3;
            setTimeout(resetExplore,15000);
        }
    );
}
function event7(){ //creek
    let exploreText = get("explore-text");
    exploreChoice("You find a clear creek running through the forest.",
        "Search the water",[],[],
        () => {
            exploreText.innerText = convertString("The crystal clear water is home to schools of fish. You manage to catch a few to bring back to the grove.");
            resources['meat'] += Math.floor(Math.random()*15)+5;
            updateResourceDisplay();
            setTimeout(resetExplore,15000);
        },
        "Follow it downstream",[],[],
        () => {
            exploreText.innerText = convertString("Downstream, fruitbearing trees flourish near the cool water. You collect some fruit before heading back.");
            resources['fruit'] += Math.floor(Math.random()*10)+8;
            updateResourceDisplay();
            setTimeout(resetExplore,15000);
        }
    );
}
function event8(){ //rare herbs
    let exploreButton = get("explore-button");
    if(!exploreButton.classList.contains('hidden')){
        exploreButton.classList.add('hidden');
    }
    let exploreText = get("explore-text");
    exploreText.innerText = convertString("You find a patch of rare herbs. Legends say they may have magical properties. You carefully harvest them.");
    resources['mystic herbs'] += 2;
    updateResourceDisplay();
    setTimeout(resetExplore,15000);
}
function event9(){ //fairy circle
    let exploreText = get("explore-text");
    exploreChoice(
        "You find a perfect circle formed out of white mushrooms.",
        "Offer fruit",["fruit"],[15],
        () => {
            resources['fruit'] -= 15;
            updateResourceDisplay();
            if(Math.random() < 0.5){
                exploreText.innerText = convertString("As you lay the fruit inside the circle, it transforms into a thousand dandelion seeds that blow away. In its place are a few flowers that glow with a mystical light.");
                resources['mystic herbs'] += 3;
                updateResourceDisplay();
                setTimeout(resetExplore,25000);
            } else {
                //The fey are fickle
                exploreText.innerText = convertString("As you lay the fruit inside the circle, it transforms into a thousand dandelion seeds that blow away. You hear laughter coming from all around.");
                setTimeout(resetExplore,20000);
            }
        },
        "Offer meat",["meat"],[15],
        () => {
            resources['meat'] -= 15;
            updateResourceDisplay();
            exploreText.innerText = convertString("The sky suddenly grows red as you set the meat down. You can hear a deep laughter as the meat seems to melt away. " + ((alignment > -15)?"You quickly run from the circle, and the sky returns to normal.":"You revel in the crimson light until the last drop has faded."));
            alignment -= 5;
            setTimeout(resetExplore,25000);
        },
        "Leave the Circle",[],[],
        () => {
            exploreText.innerText = convertString("You decide that some things are better left alone.");
            setTimeout(resetExplore,15000);
        }
    );
}
function event10(){ //saved by mons[0]
    let exploreText = get("explore-text");
    exploreButton = get("explore-button");
    if(!exploreButton.classList.contains('hidden')){
        exploreButton.classList.add('hidden');
    }
    exploreText.innerText = convertString("You come face to face with a growling wolf. It howls and more of its kind respond in the distance. Then it charges.");
    exploreButton1 = newChild(get('explore-screen'),"button","option1","Run");
    setOnClick(exploreButton1,() =>{
        exploreButton1.remove();
        exploreText.innerText = convertString(`You turn and start running, but it is much faster. As it leaps at you, jaws wide, a dark object collides with it from the side. You turn to see ${mons[0].nickname} wrestling with the wolf on the ground. As they both get to their feet, fur bloodied, ${mons[0].nickname} bares their teeth and growls. The wolf considers for a moment before leaving.`);
        setTimeout(resetExplore,20000);
    });
}
function event11(){ //tame eagle
    if(alignment < -15) {
        exploreChoice(
            "A pathetically weak eagle lies on the ground, leg broken. Nature is cruel to cripples, but this could be an opportunity...",
            "Make it serve you",["wood"],[10],
            () => {
                resources["wood"] -= 10;
                updateResourceDisplay();
                get("explore-text").innerText = convertString("You fashion a splint out of wood to bind its leg. It will remain loyaly in your service.");
                alignment -= 2;
                eagle = new Mon();
                eagle.species = "eagle";
                eagle.nickname = "eagle";
                eagle.level = 1;
                eagle.carnivore = true;
                eagle.tame = 30;
                eagle.fly = true;
                mons.push(eagle);
                updateMonList();
                setTimeout(resetExplore,15000);
            },
            "A merciful death",[],[],
            () => {
                get("explore-text").innerText = convertString("A noble creature such as an eagle should not be bound. Its death is quick.");
                alignment += 2;
                setTimeout(resetExplore,15000);
            }
        );
    } else {
        exploreChoice(
            "An eagle lies crippled on the ground. Its right leg is bent way too far out of place.",
            "Make a splint",["wood"],[10],
            () => {
                resources["wood"] -= 10;
                updateResourceDisplay();
                get("explore-text").innerText = convertString("You fashion a splint out of wood to bind its leg. It winces in pain, yet seems to understand your desire to help. You carry it back to the grove.");
                alignment += 3;
                eagle = new Mon();
                eagle.species = "eagle";
                eagle.nickname = "eagle";
                eagle.level = 1;
                eagle.carnivore = true;
                eagle.tame = 30;
                mons.push(eagle);
                setTimeout(resetExplore,15000);
            },
            "Nature holds no mercy",[],[],
            () => {
                get("explore-text").innerText = convertString("Cripples do not survive in nature. This eagle is no exception.");
                resources["meat"] += 10;
                updateResourceDisplay();
                alignment -= 2;
            }
        );
    }
}
let foundJaguar = false;
function event12() { //tame jaguar
    exploreChoice("For a while, as you've explored the forest you've had the uncanny feeling that you were being watched. Today you spot your stalker. Lying lazily on a treebranch in front of you is a beautiful jaguar. It stares at you intently before hopping down to the ground in front of you.",
        "Show no fear", [], [],
        () => {
            get("explore-text").innerText = convertString("As the jaguar displays its calm confidence, you stand up tall to make sure you show no weakness. The jaguar eyes you for a bit, circling you before seeming to nod. It then vanishes into the forest.");
            setTimeout(resetExplore,20000);
        },
        "Bow submissively",[],[],
        event12a
    );
}
function event12a() {
    let exploreText = get('explore-text');
    exploreChoice(
        "You crouch down and bow your head submissively. The jaguar slowly circles around you, eyes never leaving you. When it arrives in front of you again, it lies down on the ground.",
        "Toss it meat",['meat'],['20'],
        () => {
            resources["meat"] -= 20;
            updateResourceDisplay();
            exploreText.innerText = convertString("You toss the meat to the jaguar who accepts it and begins to eat. After it is finished, it gets up and leads you back to your own camp. There, it climbs on top of your stockpile of resources and lays down, watching over the grove like a king over their kingdom.");
            foundJaguar = true;
            jaguar = new Mon();
            jaguar.nickname = "Self Appointed Ruler";
            jaguar.species = "jaguar";
            jaguar.tame = 5;
            jaguar.level = 3;
            jaguar.maxhp = 25;
            jaguar.size = 8;

            jaguar.carnivore = true;
            mons.push(jaguar);
            updateMonList();
            setTimeout(resetExplore,20000);
        },
        "Carefully back away",[],[],
        () => {
            exploreText.innerText = convertString("The jaguar watches you as you back away, but does not pursue. You make it safely back to the grove.");
            setTimeout(resetExplore,15000);
        }

    );
}
function event13() { //Tame Bun
    let exploreText = get('explore-text');
    if(alignment >= 25){
        let exploreText = get("explore-text");
        exploreButton = get("explore-button");
        if(!exploreButton.classList.contains('hidden')){
            exploreButton.classList.add('hidden');
        }
        get('explore-button').
        exploreText.innerText = convertString("As you search through the forest you stumble across a spectacular sight. There, sitting in front of you, is an adorable fluffy bunny. There is no decision to be made, it is clear what you must do.");
        choiceButton = newChild(get('explore-screen'),"button",null,"FEED THE BUN");
        bunImage = 
`             ,\\
             \\\\\\,_
              \\\` ,\\
         __,.-" =__)
       ."        )
    ,_/   ,    \\/\\_
    \\_|    )_-\\ \\_-\`
       \`-----\` \`--\`
`;
        bunDiv = newChild(get('explore-screen'),"pre","bun-image",bunImage);
        registerButtonListener(choiceButton,["fruit"],[15]);
        setOnClick(choiceButton,() => {
            resources['fruit'] -= 15;
            updateResourceDisplay();
            choiceButton.remove();
            bunDiv.remove();
            exploreText.innerText = convertString("You feed the bunny some fruits and plants and it happily munches away on them. As it munches you pet the bun as much as possible. When it finishes you bring it back to the grove to feed it more.");
            bun = new Mon();
            bun.species = "bun";
            bun.nickname = "Fluff Bundle";
            bun.level = 1;
            bun.tame = 40;
            bun.size = 4;

            mons.push(bun);
            updateMonList();
            setTimeout(resetExplore,20000);
        });
    } else {
        exploreChoice(
            "Ahead of you, a rabbit searches through the grass for food. Its ears perk up as it hears you and it stares at you, waiting to see what you do.",
            "Hold out food",["fruit"],[15],
            () => {
                resources['fruit'] -= 15;
                updateResourceDisplay();
                exploreText.innerText = convertString("You hold out some fruit and plants in your hand. The rabbit approaches cautiously before tasting the offering. Soon it is comfortably munching away at the food in your hand as you bring it back to the grove.");
                alignment += 3;
                bun = new Mon();
                bun.species = "bun";
                bun.nickname = "Fluff Bundle";
                bun.level = 1;
                bun.tame = 30;
                bun.size = 4;
                mons.push(bun);
                updateMonList();
                setTimeout(resetExplore,20000);
            },
            "Grab the creature",[],[],
            () => {
                exploreText.innerText = convertString("You reach out to snatch the rabbit and it quickly hops away into the underbrush.");
                alignment -= 3;
                setTimeout(resetExplore,15000);
            }
        );

    }
}
function event14(){ //Monkeys
    exploreChoice(
        "As you stoll through the forest, you hear the chattering of monkeys in the treetops.",
        "Follow the noises",[],[],
        () => {
            get('explore-text').innerText = convertString("You chase the monkeys deeper and deeper into the forest, but eventually you lose them. When you return to camp you notice that it has been ransacked.");
            resources['food'] -= Math.min(Math.floor(resources['food']*0.5),50);
            resources['wood'] -= Math.min(Math.floor(resources['wood']*0.3),20);
            resources['ore'] -= Math.min(Math.floor(resources['ore']*0.2),10);
            alignment++;
            updateResourceDisplay();
            setTimeout(resetExplore,20000);

        },
        "Leave them be",[],[],
        () => {
            get('explore-text').innerText = convertString("You ignore the monkeys and return to camp. Back at the grove you find several monkeys searching through your stockpile. You shoo them away.");
            setTimeout(resetExplore,20000);
        }
    )
}
function event15() { //cave
    let exploreText = get('explore-text');
    exploreChoice(
        "You find a dark cave in the side of a bluff. Cool air blows out from the crevice.",
        "Enter the cave",["torch"],[1],
        () => {
            resources['torch']--;
            rnd = Math.random();
            if(rnd < 0.2){
                exploreText.innerText = convertString("You hold out your torch before you and come face to face with a bear. It lets out a roar as you sprint away, dropping some food you had brought with you.");
                resources['fruit'] -= 15;
                if (resources['fruit'] < 0) resources['fruit'] = 0;
            } else if (rnd < 0.6){
                exploreText.innerText = convertString("You descend into the darkness, the fire of your torch the only source of light. This appears to be a creature's den with a half eaten corpse in the middle. You take what you can before leaving.");
                resources['meat'] += Math.floor(Math.random()*8)+10;
            } else if (rnd < 0.9) {
                exploreText.innerText = convertString("You descend into the darkness, the fire of your torch the only source of light. This appears to be a creature's den with a stockpile of fruit in the corner. You gather what you can before leaving.");
                resources['meat'] += Math.floor(Math.random()*8)+10;
            } else {
                exploreText.innerText = convertString("As you find your way through the cave by the light of your torch, you notice a glowing up ahead. The wall is lined with rare mushrooms. These can help fuel your magical abilities.");
                resources['mystic herbs'] += 3;
            }
            updateResourceDisplay();
            setTimeout(resetExplore,20000);
        },
        "Search around",[],[],
        () => {
            exploreText.innerText = convertString("The area surrounding the cave has plenty of wood and thatch to collect. You bring some back.");
            resources['wood'] += Math.floor(Math.random()*10)+8;
            updateResourceDisplay();
            setTimeout(resetExplore,15000);
        }
    )
}
function event16() { //walk with mons[0]
    exploreButton = get("explore-button");
        if(!exploreButton.classList.contains('hidden')){
            exploreButton.classList.add('hidden');
        }
    get('explore-text').innerText = convertString(`You decide to bring ${mons[0].nickname} along with you this time. ${mons[0].nickname} happily joins you, running along and playing in piles of leaves. You two snack on some berries you find and bring back some odds and ends, but mostly you enjoy spending the time together.`);
    resources['fruit'] += Math.floor(Math.random()*5)+1;
    resources['mystic herbs'] += Math.floor(Math.random()*3) / 2;
    updateResourceDisplay();
    mons[0].tame += 30;
    if (mons[0].tame > 100) mons[0].tame = 100;
    updateMonCard("tameness");
    setTimeout(resetExplore,20000);
}
function event17() { //fish with mons[0]
    exploreButton = get("explore-button");
        if(!exploreButton.classList.contains('hidden')){
            exploreButton.classList.add('hidden');
        }
    get('explore-text').innerText = convertString(`The ground is damp from a recent rain. You and ${mons[0].nickname} head off to explore together. You come to a creek overflowing with water, ${mons[0].nickname} jumps in excitedly and starts splashing around. They catch a few fish and drop them at your feet, wagging their tail with excitement.`);
    resources['meat'] += Math.floor(Math.random()*10) + 5;
    updateResourceDisplay();
    mons[0].tame += 20;
    if (mons[0].tame > 100) mons[0].tame = 100;
    updateMonCard("tameness");
    setTimeout(resetExplore,20000);
}
function event18() { //tame badger
    let exploreText = get('explore-text');
    exploreChoice(
        "As you venture into the forest, you come across a badger surrounded by a pack of wolves. It hisses at the wolves who, despite their advantage in size and number, seem hesitant about fighting. Still, the wolves are warily moving in.",
        "Back away slowly",[],[],
        () => {
            exploreText.innerText = convertString("You slowly creep backwards and none of the predators notice you. When you are a little ways away, you turn and head back to the grove. Behind you, you hear the sounds of a viscious fight.");
            alignment -= 1;
            setTimeout(resetExplore,20000);
        },
        "Scare the wolves",["torch"],[1],
        () =>{
            resources['torch']--;
            
            exploreText.innerText = convertString("You leap forward into the circle of wolves, waving your burning torch. The wolves growl, but shy away from the dancing flame. After a few tense moments, the wolves turn and leave. As soon as they do, the badger bolts away into the forest. The next morning, however, the badger shows up at the grove with a dead mouse as a present.");
            resources['meat']++;
            badger = new Mon();
            badger.level = 1;
            badger.tame = 10;
            badger.speed = 3;
            badger.nickname = "Badger";
            badger.species = "badger";
            badger.carnivore = true;
            mons.push(badger);
            updateMonList();
            alignment += 3;
            updateResourceDisplay();
            setTimeout(resetExplore,20000);
        }
    );
}
function event19(){ //abandoned mine
    let exploreText = get("explore-text");
    exploreChoice(
        "Near the outskirts of the forest, you find the remnants of a mine. Signs of human activity in the forest worry you.",
        "Enter the mine",["torch"],[1],
        () => {
            resources['torch']--;
            exploreText.innerText = convertString("Luckily the mine has been long abandoned. By the light of your fire you find a little ore that was never taken back.");
            resources['ore'] += Math.floor(Math.random()*7)+1;
            updateResourceDisplay();
            setTimeout(resetExplore,15000);
        },
        "Search the area",[],[],
        () => {
            exploreText.innerText = convertString("You search around the mine and luckily don't find any signs of recent human activity. This mine appears to have been abandonded long ago.");
            setTimeout(resetExplore,15000);
        }
    )
}
function event20() { //misc temple
    exploreText = get("explore-text");
    exploreChoice(
        "Deep in the forest you find the dark ruins of a temple. It resembles the temple that housed the Heart of the Forest, but smaller. It does not have the same power radiating from it.",
        "Explore",['torch'],[1],
        () =>
        {
            resources['torch']--;
            rnd = Math.floor(Math.random()*5);
            switch (rnd){
                case 0:
                    exploreText.innerText = convertString("Inside the temple, you find a wall covered in images. It clearly depicts the Heart of the Forest, but it also depicts another crystal that you cannot identify. When both crystals are brought together... The wall is too worn to make out the rest.");
                    break;
                case 1:
                    exploreText.innerText = convertString("Inside the temple you find a prophecy scralled on a withered slab. It reads: \"In the time where the o$??cl??f war comes, One, chosen of the forest, shall be raised up by their &??ri? to unite the world and ?(s&a??\"");
                    break;
                case 2:
                    exploreText.innerText = convertString("The temple is dark, lit only by your torches flame. An intricate carving in the wall has been scratched beyond recognition. Grafitti, carved over top reads: \"I see, One does not have power to ascend alone. A sacrifice must be made. I will do what I must.\"");
                    break;
                case 3:
                    exploreText.innerText = convertString("This temple contains a grand mural depicting a crystal in the center. Etched below it you can just make out the words: \"The bond between One and their l?n?m contains great power.\"");
                    break;
                case 4:
                    exploreText.innerText = convertString("The wall of the temple depicts an intricate image. It appears to be some sort of map, with the entire outer edge rough unhewn rock. In the center, two crystals are surrounded by perfectly smooth stone with plants and animals etched in it.");
                    break;
                }
                resources['mystic herbs']++;
                updateResourceDisplay();
                setTimeout(resetExplore,20000);
        },
        "Leave",[],[],
        () => {
            exploreText.innerText = convertString("You leave the temple. Perhaps the secrets hidden inside are better kept as secrets.");
            setTimeout(resetExplore,15000);
        },
        "Destroy it",['mystic herbs'],[2],
        () => {
            exploreText.innerText = convertString("You crush the magical herbs inside your palm and feel the power course through you. You feel a connection to the very stones making up the temple. With considerable effort, you PUSH and the entire temple crumbles to dust.");
            alignment -= 4;
            setTimeout(resetExplore,20000);
        }
    )
}
function event21(){ //tame bear cub
    exploreText = get('explore-text');
    exploreChoice(
        "As you journey through the forest, you find a bear cub next to its mother. The mother bear is trapped under a large boulder. The cub frantically tries to help its mother move, but to no avail.",
        "Free the mother",["wood"],[5],
        () => {
            exploreText.innerText = convertString("You put together a makeshift wooden level and use it to lift the boulder slightly. Soon the bear is free. The bear glares at you warily and stands between you and its cub. Carefully, it guides its cub away from you and into the forest.");
            alignment += 5;
            setTimeout(resetExplore,20000);
        },
        "Kill the mother",[],[],
        () => {
            exploreText.innerText = convertString("Even though the bear is trapped, it does not go down easily. It fight to the very end. Once it is dead, the cub has no choice but to go with you for protection.");
            resources["meat"] += 20;
            updateResourceDisplay();

            cub = new Mon();
            cub.level = 1;
            cub.nickname = "Bear Cub";
            cub.species = "bear";
            cub.tame = 0;
            cub.size = 10;
            cub.speed = 1;
            cub.hp = 20;
            mons.push(cub);
            updateMonList();
            alignment -= 5;
            setTimeout(resetExplore,20000);
        }
    )
}

function eventBoring(){
    exploreText = get("explore-text");
    exploreButton = get("explore-button");
    if(!exploreButton.classList.contains('hidden')){
        exploreButton.classList.add('hidden');
    }
    exploreText.innerText = convertString("You enjoy a wonderful walk in the woods");
    setTimeout(resetExplore,10000);
}
let templeHerbs = false;
function eventTemple(){
    let herbs = false;
    templeImage =
`MMMW###Mw         |___,_|  U  |__._|    M@#MN#N
M ;\`\`\`\`~          |_|/__|     |_V_||     \`\`\`MwMN
                 /|___|__\\____|___,_\\,,       \`\`
              wwww~,|___|_v_|___.__~~~;
WWML          r/_#|___|__'|___|__,/___\\\`
MW@RWL        /_|_@_|w__z:__#|___;__|__\\
    MMHK ____/|___|@\`_|___|___|___|_#_|_;,,__
       #@___|___,_;_;-k_|___|\\/_|___|__,:##_|\\
       |_~~___|_~_|_/#._ _Y_ _|___|__p~\\__|__wl
       ||_;_|_{_\`~~_|,,j;___|___;___|___n ;,|_w
       |__|--{|___|\`_ Y//%@@#@@@|_|___|  }____w
       ||_\`_|_Y_;___|_//%W@@@%@@|___Y_; /___|_~
       ww~|__wMw__|___|#@M@@@@%@|_|___|W__|__wW
       ww__wwWWWw,__|,|@@@@W@@@@|___|_wWw__w|wT
    w  |wwWwWWMWMww  vmwWW@@@W@#| | wWmMWmWMmwm  wMw
    MMwmWMWMWMWMMWMmwmMWM@@NM@@MNmwmWMWMMMWMwwmWMmmwm
  mmwwMWW@@@##MN@@MN#@@@MNM@@#NMNMNM@NMMN@#M$@N@#NMMMNNM
`
    newChild(get("explore-screen"),"pre","temple-image",templeImage);
    exploreChoice(
        `Deep in the woods you find what appears to be the remains of an ancient temple. Stone walls are overgrown with vines and in many places the ceiling has collapsed. As you approach the entrance, ${mons[0].nickname} emerges from the forest to join you. You can feel a... power pulsating inside. It beckons to you two.`,
        "This is surely sacred ground",[],[],
        temple1a,
        "I must gain this power",[],[],
        temple1b
    );
}
function temple1a(){
    templeImage = get("temple-image");
    if(templeImage) templeImage.remove();
    exploreChoice(
        "You enter the main chamber. The cracked stone floor is covered in vines. To the north, golden sunlight streams through a doorway. In the center of the room, stairs lead downwards into darkness. You can feel the thrum of power from down below",
        "Enter the Side Room",[],[],
        temple2a,
        "Descend the Stairs",[],[],
        temple3a
    );
}
function temple2a(){
    exploreText = get("explore-text");
    exploreScreen = get("explore-screen");
    let button1;
    let button2;
    if(!templeHerbs){
        exploreText.innerText = convertString(`You enter an ancient courtyard surrounded by forest. A break in the trees allows sunlight to bathe the area in its golden light. ${mons[0].nickname} frolicks in the vibrant grass. Plants in the courtyard glow with a mystical energy.`)
        button1 = newChild(exploreScreen,"button","button-1","Gather the Plants");
        
        setOnClick(button1,() =>{
            exploreText.innerText = convertString("In reverence of this sacred area, you carefully gather some of the herbs. They seem imbued with the same energy you feel coming from the temple. They will surely prove useful.");
            alignment += 3;
            button1.remove();
            templeHerbs = true;
            resources['mystic herbs'] += 3;
            updateResourceDisplay();
        });
    } else {
        exploreText.innerText = convertString("You enter an ancient courtyard surrounded by forest. A break in the trees allows sunlight to bathe the area in its golden light. Plants of all varieties flourish here, though you dare not take more than you already have.")
    }
    button2 = newChild(exploreScreen,"button","button-2","Return Inside");
    setOnClick(button2,() =>
    {
        if(button1 != null) button1.remove();
        button2.remove();
        temple1a();
    });
}

function temple3a(){
    exploreText = get("explore-text");
    exploreScreen = get("explore-screen");
    exploreText.innerText = convertString(`You carefully walk down the stairs, the invisible power growing with every step. ${mons[0].nickname} can feel it too. Finally the darkness breaks as you see an emerald light ahead. The stairs end in a small chamber with curious markings covering the walls. Floating in the center is a vibrant green crystal, the obvious source of the energy. The power seems to wash over you, drowning out your thoughts with a thick... silence.`);
    button1 = newChild(exploreScreen,"pre","button-1",`  /\\    
 /  \\   
/ /\\ \\ 
\\ \\/ / 
 \\  /  
  \\/   `,"clickable");
        button1.style.color = "#10E030";
        button1.style.fontWeight = "bold"
        button1.classList.add('color-shift');
    document.title = '❬ ○ ❭'
    setOnClick(button1,() =>{
        button1.remove();
        alignment += 5;
        exploreText.innerText = convertString(`The power courses through your body, streams of emerald light twisting around you and ${mons[0].nickname}.`);
        document.body.classList.add('shake-window');
    
        setTimeout(function() {
            document.body.classList.remove('shake-window');
        }, 1000);

        setTimeout(function() {
            exploreText.innerText = convertString(`You regain your senses. Everything is quiet and the crystal floats just in front of you still. You feel a new reservoir of power within you and as you turn to look at ${mons[0].nickname}, they appear to be glowing with the same power you feel inside. This crystal is sacred, the Heart of the Forest. You must get it back to the grove for safety.`);
            button1 = newChild(exploreScreen,"button","button-1","Bring it back");
            setOnClick(button1,() =>
            {
                button1.remove();
                exploreText.innerText = convertString(`With great reverence, you take hold of the crystal again. It resonates with the power you feel inside, but does not react like last time. ${mons[0].nickname} bows their head towards the crystal. Both of you return to the grove, crystal in hand. As you return to the sunlight, you notice ${mons[0].nickname}'s pelt now has streaks of vibrant, almost glowing, green.`);
                get("grove-text").innerText = convertString(`With the Heart of the Forest's power, you and ${mons[0].nickname} should be able to unlock the latent elemental energies within the other animals.`);
                unlockDruid();
                setTimeout(resetExplore,20000);
            });
        },7000);
    });
}
function temple1b(){
    templeImage = get("temple-image");
    if(templeImage) templeImage.remove();
    exploreChoice(
        "You enter the main chamber. The cracked stone floor is covered in vines. To the north, golden sunlight streams through a doorway. In the center of the room, stairs lead downwards into darkness. You can feel the thrum of power from down below",
        "Enter the Side Room",[],[],
        temple2b,
        "Descend the Stairs",[],[],
        temple3b
    );
}
function temple2b(){
    exploreText = get("explore-text");
    exploreScreen = get("explore-screen");
    let button1;
    let button2;
    if(!templeHerbs){
        exploreText.innerText = convertString(`You enter an ancient courtyard surrounded by forest. A break in the trees allows sunlight to bathe the area in light. Plants in the courtyard glow with a powerful energy.`)
        button1 = newChild(exploreScreen,"button","button-1","Gather the Plants");
        
        setOnClick(button1,() =>{
            exploreText.innerText = convertString("You must have this power. You collect every plant that you can a hunger for power building inside you.");
            alignment -= 3;
            button1.remove();
            templeHerbs = true;
            resources['mystic herbs'] += 5;
            updateResourceDisplay();
        });
    } else {
        exploreText.innerText = convertString("You enter an ancient courtyard surrounded by forest. A break in the trees allows sunlight to bathe the area in light. The ground is ravished of plant life. Nothing of value remains here.")
    }
    button2 = newChild(exploreScreen,"button","button-2","Return Inside");
    setOnClick(button2,() =>
    {
        if(button1 != null) button1.remove();
        button2.remove();
        temple1b();
    });
}
function temple3b() {
    exploreText = get("explore-text");
    exploreScreen = get("explore-screen");
    document.title = '❬ ○ ❭'
    exploreText.innerText = convertString(`You walk down the stairs, the invisible power entincing you more with every step. Finally the darkness breaks as you see an emerald light ahead. The stairs end in a small chamber. The power is strong here. Floating in the center is a glowing green crystal, the source of this power. The power seems to call to you. You need this power.`);
    button1 = newChild(exploreScreen,"pre","button-1",
`        /\\    
        /  \\   
       / /\\ \\ 
       \\ \\/ / 
        \\  /  
         \\/   `,"clickable");
               button1.style.color = "#10E030";
               button1.style.fontWeight = "bold"
               button1.classList.add('color-shift');
               setOnClick(button1,() =>{
        button1.remove();
        alignment -= 3;
        exploreText.innerText = convertString(`The power courses through your body, streams of emerald light twisting around you.`);
        document.body.classList.add('shake-window');
    
        setTimeout(function() {
            document.body.classList.remove('shake-window');
        }, 1000);

        setTimeout(function() {
            exploreText.innerText = convertString(`You regain your senses. Everything is quiet and the crystal is gripped tightly in your hand. You feel a new reservoir of power within you. This crystal is powerful and must be guarded fiercly. You must get it back to the grove.`);
            button1 = newChild(exploreScreen,"button","button-1","Bring it back");
            setOnClick(button1,() =>
            {
                button1.remove();
                exploreText.innerText = convertString(`You return to the grove, crystal in hand. As you return to the sunlight, you notice ${mons[0].nickname}'s pelt now has streaks of vibrant, almost glowing, green. It follows close at your heels, head bowed.`);
                get("grove-text").innerText = convertString("With the your newfound power and some magical plants, you should be able to unlock the latent elemental abilities of your animal servants.");
                unlockDruid();
                setTimeout(resetExplore,20000);
            });
        },7000);
    });
}
function unlockDruid(){
    perks.add('druid');
    mons[0].element = "astral";
    updateMonCard();
}
function eventContact() {
    exploreText = get('explore-text');
    exploreButton = get("explore-button");
        if(!exploreButton.classList.contains('hidden')){
            exploreButton.classList.add('hidden');
        }
    exploreText.innerText = convertString("As you enjoy a walk in the woods you hear an unnatural sounds. Talking. Humans, they\'re here. You see them up ahead investigating some ancient ruins. They are searching for the crystal, they must be. You hurry back to the grove. The grove is not safe anymore. It is time for war.");
    warButton = newChild(get('explore-screen'),"button",null,"To War!");
    setOnClick(warButton,() => {
        warButton.remove();
        warIcon = 
`
|     |
| War |
|     |
`
        warTab = newTab("war",warIcon);
        selectTab("war");
        setTimeout(resetExplore,10000);
    });
}

//A function used in creating events. Used for simple events with a few buttons
function exploreChoice(mainText,button1Text,button1Req,button1Amount,button1Func,button2Text,button2Req,button2Amount,button2Func,button3Text,button3Req,button3Amount,button3Func){
    let exploreButton = get("explore-button");
    if(!exploreButton.classList.contains('hidden')){
        exploreButton.classList.add('hidden');
    }
    let exploreScreen = get("explore-screen");
    let exploreText = get("explore-text");

    exploreText.innerText = convertString(mainText);
    let exploreOption1 = newChild(exploreScreen,"button","option1",button1Text);
    let exploreOption2 = newChild(exploreScreen,"button","option2",button2Text);
    let exploreOption3;
    if(button3Text){
        exploreOption3 = newChild(exploreScreen,"button","option3",button3Text);
    }

    if(button1Req.length > 0){
        registerButtonListener(exploreOption1,button1Req,button1Amount);
    }
    if(button2Req.length > 0){
        registerButtonListener(exploreOption2,button2Req,button2Amount);
    }
    if(button3Req && button3Req.length > 0){
        registerButtonListener(exploreOption3,button3Req,button3Amount);
    }

    setOnClick(exploreOption1,function() {
        exploreOption1.remove();
        exploreOption2.remove();
        if(button3Text){
            exploreOption3.remove();
        }

        button1Func();
    });

    setOnClick(exploreOption2,function(){
        exploreOption1.remove();
        exploreOption2.remove();
        if(button3Text){
            exploreOption3.remove();
        }

        button2Func();
    });

    if(button3Text){
        setOnClick(exploreOption3,function(){
            exploreOption1.remove();
            exploreOption2.remove();
            exploreOption3.remove();

            button3Func();
        });
    }
}

function unlockBuild(){
    progress = 3;
    groveText = get("grove-text");
    groveText.innerText = convertString("With the wood you have, you may be able to construct some useful tools for you and your animals");

    buildMenu = get("build-menu");
    buildMenu.classList.remove("hidden");
    buildMenu.style.display = "flex";
    let buildButton = get("build-button");
    buildList = get("select-build");
    newChild(buildList,"option","build-torch","Torch");
    newChild(buildList,"option","build-trap","Trap");
    newChild(buildList,"option","build-basket","Basket");
    newChild(buildList,"option","build-harness","Harness");
    buildList.addEventListener('change',updateBuildList);
    updateBuildList();
    setOnClick(buildButton,buildItem);
}
function updateBuildList(){
    let buildList = get("select-build");
    let buildDescription = get("build-description");
    let buildButton = get("build-button");
    let currentSelection = buildList.options[buildList.selectedIndex].text;
    let woodCost = 0;
    switch(currentSelection){
        case "Torch":
            buildDescription.innerText = convertString("Really just a stick to light on fire. Could be useful while exploring.");
            woodCost = 5;
        break;
        case "Trap":
            buildDescription.innerText = convertString("A simple trap that you can hide in the underbrush of the forest. It can catch small critters for meat.");
            woodCost = 10;
            break;
        case "Basket":
            buildDescription.innerText = convertString("A sturdy wooden basket with woven plant fibers will help you carry more of the fruit you collect.");
            woodCost = 20;
            break;
        case "Harness":
            buildDescription.innerText = convertString("A lightweight harness with pouches attached will allow one of your trained animals to carry much more fruit as they forage.");
            woodCost = 25;
            break;

    }
    if (buildListener != null){
        unregisterListener(buildListener);
    }
    buildListener = registerButtonListener(buildButton,["wood"],[woodCost]);
}
function buildItem(){
    let buildList = get("select-build");
    let buildDescription = get("build-description");
    let buildButton = get("build-button");
    let currentSelection = buildList.options[buildList.selectedIndex].text;
    let woodCost = 0;
    switch(currentSelection){
        case "Torch":
            resources['wood'] -= 5;
            if(!resources['torch']){
                resources['torch'] = 1;
            } else {
                resources['torch']++;
            }
            updateResourceDisplay();

        break;
        case "Trap":
            resources['wood'] -= 10;
            updateResourceDisplay();
            if(!resources['traps']){
                resources['traps'] = 1;
            } else {
                resources['traps']++;
            }
            if(resources['traps'] >= 5){
                get("build-trap").remove();
                updateBuildList();
            }
            updateTraps();
            break;
        case "Basket":
            resources['wood'] -= 20;
            updateResourceDisplay();
            perks.add("basket");
            get("build-basket").remove();
            updateBuildList();
            break;
        case "Harness":
            resources['wood'] -= 25;
            if(!resources['harness']){
                resources['harness'] = 1;
            } else {
                resources['harness']++;
            }
            updateResourceDisplay();
            updateMonCard('harness');
            break;

    }
}
function updateTraps(){
    trapWrapper = get("trap-wrapper");
    trapButton = get('check-traps');
    trapWrapper.classList.remove('hidden');
    trapNumText = get("trap-num-text");
    trapNumText.innerText = "Traps " + resources['traps'] + "   ";
    if(resources['traps'] < 1){
        trapButton.disabled = true;
    } else if (trapCooldown.val < 1){
        trapButton.disabled = false;
        trapButton.innerText = "Check Traps"
    } else {
        trapButton.disabled = true;
        trapButton.innerText = "Check Traps (" + trapCooldown.val + "s)";
    }
}
function checkTraps(){
    let rnd = Math.floor(Math.random()*20);
    if(rnd > 4) {
        resources['meat'] += Math.floor(Math.random()*(2+resources['traps']))+3;
        get('trap-text').innerText = "You kill and harvest the animal" + ((resources['traps'] > 1)?"s":"") + " in your trap" + ((resources['traps'] > 1)?"s":"");
        alignment -= 1;
    } else {
        get('trap-text').innerText = "Your trap" + ((resources['traps'] > 1)?"s are":" is") + " empty";
    }
    if(rnd > 10) {
        resources['meat'] += Math.floor(Math.random()*(2+resources['traps']));
    }
    if(rnd > 17) {
        resources['meat'] += 10;
    }
    updateResourceDisplay();
    if(Math.floor(Math.random()*5) == 0){
        resources['traps']--;
        updateTraps();
        get('trap-text').innerText += ". Unfortunately " + ((resources['traps'] > 1)?"one of your traps ":"your trap ") + "has been broken";
        if(get('build-trap') == null){
            newChild(buildList,"option","build-trap","Trap");
            updateBuildList();
        }
    }
    trapCooldown.val = 45;
    cooldown(trapCooldown,updateTraps);
    updateTraps();
}

function get(id){
    return document.getElementById(id);
}

function setOnClick(button,onClick){
    button.addEventListener('click',onClick);
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.removedNodes.forEach((node) => {
                if (node === button) {
                    //console.log("button deleted. Removing click listener");
                    button.removeEventListener('click',onClick);
                    observer.disconnect();
                }
            });
        });
    });
    observer.observe(button.parentNode,{ childList: true });
}
function newChild(parent,type,id,text,classList){
    child = document.createElement(type);
    if(id != null){
    child.id = id;
    }
    child.innerText = text;
    if(classList != null){
    child.classList = classList;
    }
    parent.appendChild(child);
    return child;
}
function updateMonList(){
    monMenu = get("mon-menu");
    if (monMenu.classList == "hidden"){
        monMenu.classList = "flex";
    }
    monList = get("select-mon");
    let selection = monList.value;
    if(selection == null || selection == '') selection = "0";
    monList.innerHTML = "";
    for(i = 0; i < mons.length; i++){
        monList.innerHTML += "<option value=\"" + i + "\">" + mons[i].nickname + "</option>";
    }
    monList.value = selection;
}
//DOES NOT ADD RESOURCES
//Returns a function that adds the desired resource. This is for use in setInterval()
function produceResource(resource, amount){
    return function() {
        resources[resource] += amount;
        updateResourceDisplay();
    }
}
//Like produce resource except it also consumes resources and can have multiple entries. ALL NEGATIVE ENTRIES SHOULD BE AT THE BEGINNING
function produceConsumeResource(resourceNames,amount){
    return function() {
        for(i in resourceNames){
            if(amount[i] < 0){
                resources[resourceNames[i]] += amount[i];
                if (resources[resourceNames[i]] < 0){
                    resources[resourceNames[i]] -= amount[i];
                    return;
                }
            } else {
                resources[resourceNames[i]] += amount[i];
            }
        }
        
        updateResourceDisplay();
    }
}

function removeTree(node){
    if(node.firstChild){
        for (child of node.children){
            removeTree(child);
        }
    }
    node.replaceChildren();
}
function feedCurrMon() {
    let mon = mons[get("select-mon").value];
    unregisterListener(feedListener);
    let feedCost = 5*mons.length + 10;
    if(mon.carnivore){
        resources['meat'] -= feedCost;
    } else {
        resources['fruit'] -= feedCost;
    }
    updateResourceDisplay();
    if(mons.length < 2){
        //first mon tames easier
        mon.tame += 40; 
    } else {
        mon.tame += Math.floor(Math.random()*20)+10;
    }
    if (mon.tame > 100){mon.tame = 100;}
    mon.feedCooldown.val = 20;
    cooldown(mon.feedCooldown,function () {updateMonCard("feed button")});
    updateMonCard("feed button");
    updateMonCard("tameness");
}
function updateMonCard(element)
{   
    if(element == null){
    let currCard = get("mon-card");
    if(currCard != null){
        removeTree(currCard);
        currCard.remove();
    }
    selectedMon = get("select-mon").value;
    newCard = mons[selectedMon].getDisplay();
    newCard.style = "top:40px";
    newCard.id = "mon-card";
    let monData = get("mon-menu");
    monData.appendChild(newCard);
    } else {
        selectedMon = get("select-mon").value;
        let mon = mons[selectedMon];
        switch(element){
            case "name":
                nameDiv = get("mon-name");
                nameDiv.innerText = mon.nickname;
            break;
            case "tameness":
                tameDiv = get("mon-tameness");
                tameDiv.innerText = "tameness " + mon.tame + "%";
                updateMonCard("feed button");
                updateMonCard("harness");
                //Fall through. If we ever update tameness, we need to check the feed button and activities tab
            case "task":
                if(mon.tame >= 50){
                    if(get("task-text") == null){
                        newChild(get("mon-stats"),"div","task-text","Current Task:","monentry");
                    }
                    let actionList = get("action-list");
                    if(actionList == null){
                        actionList = newChild(get("mon-actions"),"select","action-list","")
                        actionList.style.minWidth = "50px";
                        actionList.style.padding = "2px";
                        newChild(actionList,"option",null,"Resting");
                        if(mon.carnivore){
                            newChild(actionList,"option",null,"Hunting");
                        }else 
                        {
                            newChild(actionList,"option",null,"Gathering");
                        }
                        newChild(actionList,"option",null,"Collecting");
                        if(mon.element == "astral" || mon.element == "water"){
                            newChild(actionList,"option",null,"Cultivating");
                        } else if (mon.element == "earth"){
                            newChild(actionList,"option",null,"Digging");
                        }else if (mon.element == "fire"){
                            newChild(actionList,"option",null,"Smelting");
                        }

                        actionList.selectedIndex = mon.selectedTask;
                        actionList.addEventListener('change', function(){
                            mon.selectedTask = actionList.selectedIndex;
                            updateMonCard("task");
                        });
                    }
                    actionList.options[0].text = "Resting";
                    if(mon.carnivore){
                        actionList.options[1].text = "Hunting";
                    } else {
                        actionList.options[1].text = "Gathering";
                    }
                    actionList.options[2].text = "Collecting";
                    if(mon.element == "astral" || mon.element == "water"){
                        actionList.options[3].text = "Cultivating";
                    } else if (mon.element == "earth"){
                        actionList.options[3].text = "Digging";
                    }else if (mon.element == "fire"){
                        actionList.options[3].text = "Smelting";
                    }
        
                    actionList.selectedIndex = mon.selectedTask;
                    taskFlavor = get("task-flavor");
                    taskOutput = get("task-output");
                    if(taskFlavor == null) {taskFlavor = newChild(get("mon-stats"),"div","task-flavor","","monentry");
                        taskOutput = newChild(get("mon-actions"),"div","task-output","","monentry");}
                    let amount;
                    switch(actionList.options[actionList.selectedIndex].text){
                        case "Resting":
                            taskFlavor.innerText = "Resting...";
                            taskOutput.innerText = ".";
                            if(mon.resourceProduction != null){
                                intervals.delete(mon.resourceProduction);
                                mon.resourceProduction = null;
                            }
                            break;
                        case "Gathering":
                            taskFlavor.innerText = "Producing ";
                            amount = BASE_MON_FRUIT_PRODUCTION * mon.tame/100 * ((mon.traits.has('harness'))?1.5:1.0) * ((mon.element == "air" || mon.element == "water")?1.2:1.0);
                            taskOutput.innerText = amount.toFixed(1) + " fruit/10s";
                            if(mon.resourceProduction != null){
                                intervals.delete(mon.resourceProduction);
                            }
                            mon.resourceProduction = produceResource("fruit",amount);
                            intervals.add(mon.resourceProduction);
                            break;
                        case "Hunting":
                            taskFlavor.innerText = "Producing ";
                            amount = BASE_MON_MEAT_PRODUCTION * mon.tame/100 * ((mon.element== "air")?1.2:1.0);
                            taskOutput.innerText = amount.toFixed(1) + " meat/10s";
                            if(mon.resourceProduction != null){
                                intervals.delete(mon.resourceProduction);
                            }
                            mon.resourceProduction = produceResource("meat",amount);
                            intervals.add(mon.resourceProduction);
                            break;
                        case "Collecting":
                            taskFlavor.innerText = "Producing ";
                            amount = BASE_MON_FRUIT_PRODUCTION * mon.tame/100 * ((mon.element== "air")?1.2:1.0);
                            taskOutput.innerText = amount.toFixed(1) + " wood/10s";
                            if(mon.resourceProduction != null){
                                intervals.delete(mon.resourceProduction);
                            }
                            mon.resourceProduction = produceResource("wood",amount);
                            intervals.add(mon.resourceProduction);
                            break;
                        case "Cultivating":
                            taskFlavor.innerText = "Producing \nConsuming ";
                            amount = BASE_MON_HERB_PRODUCTION * mon.tame/100;
                            consume = BASE_MON_CONSUME;
                            monEats = ((mon.carnivore)?"meat":"fruit");
                            taskOutput.innerText = amount.toFixed(2) + " herbs/10s\n" + consume.toFixed(1) + " " + monEats + "/10s";
                            if(mon.resourceProduction != null){
                                intervals.delete(mon.resourceProduction);
                            }
                            mon.resourceProduction = produceConsumeResource([monEats,"mystic herbs"],[consume*-1,amount]);
                            intervals.add(mon.resourceProduction);
                        break;
                        case "Digging":
                            taskFlavor.innerText = "Producing \nConsuming ";
                            amount = BASE_MON_ORE_PRODUCTION * mon.tame/100;
                            consume = BASE_MON_CONSUME;
                            monEats = ((mon.carnivore)?"meat":"fruit");
                            taskOutput.innerText = amount.toFixed(1) + " ore/10s\n" + consume.toFixed(1) + " " + monEats + "/10s";
                            if(mon.resourceProduction != null){
                                intervals.delete(mon.resourceProduction);
                            }
                            mon.resourceProduction = produceConsumeResource([monEats,"ore"],[consume*-1,amount]);
                            intervals.add(mon.resourceProduction);
                            break;
                        case "Smelting":
                            taskFlavor.innerText = "Producing \nConsuming \n ";
                            amount = BASE_MON_ORE_PRODUCTION * mon.tame/100;
                            consume = BASE_MON_CONSUME;
                            taskOutput.innerText = amount.toFixed(1) + " metal/10s\n" + consume.toFixed(1) + " wood/10s\n" + "1.0 ore/10s";
                            if(mon.resourceProduction != null){
                                intervals.delete(mon.resourceProduction);
                            }
                            mon.resourceProduction = produceConsumeResource(["wood","ore","metal"],[consume*-1,-1,amount]);
                            intervals.add(mon.resourceProduction);
                            break;
                    }
                } else {
                    let taskText = get("task-text");
                    if(taskText) taskText.remove();
                    let actionList = get("action-list");
                    if(actionList) actionList.remove();
                    let taskFlavor = get("task-flavor");
                    if(taskFlavor) taskFlavor.remove();
                    let taskOutput = get("task-output");
                    if(taskOutput) taskOutput.remove();
                }
                break;
            case "feed button":
                let feedMon = get("feed-button");
                if(feedMon == null){
                    feedMon = newChild(get("mon-actions"),"button","feed-button","Feed","small");
                }
                if(mon.tame < 100){
                    if(mon.feedCooldown.val > 0){
                        feedMon.innerText = "Feed " + mon.feedCooldown.val + "s"
                        let feedCost = 5*mons.length + 10;
                        if(mon.carnivore){
                            feedMon.style.title = "meat " + feedCost;
                        } else {
                        feedMon.style.title = "fruit " + feedCost;
                        }
                        feedMon.disabled = true;
                    } else {
                        feedMon.innerText = "Feed"
                        let feedCost = 5*mons.length + 10;
                        feedMon.removeEventListener('click',feedCurrMon);
                        if(mon.carnivore){
                            feedListener = registerButtonListener(feedMon,["meat"],[feedCost]);
                        }else {
                            feedListener = registerButtonListener(feedMon,["fruit"],[feedCost]);
                        }
                        setOnClick(feedMon,feedCurrMon);
                    }
                } else {
                    feedMon.style.visibility = "hidden";
                    //monActions.appendChild(document.createElement("h4"));
                }
            break;
            case "harness":
                harnessButton = get('harness-button');
                if(mon.tame >= 75 && !mon.traits.has('harness') && resources['harness']){
                    
                    if(!harnessButton){
                        harnessButton = newChild(get('mon-actions'),'button','harness-button',"Equip Harness",'small button');
                        spacing = newChild(get('mon-stats'),'button',null,'','small button');
                        spacing.style.visibility = 'hidden';
                        setOnClick(harnessButton,() => {
                            resources['harness']--;
                            updateResourceDisplay();
                            mon.traits.add('harness');
                            updateMonCard();
                        });
                    }
                } else {
                    if(harnessButton){
                        harnessButton.remove();
                    }
                }
            break;
            case "confer":
                let conferButton1 = get("confer-button-1");
                let conferButton2 = get("confer-button-2");
                if(!conferButton1 && mon.element.length < 1 && perks.has('druid')){
                    let ele = (mon.carnivore)?"fire":"water";
                    let ele2 = (mon.eleChoice == 0)?"air":"earth";
                    conferButton1 = newChild(get('mon-stats'),'button','confer-button-1','Confer ' + ele,"small button");
                    conferButton2 = newChild(get('mon-actions'),'button','confer-button-2','Confer ' + ele2,"small button");
                    registerButtonListener(conferButton1,["mystic herbs"],[4]);
                    registerButtonListener(conferButton2,["mystic herbs"],[4]);
                    setOnClick(conferButton1,() => {
                        conferButton1.remove();
                        conferButton2.remove();
                        resources['mystic herbs'] -=4;
                        updateResourceDisplay();
                        mon.element = ele;
                        updateMonCard();
                    });
                    setOnClick(conferButton2,() => {
                        conferButton1.remove();
                        conferButton2.remove();
                        resources['mystic herbs'] -=4;
                        updateResourceDisplay();
                        mon.element = ele2;
                        updateMonCard();
                    });
                }
            break;
        }
    }
}

//we pass in a wrapper because I want to use pointers but can't
function cooldown(wrapper,activateEveryCycle){
    //console.log("Cooldown decremented");
    setTimeout(function() {
        wrapper.dec();
        if(activateEveryCycle != null){
            activateEveryCycle();
        }
        if (wrapper.val > 0){
            cooldown(wrapper,activateEveryCycle);
        }
    }, 1000);
}

//This class wraps a button so that we have a universal listener interface. 
class ButtonWrapper{
    /*
        client is the button div
        resource Names is a list of variables representing the resources in the cost
        resource Values is a list of ints, each one representing the amount of the corresponding resource required
        ex. resourceNames = [fruit,meat] resourceValues = [20,10] means that this button requires 20 fruit and 10 meat to be unlocked
    */
    constructor(button, resourceNames,resourceValues){
        this.client = button;
        this.resourceNames = resourceNames;
        this.resourceValues = resourceValues;
    }
    notify(){
        for(i = 0; i < this.resourceNames.length; i++){
            //For each resource requirement, see if we fail it. If any fail, the button becomes disabled
            if(getResource(this.resourceNames[i]) < this.resourceValues[i]){
                this.client.disabled = true;
                return;
            }
        }
        this.client.disabled = false;
    }
}

//A generic listener class. Give it the function to be called when the criteria are met
class GenericListener {
    constructor(notifyFunction, resourceNames, resourceCosts){
        this.fun = notifyFunction;
        this.resourceNames = resourceNames;
        this.resourceCosts = resourceCosts;
    }

    notify(){
        for(i = 0; i < this.resourceNames.length; i++){
            //For each resource requirement, see if we fail it. If any fail, stop and wait till the next time
            if(getResource(this.resourceNames[i]) < this.resourceCosts[i]){
                return;
            }
        }
        this.fun();
        unregisterListener(this);
    }
}

class Mon{
    constructor(){
        this.nickname = null;
        this.tame = 0;
        this.traits = new Set([]);
        this.species = "fox";
        this.element = "";
        this.carnivore = false;
        this.feedCooldown = new Box(0);
        this.resourceProduction = null;
        this.selectedTask = 0;
        this.eleChoice = Math.floor(Math.random()*2);


        this.level = 0;
        this.exp = 0;
        this.speed = 2;
        this.fly = false;
        this.maxhp = 10;
        //this.attack = "claw";
        this.size = 6;

    }


    getDisplay(){
        let monDiv = document.createElement("div");
        monDiv.classList = "monsheet";
        let monStats = newChild(monDiv,"div","mon-stats","","moncolumn");
        let monActions = newChild(monDiv,"div","mon-actions","","moncolumn");
        let monName = newChild(monStats,"div","mon-name",this.nickname,"monentry");
        let monRename = newChild(monActions,"button","mon-rename","Rename","small");
        setOnClick(monRename, () =>
        {
            let newName = prompt("Enter a new nickname for " + this.nickname);
            if(newName != null){
                this.nickname = newName;
                monName.innerText = newName;
                updateMonList();
            }
        });
        let monDescription = "";
        let ele = this.element;
        if (ele == null){
            ele = "";
        }
        if(perks.has('druid')){
            monDescription = ele + " " + this.species + " level " + this.level;
        } else {
            monDescription = ele + " " + this.species
        }
        let monDescriptionDiv = newChild(monStats,"div",null,monDescription,"monentry");
        monDescriptionDiv.style = "font-size:10px";
        let whitespace = document.createElement("p");
        whitespace.style = "font-size:10px";
        monActions.appendChild(whitespace);

        let tameness = newChild(monStats,"p","mon-tameness","tameness " + this.tame + "%","monentry");

        if(this.tame < 100){
            if(this.feedCooldown.val > 0){
                let feedMon = newChild(monActions,"button","feed-button","Feed " + this.feedCooldown.val + "s","small");
                let feedCost = 5*mons.length + 10;
                feedMon.style.title = "fruit " + feedCost;
                feedMon.disabled = true;
            } else {
            let feedMon = newChild(monActions,"button","feed-button","Feed","small");
            let feedCost = 5*mons.length + 10;
            feedMon.removeEventListener('click',feedCurrMon);
            if(this.carnivore){
                feedListener = registerButtonListener(feedMon,["meat"],[feedCost]);
            }else {
                feedListener = registerButtonListener(feedMon,["fruit"],[feedCost]);
            }
            setOnClick(feedMon,feedCurrMon);
            }
        } else {
            let feedMon = newChild(monActions,"button","feed-button","Feed " + this.feedCooldown.val + "s","small");
            feedMon.style.visibility = "hidden";
        }
        
        if(this.tame >= 50){
            newChild(monStats,"div","task-text","Current Task:","monentry");
            let actionList = newChild(monActions,"select","action-list","");
            actionList.style.minWidth = "50px";
            actionList.style.padding = "2px";
            newChild(actionList,"option",null,"Resting");
            if(this.carnivore){
                newChild(actionList,"option",null,"Hunting");
            }else 
            {
                newChild(actionList,"option",null,"Gathering");
            }
            newChild(actionList,"option",null,"Collecting");
            if(this.element == "astral" || this.element == "water"){
                newChild(actionList,"option",null,"Cultivating");
            } else if (this.element == "earth"){
                newChild(actionList,"option",null,"Digging");
            } else if (this.element == "fire"){
                newChild(actionList,"option",null,"Smelting");
            }
            if(perks.has('training ground')){
                newChild(actionList,"option",null,"Training");
            }

            actionList.selectedIndex = this.selectedTask;
            actionList.addEventListener('change', function(){
                console.log("Changed activity");
                mons[selectedMon].selectedTask = actionList.selectedIndex;
                updateMonCard("task");
            });
            taskFlavor = newChild(monStats,"div","task-flavor","","monentry");
            taskOutput = newChild(monActions,"div","task-output","","monentry");
            let amount;
            switch(actionList.options[actionList.selectedIndex].text){
                case "Resting":
                    taskFlavor.innerText = "Resting...";
                    taskOutput.innerText = ".";
                    if(this.resourceProduction != null){
                        intervals.delete(this.resourceProduction);
                        this.resourceProduction = null;
                    }
                    break;
                case "Gathering":
                    taskFlavor.innerText = "Producing ";
                    amount = BASE_MON_FRUIT_PRODUCTION * this.tame/100 * ((this.traits.has('harness'))?1.5:1.0) * ((this.element == "water" || this.element== "air")?1.2:1.0);
                    taskOutput.innerText = amount.toFixed(1) + " fruit/10s";
                    if(this.resourceProduction != null){
                        intervals.delete(this.resourceProduction);
                        
                    }
                    this.resourceProduction = produceResource("fruit",amount);
                    intervals.add(this.resourceProduction);
                    break;
                case "Hunting":
                    taskFlavor.innerText = "Producing ";
                    amount = BASE_MON_MEAT_PRODUCTION * this.tame/100 * ((this.element== "air")?1.2:1.0);
                    taskOutput.innerText = amount.toFixed(1) + " meat/10s";
                    if(this.resourceProduction != null){
                        intervals.delete(this.resourceProduction);
                    }
                    this.resourceProduction = produceResource("meat",amount);
                    intervals.add(this.resourceProduction);
                    break;
                case "Collecting":
                    taskFlavor.innerText = "Producing ";
                    amount = BASE_MON_FRUIT_PRODUCTION * this.tame/100 * ((this.element== "air")?1.2:1.0);
                    taskOutput.innerText = amount.toFixed(1) + " wood/10s";
                    if(this.resourceProduction != null){
                        intervals.delete(this.resourceProduction);
                    }
                    this.resourceProduction = produceResource("wood",amount);
                    intervals.add(this.resourceProduction);
                    break;
                case "Cultivating":
                    taskFlavor.innerText = "Producing \nConsuming ";
                    amount = BASE_MON_HERB_PRODUCTION * this.tame/100;
                    consume = BASE_MON_CONSUME;
                    monEats = ((this.carnivore)?"meat":"fruit");
                    taskOutput.innerText = amount.toFixed(2) + " herbs/10s\n" + consume.toFixed(1) + " " +  monEats + "/10s";
                    if(this.resourceProduction != null){
                        intervals.delete(this.resourceProduction);
                    }
                    this.resourceProduction = produceConsumeResource([monEats,"mystic herbs"],[consume*-1,amount]);
                    intervals.add(this.resourceProduction);
                break;
                case "Digging":
                    taskFlavor.innerText = "Producing \nConsuming ";
                    amount = BASE_MON_ORE_PRODUCTION * this.tame/100;
                    consume = BASE_MON_CONSUME;
                    monEats = ((this.carnivore)?"meat":"fruit");
                    taskOutput.innerText = amount.toFixed(1) + " ore/10s\n" + consume.toFixed(1) + " " + monEats + "/10s";
                    if(this.resourceProduction != null){
                        intervals.delete(this.resourceProduction);
                    }
                    this.resourceProduction = produceConsumeResource([monEats,"ore"],[consume*-1,amount]);
                    intervals.add(this.resourceProduction);
                    break;
                case "Smelting":
                    taskFlavor.innerText = "Producing \nConsuming \n ";
                    amount = BASE_MON_ORE_PRODUCTION * this.tame/100;
                    consume = BASE_MON_CONSUME;
                    taskOutput.innerText = amount.toFixed(1) + " metal/10s\n" + consume.toFixed(1) + " wood/10s\n" + "1.0 ore/10s";
                    if(this.resourceProduction != null){
                        intervals.delete(this.resourceProduction);
                    }
                    this.resourceProduction = produceConsumeResource(["wood","ore","metal"],[consume*-1,-1,amount]);
                    intervals.add(this.resourceProduction);
                    break;
            
            }
        }
        if(this.tame >= 75 && !this.traits.has('harness') && resources['harness']){
            let harnessButton = newChild(monActions,'button','harness-button',"Equip Harness",'small button');
            let spacing = newChild(monStats,'button',null,'','small button');
            spacing.style.visibility = 'hidden';
            setOnClick(harnessButton,() => {
                resources['harness']--;
                updateResourceDisplay();
                this.traits.add('harness');
                updateMonCard();
            });
        }
        if(this.element.length < 1 && perks.has('druid')){
            let element = (this.carnivore)?"fire":"water";
            let element2 = (this.eleChoice == 0)?"air":"earth";
            let conferButton1 = newChild(monStats,"button",'confer-button-1','Confer ' + element,"small button");
            let conferButton2 = newChild(monActions,"button",'confer-button-2','Confer ' + element2,"small button");
            registerButtonListener(conferButton1,["mystic herbs"],[4]);
            registerButtonListener(conferButton2,["mystic herbs"],[4]);
            setOnClick(conferButton1,() => {
                conferButton1.remove();
                conferButton2.remove();
                resources['mystic herbs'] -=4;
                updateResourceDisplay();
                this.element = element;
                updateMonCard();
            });
            setOnClick(conferButton2,() => {
                conferButton1.remove();
                conferButton2.remove();
                resources['mystic herbs'] -=4;
                updateResourceDisplay();
                this.element = element2;
                updateMonCard();
            });
        }
        


        return monDiv;
    }
    updateExp(){
        let nextLevel = 400+100*this.level;
        if (this.exp >= nextLevel){
            this.exp -= nextLevel;
            this.level++;
            updateMonCard("level");
            this.maxhp += 1 + Math.floor(size/2) + Math.floor(Math.random()*3);
        }
    }
    getCombatStats(){
        //dice size is same as mon size
        let avgDamage = Math.floor((1.25+this.size/8+((this.element == 'fire')?0.5:0)+((this.element == 'air')?0.25:0))*this.level)+2;
        let numDice = Math.floor(avgDamage/((this.size+1)/2));
        let dmgBonus = avgDamage - Math.ceil(numDice*(this.size+1)/2);
        let dr = Math.floor((this.size/16-((this.element == 'air')?0.2:0))*this.level)+((this.element == 'earth')?3:0);
        let stats = new CombatCreature(this.nickname,this,this.level,this.maxhp,dr,this.speed+((this.element == 'air')?1:0),this.size,numDice,dmgBonus,1);
        stats.fly = this.fly||this.element=='air';
        stats.swim = this.element == 'water';
        stats.burrow = this.element == 'earth';
        stats.flavor = this.element + " " + this.species;
        return stats;
    }
}


class CombatCreature {
    constructor(name,card,level,maxhp,dr,speed,dmgDice,diceCount,dmgBonus,team){
        this.level = level;
        this.card = card;
        this.name = name;
        this.symbol = name.charAt(0);
        this.maxhp = maxhp;
        this.currhp = maxhp;
        this.dr = dr;
        this.speed = speed;
        this.dmgDice = dmgDice;
        this.diceCount = diceCount;
        this.dmgBonus = dmgBonus;
        this.fly = false;
        this.swim = false;
        this.burrow = false;
        this.team = team;
        this.index = null;
        this.flavor = "";

        this.exhausted = false;
        this.location;
    }

    clone(){
        let newCreature = new CombatCreature(this.name,this.card, this.level,this.maxhp,this.dr,this.speed,this.dmgDice,this.diceCount,this.dmgBonus,this.team);
        newCreature.fly = this.fly;
        newCreature.swim = this.swim;
        newCreature.burrow = this.burrow;
        newCreature.symbol = this.symbol;
        return newCreature;
    }

    simpleAIMove(scene) {
        let location = this.location;
        let target = this.searchArea(location,7,scene);
        if(target == null){
            let rnd = Math.floor(Math.random()*5);
            switch(rnd){
                case 0:
                    target = C(location.x,location.y+1);
                    break;
                case 1:
                    target = C(location.x+1,location.y);
                    break;
                case 2:
                    target = C(location.x-1,location.y);
                    break;
                case 3:
                    target = C(location.x,location.y-1);
                    break;
                case 4:
                default:
                    target = location;
            }
            if(target.x < 0) target.x = 0;
            if(target.y < 0) target.y = 0;
            if(target.x >= scene.width) target.x = scene.width - 1;
            if(target.y >= scene.height) target.y = scene.height - 1;
            if(scene.at(target).passable(this)){
                scene.moveCreature(location.x,location.y,target.x,target.y);
            }
        } else {
            let tileTarget;
            if(target.path.length <= this.speed){
                tileTarget = target.coord;
            } else {
                tileTarget = target.path[this.speed-1];
            }
            let i = 2;
            while(tileTarget && scene.at(tileTarget).creature){
                tileTarget = target.path[this.speed-i];
                i++;
            }
            if(tileTarget){
                scene.moveCreature(location.x,location.y,tileTarget.x,tileTarget.y);
                
            }
            let enemies = scene.getAdjEnemy(this);
            if(enemies.length > 0){
                scene.attack(this,enemies[Math.floor(Math.random()*enemies.length)]);
            }
        }
    }

    searchArea(location,distance,scene){
        let searchQueue = new Queue();
        let distances = new Queue();
        let searched = new Set();
        searchQueue.add({coord: C(location.x,location.y+1),path:[C(location.x,location.y+1)]});
        distances.add(distance);
        searchQueue.add({coord: C(location.x,location.y-1),path:[C(location.x,location.y-1)]});
        distances.add(distance);
        searchQueue.add({coord: C(location.x+1,location.y),path:[C(location.x+1,location.y)]});
        distances.add(distance);
        searchQueue.add({coord: C(location.x-1,location.y),path:[C(location.x-1,location.y)]});
        distances.add(distance);
        while(searchQueue.next()){
            let ele = searchQueue.pop();
            let currPath = ele.path;
            location = ele.coord;
            let newdist = distances.pop() - 1;
            if(newdist < 0) continue;
            let tile = scene.at(location)
            if(tile && tile.creature){
                if(tile.creature.team != this.team){
                    return {coord:ele.path[ele.path.length-2],path:ele.path.slice(0,-1)};
                }
            }
            searched.add(location);
            if(tile && tile.passable(this)){
                if(!searched.has(C(location.x+1,location.y))) {
                    searchQueue.add({coord: C(location.x+1,location.y),path:[...currPath,C(location.x+1,location.y)]});
                    distances.add(newdist);
                }
                if(!searched.has(C(location.x-1,location.y))) {
                    searchQueue.add({coord: C(location.x-1,location.y),path:[...currPath,C(location.x-1,location.y)]});
                    distances.add(newdist);
                }
                if(!searched.has(C(location.x,location.y+1))){
                    searchQueue.add({coord: C(location.x,location.y+1),path:[...currPath,C(location.x,location.y+1)]});
                    distances.add(newdist);
                } 
                if(!searched.has(C(location.x,location.y-1))){
                    searchQueue.add({coord: C(location.x,location.y-1),path:[...currPath,C(location.x,location.y-1)]});
                    distances.add(newdist);
                } 
            }
        }
        return null;
    }

}
function getTileName(symbol){
    switch(symbol){
        case ".":
            return "Plains";
        case "~":
            return "Water";
        case "^":
            return "Mountain";
        case "#":
            return "Bridge";
        case "%":
            return "Foliage"; 
        default:
            return "Generic";
    }
}
class Tile {
    constructor(letter, color = "#F0F0F0") {
        this.letter = letter;
        this.color = color;
        //this.contents = new Set();
        this.creature = null;
        this.armorBonus = 0;
        this.moveCost = 1;
        switch(this.letter){
            case '%':
                this.moveCost = 2;
                this.armorBonus = 2;
                break;
            case '^':
                this.moveCost = 2;
                this.armorBonus = 3;
        }
    }

    passable(creature){
        if(this.creature){
            if(this.creature.team != creature.team){
                return false;
            }
        }
        switch(this.letter){
            case '|':
            case '-':
                return false;
            case '~':
                return creature.swim || creature.fly;
            case '^':
                return creature.burrow || creature.fly;
            case '.':
            case '%':
            default:
                return true;
        }
    }
}
class CombatScene {
    constructor(){
        this.map = [];
        this.width = 0;
        this.height = 0;
        this.selectedCreature = 0;
        this.selectedX = null;
        this.selectedY = null;
        this.moveTiles = new Set();
        this.creatures = new Set();
        this.allyTiles = new Set();
        this.enemyTiles = new Set();
        
        this.targetEnemies = null;
    }
    initEmptyMap(width,height) {
        this.map = Array.from({ length: height }, () =>
            Array.from({ length: width }, () => new Tile(' '))
        );
        this.redraw();
        this.addClickListener();
    }
    async loadMapFromFile(fileUrl) {
        try {
            const response = await fetch(fileUrl);
            const text = await response.text();

            const lines = text.trim().split('\n').map(line => line.trim());
            this.height = lines.length;
            this.width = lines[0].length;

            this.map = [];

            for (let i = 0; i < this.height; i++) {
                const row = [];
                for (let j = 0; j < this.width; j++) {
                    const char = lines[i][j];
                    let tile;
                    if(char == 'A'){
                        tile = new Tile('.');
                        this.allyTiles.add(C(j,i));
                    } else if (char == 'E'){
                        tile = new Tile('.');
                        this.enemyTiles.add(C(j,i));
                    }
                    else {
                        tile = new Tile(char);
                    }
                    
                    

                    row.push(tile);
                }
                this.map.push(row);
            }

            this.redraw(); // Draw the map once it's loaded
            this.addClickListener();
        } catch (error) {
            console.error("Error loading the map file:", error);
        }
    }
    addAllies(allyList){
        let i = 0;
        for(let tile of this.allyTiles){
            if(!allyList[i]){
                break;
            }
            this.addCreature(tile.x,tile.y,allyList[i]);
            i++;
        }
    }
    addEnemies(enemyList){
        let i = 0;
        for(let tile of this.enemyTiles){
            if(!enemyList[i]){
                break;
            }
            this.addCreature(tile.x,tile.y,enemyList[i]);
            i++;
        }
    }
    redraw(){
        const canvas = get("battle-map");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = this.width * TILE_SIZE;
        canvas.height = this.height * TILE_SIZE;

        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            let tileX = Math.floor(x / TILE_SIZE);
            let tileY = Math.floor(y / TILE_SIZE);
            if(tileX < 0 || tileX >= this.width){
                tileX = 0;
            }
            if(tileY < 0 || tileY >= this.height){
                tileY = 0;
            }
            const tile = this.map[tileY][tileX];
    
            if (tile && tile.creature) {
                let hoverCreature = tile.creature;
                let tooltipText = `${hoverCreature.name}\nlevel ${hoverCreature.level}\nhp ${hoverCreature.currhp}/${hoverCreature.maxhp}`;
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = 1;
                tooltip.style.display = 'block';
                tooltip.style.padding = '2px 4px';
                tooltip.innerText = tooltipText;
                tooltip.style.left = `${event.clientX + window.scrollX}px`;
                tooltip.style.top = `${event.clientY -155 + window.scrollY}px`;
            } else {
                
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = 0;
            }
        });
    
        canvas.addEventListener('mouseout', () => {
            //tooltip.style.display = 'none';
            tooltip.style.visibility = 'hidden';
        });

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                const tile = this.map[i][j];

                ctx.fillStyle = "#F0F0F0";
                if(this.moveTiles.has(this.map[i][j])){
                    if(this.selectedCreature.team == 1 && !this.selectedCreature.exhausted){
                        ctx.fillStyle = "#80A0D0";
                    } else {
                        ctx.fillStyle = "#909090";
                    }
                }
                ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);

                ctx.fillStyle = "#101010";
                if(tile.creature && tile.creature.exhausted) ctx.fillStyle = "#B0B0B0";
                ctx.font = "20px monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                let char = ((tile.creature)?tile.creature.symbol:tile.letter);
                ctx.fillText(char, j * TILE_SIZE + TILE_SIZE / 2, i * TILE_SIZE + TILE_SIZE / 2);
                if(this.targetEnemies != null){
                    if(this.targetEnemies.includes(tile.creature)){
                        ctx.fillStyle = "#D00000";
                        ctx.fillText("◎", j * TILE_SIZE + TILE_SIZE / 2, i * TILE_SIZE + TILE_SIZE / 2);
                    }
                }
            }
        }

    }
    at(coords){
        if(coords.x < 0 || coords.x >= this.width || coords.y < 0 || coords.y >= this.height) return null;
        //console.log(`At coords ${coords.x},${coords.y}`);
        return this.map[coords.y][coords.x];
    }
    addClickListener() {
        const canvas = get("battle-map");
        canvas.addEventListener("click", (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;


            const tileX = Math.floor(x / TILE_SIZE);
            const tileY = Math.floor(y / TILE_SIZE);


            const clickedTile = this.map[tileY][tileX];
            //console.log("Click on tile " + tileX + "," + tileY);
            if(this.targetEnemies != null){
                if(clickedTile.creature != this.selectedCreature){
                    if(this.targetEnemies.includes(clickedTile.creature)){
                        this.attack(this.selectedCreature,clickedTile.creature);
                        this.selectedCreature.exhausted = true;
                        this.targetEnemies = null;
                        this.deselectCreature();
                        
                    } else {
                        this.selectedCreature.exhausted = true;
                        this.targetEnemies = null;
                        this.deselectCreature();
                        this.selectCreature(tileX,tileY,clickedTile.creature);
                        
                    }
                } else {
                    this.selectedCreature.exhausted = true;
                    this.targetEnemies = null;
                    this.deselectCreature();
                    
                }
            } else{
                if (clickedTile.creature && clickedTile.creature != this.selectedCreature) {
                    this.selectCreature(tileX,tileY,clickedTile.creature);
                } else {
                    if(clickedTile.creature && clickedTile.creature == this.selectedCreature){
                        if(clickedTile.creature.team == 1 && !clickedTile.creature.exhausted){
                        let enemies = this.getAdjEnemy(this.selectedCreature);
                        if(enemies.length > 0){
                            this.targetEnemies = enemies;
                            this.moveTiles.clear();
                            this.redraw();
                            return;
                        }
                        }
                    }
                    if(this.moveTiles.has(this.map[tileY][tileX]) && this.selectedCreature.team == 1 && !this.selectedCreature.exhausted){
                        this.moveCreature(this.selectedX,this.selectedY,tileX,tileY);
                        let adjEnemies = this.getAdjEnemy(this.at(C(tileX,tileY)).creature);
                        if(adjEnemies.length > 0){
                            this.targetEnemies = adjEnemies;
                            this.moveTiles.clear();
                            this.redraw();
                        } else{
                            this.map[tileY][tileX].creature.exhausted = true;
                            this.deselectCreature();
                        }
                    } else {
                        this.deselectCreature();
                    }
                }
            }
        });
    }
    selectCreature(x,y,creature) {
        this.selectedCreature = creature;
        this.selectedX = x;
        this.selectedY = y;
        let battleInfo = get("battle-info");
        battleInfo.innerHTML = `<div style="font-size:12px">${getTileName(this.map[y][x].letter)}(${this.map[y][x].letter}) Tile</div>
${(creature.team == 1)?"Ally":"Enemy"} ${creature.name}<br>
<div style="font-size:12px">${creature.flavor} level  ${creature.level}</div>
Health  ${creature.currhp}/${creature.maxhp}<br>
Armor  ${creature.dr}(${(this.map[y][x].armorBonus < 0)?"-":"+"}${this.map[y][x].armorBonus})<br>
Attack  ${creature.diceCount}d${creature.dmgDice}+${creature.dmgBonus}<br>
Move  ${creature.speed} tiles<br>
${(creature.fly)?"Flying ":""}${(creature.swim)?"Swimming ":""}${(creature.burrow)?"Burrowing ":""}`;
        battleInfo.style.visibility = 'visible';
        this.moveTiles.clear();
        this.calcMovement(x,y,creature.speed+this.map[y][x].moveCost);
        this.redraw();
    }
    deselectCreature() {
        this.selectedCreature = null;
        this.selectedX = null;
        this.selectedY = null;
        this.moveTiles.clear();
        get('battle-info').style.visibility = 'hidden';
        this.redraw();
    }
    calcMovement(x,y,tiles){
        if(x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        let tile = this.map[y][x];
        if(!tile.passable(this.selectedCreature)) return;

        if(!tile.creature){
            this.moveTiles.add(this.map[y][x]);
        }
        tiles -= tile.moveCost; 
        if(tiles < 1) return;
        else {
            this.calcMovement(x+1,y,tiles);
            this.calcMovement(x-1,y,tiles);
            this.calcMovement(x,y+1,tiles);
            this.calcMovement(x,y-1,tiles);
        }
    }
    getAdjEnemy(creature){
        let enemies = [];
        let adjacents = [];
        let tileTarget = creature.location;
        adjacents.push(C(tileTarget.x+1,tileTarget.y));
        adjacents.push(C(tileTarget.x-1,tileTarget.y));
        adjacents.push(C(tileTarget.x,tileTarget.y+1));
        adjacents.push(C(tileTarget.x,tileTarget.y-1));
        for(let i = 0; i < 4; i++){
            let tileAttack = this.at(adjacents[i]);
            if(tileAttack != null && tileAttack.creature != null && tileAttack.creature.team != creature.team){
                enemies.push(tileAttack.creature);
            }
        }
        return enemies;
    }
    moveCreature(startx,starty,endx,endy,creature){
        let targetCreature = creature;
        if(startx != null && starty != null){
            let startTile = this.map[starty][startx];
            targetCreature = startTile.creature;
            startTile.creature = null;
        } else {
            this.creatures.add(creature);
        }
        if(endx != null && endy != null){
            let targetTile = this.map[endy][endx]; //Note that 2d arrays are often y,x but we use x,y with the function arguments cause I like it better
            if(targetTile.creature) console.log(`Error: creature already exists at ${endx},${endy}. Deleting it`);
            targetTile.creature = targetCreature;
            targetCreature.location = C(endx,endy);
        } else {
            this.creatures.delete(targetCreature);
        }
        this.redraw();
    }
    addCreature(x,y,creature){
        this.moveCreature(null,null,x,y,creature);
    }
    removeCreature(x,y){
        this.moveCreature(x,y);
    }
    async endTurn() {
        get('end-turn').disabled = true;
        for(let creature of this.creatures){
            if(creature.team == 1){
                creature.exhausted = true;
            }
        }
        for(let enemy of this.creatures){
            if(enemy.team == 1) continue;
            enemy.simpleAIMove(this);
            await new Promise(r => setTimeout(r, 1000));
        }        

        for(let creature of this.creatures){
            if(creature.team == 1){
                creature.exhausted = false;
            }
        }
        this.redraw();
        get('end-turn').disabled = false;

    }
    attack(agrCreature,defCreature){
        let damage = agrCreature.dmgBonus;
        for(let i = 0; i < agrCreature.diceCount; i++){
            damage += Math.floor(Math.random()*agrCreature.dmgDice) + 1
        }
        damage = Math.max(Math.floor(damage/2),damage-(defCreature.dr*Math.ceil(defCreature.level/3))-this.at(defCreature.location).armorBonus);
        defCreature.currhp -= damage;
        let notification = get('battle-notification');
        notification.innerText = `${agrCreature.name} attacks ${defCreature.name} dealing ${damage} damage.`;
        if(defCreature.currhp < 1){
            if(defCreature.team == 1){
                notification.innerText += ` ${defCreature.name} retreats to the grove!`;
                defCreature.card.tame -= Math.floor(Math.random()*20)+10;
                updateMonCard("tame");
            } else {
                notification.innerText += ` ${defCreature.name} is killed!`;
            }
            this.removeCreature(defCreature.location.x,defCreature.location.y);
            if(agrCreature.team == 1){
                let leveldiff = Math.max(0,(defCreature.level - agrCreature.level + 4));
                let expGain = leveldiff*25+Math.floor(Math.random()*40 - 19);
                agrCreature.card.exp += Math.max(0,expGain);
                agrCreature.card.updateExp();
                notification.innerText += ` ${agrCreature.name} gains ${Math.max(0,expGain)} exp!`;
            }
        }
    }
}
class Node {
    constructor(val,next) {
        this.val = val;
        this.next = next;
    }
}
class Queue {
    construnctor(){
        this.head = null;
        this.tail = null;
    }
    add(val){
        let node = new Node(val)
        if(this.head == null){
            this.head = node;
        }
        if(this.tail != null){
            this.tail.next = node;
        }
        this.tail = node;
    }
    next() {
        if(!this.head) return null;
        return this.head.val;
    }
    pop(){
        let targetNode = this.head;
        this.head = this.head.next;
        if(this.tail == targetNode){
            this.tail = null;
        }
        return targetNode.val;
    }
}
function endTurn() {
    currentBattle.endTurn();
}
async function testBattle(battleURL){
    if(!get("war-tab"))
        newTab("war",
`
|     |
| War |
|     |
`);
    selectTab("war");
    get("map-container").classList.add("hidden");
    get('battle-map-container').classList.remove('hidden');
    currentBattle = new CombatScene();
    await currentBattle.loadMapFromFile(battleURL);

    testFox = new CombatCreature("Estelle",null,1,15,2,2,6,1,2,1);
    testHunter = new CombatCreature("Hunter",null,1,10,1,2,6,1,0,2);
    testLeader = new CombatCreature("Leader",null,2,20,2,2,8,1,1,2);

    if(mons.length < 1){
        let est = new Mon();
        est.element = 'astral';
        est.level = 2;
        est.maxhp = 20;
        est.nickname = "Estelle";
        est.species = "fox";
        est.speed = 3;
        est.tame = 100;
        mons.push(est);
    }
    if(mons.length < 2){
        let raven = new Mon();
        raven.level = 2;
        raven.maxhp = 14;
        raven.fly = true;
        raven.element = 'earth';
        raven.size = 4;
        raven.species = 'raven'
        raven.nickname = 'Corvus';
        raven.speed = 3;
        raven.tame = 100;
        mons.push(raven);
    }
    if(mons.length < 3) {
        let wolf = new Mon();
        wolf.level = 2;
        wolf.maxhp = 16;
        wolf.element = 'fire';
        wolf.size = 8;
        wolf.species = 'wolf';
        wolf.nickname = 'Wolfey';
        wolf.speed = 2;
        wolf.tame = 100;
        mons.push(wolf);
    }

    let allies = [mons[0].getCombatStats(),mons[1].getCombatStats(),mons[2].getCombatStats()];
    let enemies = [testLeader,testHunter.clone(),testHunter.clone(),testHunter.clone()];

    
    currentBattle.addAllies(allies);
    currentBattle.addEnemies(enemies);
    currentBattle.redraw();
}