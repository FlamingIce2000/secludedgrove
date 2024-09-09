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
let fruit = 0;
let meat = 0;
let wood = 0;
let mystical_herbs = 0;
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
let miscResource = {'traps':0};

let BASE_MON_FRUIT_PRODUCTION = 2;
let BASE_MON_MEAT_PRODUCTION = 4;
const ROW_SIZE = 50;
const EXPLORE_COST = 10;
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
    const actionButton = get('look-button');
    actionButton.addEventListener('click', () => {
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
    let berryDiv = document.createElement("div");
    berryDiv.innerText = "O";
    berryDiv.classList = "clickable berry";
    berryDiv.style.left = thisCoord.x + "px";
    berryDiv.style.top = thisCoord.y + "px";
    berryDiv.style.fontWeight = "bold";
    berryDiv.addEventListener('click',collectBerry);
    screen = get("bush-wrapper");
    screen.appendChild(berryDiv);

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
                case "grove":
                default:
                    activeScreen = get("grove-screen");
                    activeScreen.classList.add('active');
                    document.title = "A Secluded Grove";
                    if(mons.length < 1 && fruit > 12 && progress < 1){
                        firstMonEvent();
                    }
                break;
            }
            
}

function collectBerry(){
    const berryDiv = event.target;
    fruit++;
    if(perks.has('basket')){
        fruit++;
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
        newTab.addEventListener('click', () => {
            selectTab(tabName);
        });
        tabs.appendChild(newTab);
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
    switch(name){
        case "fruit":
            return fruit;
        case "meat":
            return meat;
        case "wood":
            return wood;
        case "mystical herbs":
            return mystical_herbs;
        case "harness":
            return miscResource['harness'];
    }

}

function updateResourceDisplay(){
    notifyListeners();
    let fruitCount = get("fruit-count");
    if(fruitCount == null){
        fruitCount = document.createElement("p");
        fruitCount.id = 'fruit-count';
        fruitCount.classList = "resource";
        let resourcesPage = get("resource-screen");
        resourcesPage.appendChild(fruitCount);
    }
    fruitCount.innerText = "fruit         " + Math.floor(fruit);

    let meatCount = get("meat-count");
    if(meatCount == null && meat > 0){
        meatCount = newChild(get("resource-screen"),"p","meat-count","","resource")
    }
    if(meatCount != null){
    meatCount.innerText =  "meat          " + Math.floor(meat);
    }

    let woodCount = get("wood-count");
    if(woodCount == null && wood > 0){
        woodCount = newChild(get("resource-screen"),"p","wood-count","","resource")
    }
    if(woodCount != null)
    {woodCount.innerText =  "wood          " + Math.floor(wood);}

    let herbCount = get("herb-count");
    if(herbCount == null && mystical_herbs > 0){
        herbCount = newChild(get("resource-screen"),"p","herb-count","","resource")
    }
    if(herbCount != null)
    {herbCount.innerText =  "mystic herbs  " + Math.floor(mystical_herbs)};

    let harnessCount = get("harness-count");
    if(harnessCount == null && miscResource['harness'] > 0){
        harnessCount = newChild(get("resource-screen"),"p","harness-count","","resource")
    }
    if(harnessCount != null)
    {harnessCount.innerText =  "harnesses  " + Math.floor(miscResource['harness'])};
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
    button.title = "";
    for(i = 0; i < resources.length;i++){
        button.title += resources[i] + " " + resourceRequirements[i] + "\n";
    }
    buttonListener = new ButtonWrapper(button,resources,resourceRequirements);
    registerListener(buttonListener);
    return buttonListener;
}

function unregisterListener(listener){
    resourceListeners.delete(listener);
}

function firstMonEvent(){
    groveScreen = get("grove-screen");
    groveText = get("grove-text");

    groveText.innerText = "A fox, its body devoid of fat as starvation sets in,\nlimps into the clearing before collapsing.";
    if(get("initial-feed") == null) {
    feedButton = document.createElement("button");
    feedButton.innerText = "Feed";
    feedButton.title = "fruit 10";
    feedButton.id = "initial-feed";
    
    feedButton.addEventListener('click', () => {
        feedButton.remove();
        groveText.innerText = "You carefully feed the fox some of your fruit. Soon, the\nfox has fallen into a peaceful slumber.";
        fruit -= 10;
        updateResourceDisplay();
        progress = 1;
        setTimeout(function(){
            groveText.innerText = "The fox is now awake. It regards you with a little\n suspicion, but eyes your hand for more food.";
            let nameButton = newChild(groveScreen,"button",null,"Name it","");
            nameButton.addEventListener('click', () =>
            {
                const startingMon = new Mon();
                startingMon.level = 1;
                let name = prompt("Enter the name for your fox:");
                startingMon.nickname = name;
                startingMon.traits = new Set([]);
                startingMon.tame = 30;
                mons.push(startingMon);
                nameButton.remove();
                groveText.innerText = "Maybe if " + startingMon.nickname + " trusts you enough\nthey will gather materials for you";
                updateMonList();
                updateMonCard();

                registerListener(new GenericListener(unlockExplore,["fruit"],[30]));
            });
        },20000);
    })
    groveScreen.appendChild(feedButton);
    }
}
function unlockExplore(){
    progress = 2;
    groveText = get('grove-text');
    groveText.innerText = "The forest surrounding this clearing is\nvast. Exploring it could prove useful.";
    exploreButton = newChild(get("grove-screen"),"button","explore-button","Explore",null);
    exploreButton.style.top = "100px"
    exploreButton.style.position = "absolute"
    exploreButton.addEventListener('click', function() {
        let exploreIcon = `
|       |
|Explore|
|       |
`;
        newTab("explore",exploreIcon);
        exploreButton.remove();
        selectTab("explore");
        registerButtonListener(get("explore-button"),["fruit"],[EXPLORE_COST]);
        registerListener(new GenericListener(unlockBuild,["wood"],[10]));
    });
}
function resetExplore(){
    exploreButton = get("explore-button");
    exploreText = get("explore-text");
    exploreText.innerText = "The untamed forest lies before you.\nWho knows what you might find?";
    //registerButtonListener(exploreButton,["fruit"],[EXPLORE_COST]);
    exploreButton.classList.remove("hidden");
    exploreCooldown.val = 15;
    updateExploreButton();
    cooldown(exploreCooldown,updateExploreButton);
}
function updateExploreButton(){
    exploreButton = get("explore-button");
    exploreButton.innerText = "Venture Forth";
    if(exploreCooldown.val > 0) {
        exploreButton.innerText += " (" + exploreCooldown.val + "s)";
        exploreButton.disabled = true;
    } else {
        updateResourceDisplay();
    }
}
function explore(){
    fruit -= EXPLORE_COST;
    updateResourceDisplay();
    if(numExplores == 10){
        eventTemple();
        numExplores++;
        return;
    }
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




    numExplores++;

}
function event1(){ //tame squirrel
    let exploreText = get("explore-text");
    exploreChoice("You stumble across a squirrel lying on the ground, a huge gash in its chest",
        "Bind its wound",[],[],
        () => {
            exploreText.innerText = convertString("With a strip of cloth made of plant fiber you bind the bleeding cut. You bring it back to your grove to oversee its recovery");
            let newMon = new Mon();
            newMon.species = "squirrel";
            newMon.level = 1;
            newMon.nickname = "Squirrel";
            newMon.tame = 20;
            mons.push(newMon);
            updateMonList();
            alignment += 3;
            setTimeout(resetExplore,20000);
        },
        "Leave it be",[],[],
        () => {
            exploreText.innerText = convertString("You leave the squirrel lying there in its blood. You continue, but find nothing before returning to the grove");
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
            meat -= 10;
            updateResourceDisplay();
            exploreText.innerText = convertString("You toss the meat towards it. Its anger vanishes the moment it smells food. After devouring what you gave it, it follows close at your heels");
            let newMon = new Mon();
            newMon.species = "wolf";
            newMon.level = 1;
            newMon.nickname = "Wolf";
            newMon.tame = 40;
            newMon.carnivore = true;
            mons.push(newMon);
            updateMonList();
            alignment += 3;
            setTimeout(resetExplore,20000);
        },
        "Finish it off",[],[],
        () => {
            exploreText.innerText = convertString("The fight is quick and bloody. You leave with bite marks on your arm and a new pelt");
            meat += 7;
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
    exploreText.innerText = convertString(`Sticks and dead brush cover the forest floor. You collect as much as you can in your arms and bring it back to the grove. ${mons[0].nickname} walks over and greets you excitedly when you return`);
    wood += 15;
    updateResourceDisplay();
    setTimeout(resetExplore,15000);
}
function event4(){ //blackberries
    let exploreText = get("explore-text");
    exploreButton = get("explore-button");
    if(!exploreButton.classList.contains('hidden')){
        exploreButton.classList.add('hidden');
    }
    exploreText.innerText = convertString(`A grove of blackberry bushes filled with ripe berries greets you. You gather what you can carry. Back at camp ${mons[0].nickname} puts on puppy dog eyes to beg for one`);
    fruit += 25;
    updateResourceDisplay();
    setTimeout(resetExplore,15000);
}
function event5(){ //fawn
    let exploreText = get("explore-text");
    exploreChoice("A shivering fawn curls up next to its dead mother",
        "Coax the fawn with food",["fruit"],[10],
        () => {
            fruit -= 10;
            updateResourceDisplay();
            exploreText.innerText = convertString("With a gentle hand you place a berry on the ground. The faun walks over and hungrily eats it. You lead the faun back to the safety of the grove");
            let newMon = new Mon();
            newMon.species = "deer";
            newMon.level = 1;
            newMon.nickname = "Deer";
            newMon.tame = 35;
            mons.push(newMon);
            updateMonList();
            alignment += 3;
            setTimeout(resetExplore,20000);
        },
        "Harvest the remains",[],[],
        () => {
            exploreText.innerText = convertString("No point in letting so much meat go to waste.");
            alignment -= 4;
            meat += 20;
            updateResourceDisplay;
            setTimeout(resetExplore,20000);
        }
    );
}
function event6(){ //raven
    let exploreText = get("explore-text");
    exploreChoice("A raven stare at you intently from a nearby tree branch",
        "Hold out your arm",[],[],
        () => {
            exploreText.innerText = convertString("As you proffer your arm, the startled raven takes flight, soon disappearing out of sight");
            alignment += 1;
            setTimeout(resetExplore,15000);
        },
        "Offer food",["fruit"],[5],
        () => {
            fruit -= 5;
            updateResourceDisplay();
            event6a();
        },
        "Swiftly grab it",[],[],
        () => {
            exploreText.innerText = convertString("As you swipe your hand the bird quickly flies out of reach. Soon it is nowhere to be seen");
            alignment -= 1;
            setTimeout(resetExplore,15000);
        }
    );
}
function event6a(){
    let exploreText = get("explore-text");
    exploreChoice("The raven cocks its head before cautiously eating the berry. It seems to relax a little",
        "Hold out your arm",[],[],
        () => {
            exploreText.innerText = convertString("As you extend your arm, the bird considers it for a moment before hopping on");
            let newMon = new Mon();
            newMon.species = "raven";
            newMon.level = 1;
            newMon.nickname = "Raven";
            newMon.tame = 10;
            mons.push(newMon);
            updateMonList();
            setTimeout(resetExplore,20000);
        },
        "Grab the bird",[],[],
        () => {
            exploreText.innerText = convertString("As you swipe your hand, the raven quickly flies out of reach. It seems to give you an almost critical glare before flying away");
            alignment -= 3;
            setTimeout(resetExplore,15000);
        }
    );
}
function event7(){ //creek
    let exploreText = get("explore-text");
    exploreChoice("You find a clear creek running through the forest",
        "Search the water",[],[],
        () => {
            exploreText.innerText = convertString("The crystal clear water is home to schools of fish. You manage to catch a few to bring back to the grove");
            meat += 10;
            updateResourceDisplay();
            setTimeout(resetExplore,15000);
        },
        "Follow it downstream",[],[],
        () => {
            exploreText.innerText = convertString("Downstream, fruitbearing trees flourish near the cool water. You collect some fruit before heading back");
            fruit += 13;
            updateResourceDisplay();
            setTimeout(resetExplore,15000);
        }
    );
}
function event8(){ //rare herbs
    exploreButton = get("explore-button");
    if(!exploreButton.classList.contains('hidden')){
        exploreButton.classList.add('hidden');
    }
    let exploreText = get("explore-text");
    exploreText.innerText = convertString("You find a patch of rare herbs. Legends say they may have magical properties. You carefully harvest them.");
    mystical_herbs += 2;
    updateResourceDisplay();
    setTimeout(resetExplore,15000);
}
function event9(){ //fairy circle
    let exploreText = get("explore-text");
    exploreChoice(
        "You find a perfect circle formed out of white mushrooms",
        "Offer fruit",["fruit"],[15],
        () => {
            fruit -= 15;
            updateResourceDisplay();
            if(Math.random < 0.5){
                exploreText.innerText = convertString("As you lay the fruit inside the circle, it transforms into a thousand dandelion seeds that blow away. In its place are a few flowers that glow with a mystical light");
                mystical_herbs += 3;
                updateResourceDisplay();
                setTimeout(resetExplore,25000);
            } else {
                //The fey are fickle
                exploreText.innerText = convertString("As you lay the fruit inside the circle, it transforms into a thousand dandelion seeds that blow away. You hear laughter coming from all around");
                setTimeout(resetExplore,20000);
            }
        },
        "Offer meat",["meat"],[15],
        () => {
            meat -= 15;
            updateResourceDisplay();
            exploreText.innerText = convertString("The sky suddenly grows red as you set the meat down. You can hear a deep laughter as the meat seems to melt away. " + (alignment > -15)?"You quickly run from the circle, and the sky returns to normal":"You revel in the crimson light until the last drop has faded");
            alignment -= 5;
            setTimeout(resetExplore,25000);
        },
        "Leave the Circle",[],[],
        () => {
            exploreText.innerText = convertString("You decide that some things are better left alone");
            setTimeout(resetExplore,15000);
        }
    );
}
function event10(){ //saved by mons[0]
    exploreText = get("explore-text");
    exploreButton = get("explore-button");
    if(!exploreButton.classList.contains('hidden')){
        exploreButton.classList.add('hidden');
    }
    exploreText.innerText = convertString("You come face to face with a growling wolf. It howls and more of its kind respond in the distance. Then, it charges");
    exploreButton1 = newChild(get('explore-screen'),"button","option1","Run");
    exploreButton1.addEventListener('click',() =>{
        exploreButton1.remove();
        exploreText.innerText = convertString(`You turn and start running, but it is much faster. As it leaps at you, jaws wide, a dark object collides with it from the side. You turn to see ${mons[0].nickname} wrestling with the wolf on the ground. As they both get to their feet, fur bloodied, ${mons[0].nickname} bares their teeth and growls. The wolf considers for a moment before leaving`);
        setTimeout(resetExplore,20000);
    });
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
    exploreChoice(
        `Deep in the woods you find what appears to be the remains of an ancient temple. Stone walls are overgrown with vines and in many places the ceiling has collapsed. As you approach the entrance, ${mons[0].nickname} emerges from the forest to join you. You can feel a... power pulsating inside. It beckons to you two.`,
        "This is surely sacred ground",[],[],
        temple1a,
        "I must gain this power",[],[],
        temple1b
    );
}
function temple1a(){
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
        
        button1.addEventListener('click',() =>{
            exploreText.innerText = convertString("In reverence of this sacred area, you carefully gather some of the herbs. They seem imbued with the same energy you feel coming from the temple. They will surely prove useful.");
            alignment += 3;
            button1.remove();
            templeHerbs = true;
            mystical_herbs += 3;
            updateResourceDisplay();
        });
    } else {
        exploreText.innerText = convertString("You enter an ancient courtyard surrounded by forest. A break in the trees allows sunlight to bathe the area in its golden light. Plants of all varieties flourish here, though you dare not take more than you already have.")
    }
    button2 = newChild(exploreScreen,"button","button-2","Return Inside");
    button2.addEventListener('click',() =>
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
    button1.addEventListener('click',() =>{
        button1.remove();
        alignment += 5;
        exploreText.innerText = convertString(`The power courses through your body, streams of emerald light twist around you and ${mons[0].nickname}.`);
        document.body.classList.add('shake-window');
    
        setTimeout(function() {
            document.body.classList.remove('shake-window');
        }, 1000);

        setTimeout(function() {
            exploreText.innerText = convertString(`You regain your senses. Everything is quiet and the crystal floats just in front of you still. You feel a new reservoir of power within you and as you turn to look at ${mons[0].nickname}, they appear to be glowing with the same power you feel inside. This crystal is sacred, the Heart of the Forest. You must get it back to the grove for safety.`);
            button1 = newChild(exploreScreen,"button","button-1","Bring it back");
            button1.addEventListener('click',() =>
            {
                button1.remove();
                exploreText.innerText = convertString(`With great reverence, you take hold of the crystal again. It resonates with the power you feel inside, but does not react like last time. ${mons[0].nickname} bows their head towards the crystal. Both of you return to the grove, crystal in hand. As you return to the sunlight, you notice ${mons[0].nickname}'s pelt now has streaks of vibrant, almost glowing, green.`);
                perks.add('druid');
                setTimeout(resetExplore,20000);
            });
        },10000);
    });
}
function temple1b(){
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
        
        button1.addEventListener('click',() =>{
            exploreText.innerText = convertString("You must have this power. You collect every plant that you can a hunger for power building inside you.");
            alignment -= 3;
            button1.remove();
            templeHerbs = true;
            mystical_herbs += 5;
            updateResourceDisplay();
        });
    } else {
        exploreText.innerText = convertString("You enter an ancient courtyard surrounded by forest. A break in the trees allows sunlight to bathe the area in light. The ground is ravished of plant life. Nothing of value remains here.")
    }
    button2 = newChild(exploreScreen,"button","button-2","Return Inside");
    button2.addEventListener('click',() =>
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
    button1 = newChild(exploreScreen,"pre","button-1",`  /\\    
        /  \\   
       / /\\ \\ 
       \\ \\/ / 
        \\  /  
         \\/   `,"clickable");
               button1.style.color = "#10E030";
               button1.style.fontWeight = "bold"
               button1.classList.add('color-shift');
    button1.addEventListener('click',() =>{
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
            button1.addEventListener('click',() =>
            {
                button1.remove();
                exploreText.innerText = convertString(`You return to the grove, crystal in hand. As you return to the sunlight, you notice ${mons[0].nickname}'s pelt now has streaks of vibrant, almost glowing, green. It follows close at your heels, head bowed.`);
                perks.add('druid');
                setTimeout(resetExplore,20000);
            });
        },10000);
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

    exploreOption1.addEventListener('click',function() {
        exploreOption1.remove();
        exploreOption2.remove();
        if(button3Text){
            exploreOption3.remove();
        }

        button1Func();
    });

    exploreOption2.addEventListener('click',function(){
        exploreOption1.remove();
        exploreOption2.remove();
        if(button3Text){
            exploreOption3.remove();
        }

        button2Func();
    });

    if(button3Text){
        exploreOption3.addEventListener('click',function(){
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
    newChild(buildList,"option","build-trap","Trap");
    newChild(buildList,"option","build-basket","Basket");
    newChild(buildList,"option","build-harness","Harness");
    buildList.addEventListener('change',updateBuildList);
    updateBuildList();
    buildButton.addEventListener('click',buildItem);
}
function updateBuildList(){
    let buildList = get("select-build");
    let buildDescription = get("build-description");
    let buildButton = get("build-button");
    let currentSelection = buildList.options[buildList.selectedIndex].text;
    let woodCost = 0;
    switch(currentSelection){
        case "Trap":
            buildDescription.innerText = convertString("A simple trap that you can hide in the underbrush of the forest. It can catch small critters for meat.");
            woodCost = 10;
            break;
        case "Basket":
            buildDescription.innerText = convertString("A sturdy wooden basket with woven plant fibers will help you carry more of the fruit you collect.");
            woodCost = 20;
            break;
        case "Harness":
            buildDescription.innerText = convertString("A lightweight harness with pouches attached will allow one of your trained animals to carry much more fruit as they forage");
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
        case "Trap":
            wood -= 10;
            updateResourceDisplay();
            if(!miscResource['traps']){
                miscResource['traps'] = 1;
            } else {
                miscResource['traps']++;
            }
            if(miscResource['traps'] >= 5){
                get("build-trap").remove();
                updateBuildList();
            }
            updateTraps();
            break;
        case "Basket":
            wood -= 20;
            updateResourceDisplay();
            perks.add("basket");
            get("build-basket").remove();
            updateBuildList();
            break;
        case "Harness":
            wood -= 25;
            if(!miscResource['harness']){
                miscResource['harness'] = 1;
            } else {
                miscResource['harness']++;
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
    trapNumText.innerText = "Traps " + miscResource['traps'] + "   ";
    if(miscResource['traps'] < 1){
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
        meat += Math.floor(Math.random()*(2+miscResource['traps']))+3;
        get('trap-text').innerText = "You kill and harvest the animal" + ((miscResource['traps'] > 1)?"s":"") + " in your trap" + ((miscResource['traps'] > 1)?"s":"");
        alignment -= 1;
    } else {
        get('trap-text').innerText = "Your trap" + ((miscResource['traps'] > 1)?"s are":" is") + " empty";
    }
    if(rnd > 10) {
        meat += Math.floor(Math.random()*(2+miscResource['traps']));
    }
    if(rnd > 17) {
        meat += 10;
    }
    updateResourceDisplay();
    if(Math.floor(Math.random()*5) == 0){
        miscResource['traps']--;
        updateTraps();
        get('trap-text').innerText += ". Unfortunately " + ((miscResource['traps'] > 1)?"one of your traps ":"your trap ") + "has been broken";
        if(get('build-trap') == null){
            newChild(buildList,"option","build-trap","Trap");
            updateBuildList();
        }
    }
    trapCooldown.val = 45;
    cooldown(trapCooldown,updateTraps);
}

function get(id){
    return document.getElementById(id);
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
        switch(resource){
            case "fruit":
                fruit += amount;
                break;
            case "meat":
                meat += amount;
                break;
            case "wood":
                wood += amount;
                break;
            case "mystical herbs":
                mystical_herbs += amount;
                break;
        }
        updateResourceDisplay();
    }
}

function updateMonCard(element)
{   
    if(element == null){
    let currCard = get("mon-card");
    if(currCard != null){
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
        
                    actionList.selectedIndex = mon.selectedTask;
                    taskFlavor = get("task-flavor");
                    taskOutput = get("task-output");
                    if(taskFlavor == null) {taskFlavor = newChild(get("mon-stats"),"div","task-flavor","","monentry");
                        taskOutput = newChild(get("mon-actions"),"div","task-output","","monentry");}
                    let amount;
                    switch(actionList.options[actionList.selectedIndex].text){
                        case "Resting":
                            taskFlavor.innerText = "Resting...";
                            taskOutput.innerText = "";
                            if(mon.resourceProduction != null){
                                intervals.delete(mon.resourceProduction);
                                mon.resourceProduction = null;
                            }
                            break;
                        case "Gathering":
                            taskFlavor.innerText = "Producing ";
                            amount = BASE_MON_FRUIT_PRODUCTION * mon.tame/100 * ((mon.traits.has('harness'))?1.5:1.0);
                            taskOutput.innerText = amount.toFixed(1) + " fruit/10s";
                            if(mon.resourceProduction != null){
                                intervals.delete(mon.resourceProduction);
                            }
                            mon.resourceProduction = produceResource("fruit",amount);
                            intervals.add(mon.resourceProduction);
                            break;
                        case "Hunting":
                            taskFlavor.innerText = "Producing ";
                            amount = BASE_MON_MEAT_PRODUCTION * mon.tame/100;
                            taskOutput.innerText = amount.toFixed(1) + " meat/10s";
                            if(mon.resourceProduction != null){
                                intervals.delete(mon.resourceProduction);
                            }
                            mon.resourceProduction = produceResource("meat",amount);
                            intervals.add(mon.resourceProduction);
                            break;
                        case "Collecting":
                            taskFlavor.innerText = "Producing ";
                            amount = BASE_MON_FRUIT_PRODUCTION * mon.tame/100;
                            taskOutput.innerText = amount.toFixed(1) + " wood/10s";
                            if(mon.resourceProduction != null){
                                intervals.delete(mon.resourceProduction);
                            }
                            mon.resourceProduction = produceResource("wood",amount);
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
                        copyFeedMon = feedMon.cloneNode(true)
                        feedMon.replaceWith(copyFeedMon);
                        let listener;
                        if(mon.carnivore){
                            listener = registerButtonListener(copyFeedMon,["meat"],[feedCost]);
                        }else {
                            listener = registerButtonListener(copyFeedMon,["fruit"],[feedCost]);
                        }
                        copyFeedMon.addEventListener('click',() =>{
                            unregisterListener(listener);
                            if(mon.carnivore){
                                meat -= feedCost;
                            } else {
                            fruit -= feedCost;
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
                        });
                    }
                } else {
                    feedMon.style.visibility = "hidden";
                    //monActions.appendChild(document.createElement("h4"));
                }
            break;
            case "harness":
                harnessButton = get('harness-button');
                if(mon.tame >= 75 && !mon.traits.has('harness') && miscResource['harness']){
                    
                    if(!harnessButton){
                        harnessButton = newChild(get('mon-actions'),'button','harness-button',"Equip Harness",'small button');
                        spacing = newChild(get('mon-stats'),'button',null,'','small button');
                        spacing.style.visibility = 'hidden';
                        harnessButton.addEventListener('click',() => {
                            miscResource['harness']--;
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
        this.level = 0;
        this.traits = new Set([]);
        this.species = "fox";
        this.element = null;
        this.carnivore = false;
        this.feedCooldown = new Box(0);
        this.resourceProduction = null;
        this.selectedTask = 0;
    }


    getDisplay(){
        let monDiv = document.createElement("div");
        monDiv.classList = "monsheet";
        let monStats = newChild(monDiv,"div","mon-stats","","moncolumn");
        let monActions = newChild(monDiv,"div","mon-actions","","moncolumn");
        let monName = newChild(monStats,"div","mon-name",this.nickname,"monentry");
        let monRename = newChild(monActions,"button","mon-rename","Rename","small");
        monRename.addEventListener('click', () =>
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
            let listener
            if(this.carnivore){
                listener = registerButtonListener(feedMon,["meat"],[feedCost]);
            }else {
                listener = registerButtonListener(feedMon,["fruit"],[feedCost]);
            }
            feedMon.addEventListener('click',() =>{
                unregisterListener(listener);
                if(this.carnivore){
                    meat -= feedCost;
                } else {
                fruit -= feedCost;
                }
                updateResourceDisplay();
                if(mons.length < 2){
                    //first mon tames easier
                    this.tame += 40; 
                } else {
                    this.tame += Math.floor(Math.random()*20)+10;
                }
                if (this.tame > 100){this.tame = 100;}
                this.feedCooldown.val = 20;
                cooldown(this.feedCooldown,function (){updateMonCard("feed button")});
                updateMonCard("feed button");
                updateMonCard("tameness");
            });
            }
        } else {
            monActions.appendChild(document.createElement("h4"));
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
                    taskOutput.innerText = "";
                    if(this.resourceProduction != null){
                        intervals.delete(this.resourceProduction);
                        this.resourceProduction = null;
                    }
                    break;
                case "Gathering":
                    taskFlavor.innerText = "Producing ";
                    amount = BASE_MON_FRUIT_PRODUCTION * this.tame/100 * ((this.traits.has('harness'))?1.5:1.0);
                    taskOutput.innerText = amount.toFixed(1) + " fruit/10s";
                    if(this.resourceProduction != null){
                        intervals.delete(this.resourceProduction);
                        
                    }
                    this.resourceProduction = produceResource("fruit",amount);
                    intervals.add(this.resourceProduction);
                    break;
                case "Hunting":
                    taskFlavor.innerText = "Producing ";
                    amount = BASE_MON_MEAT_PRODUCTION * this.tame/100;
                    taskOutput.innerText = amount.toFixed(1) + " meat/10s";
                    if(this.resourceProduction != null){
                        intervals.delete(this.resourceProduction);
                    }
                    this.resourceProduction = produceResource("meat",amount);
                    intervals.add(this.resourceProduction);
                    break;
                case "Collecting":
                    taskFlavor.innerText = "Producing ";
                    amount = BASE_MON_FRUIT_PRODUCTION * this.tame/100;
                    taskOutput.innerText = amount.toFixed(1) + " wood/10s";
                    if(this.resourceProduction != null){
                        intervals.delete(this.resourceProduction);
                    }
                    this.resourceProduction = produceResource("wood",amount);
                    intervals.add(this.resourceProduction);
                    break;
            }
        }
        if(this.tame >= 75 && !this.traits.has('harness') && miscResource['harness']){
            let harnessButton = newChild(monActions,'button','harness-button',"Equip Harness",'small button');
            let spacing = newChild(monStats,'button',null,'','small button');
            spacing.style.visibility = 'hidden';
            harnessButton.addEventListener('click',() => {
                miscResource['harness']--;
                updateResourceDisplay();
                this.traits.add('harness');
                updateMonCard();
            });
        }
        


        return monDiv;
    }
}