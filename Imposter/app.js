// --- 1. Unsere Werkzeuge (Wir finden die Knöpfe und Textfelder im "Bilderbuch") ---
// Die verschiedenen Seiten unserer App
const setupScreen = document.getElementById('setup-screen');
const wordManagementScreen = document.getElementById('word-management-screen');
const gameScreen = document.getElementById('game-screen');
const summaryScreen = document.getElementById('summary-screen');

// Dinge auf der Startseite (Spiel einstellen)
const playerNameInput = document.getElementById('playerNameInput');
const addPlayerButton = document.getElementById('addPlayerButton');
const playerList = document.getElementById('playerList');
const imposterCountInput = document.getElementById('imposterCount');
const imposterHintToggle = document.getElementById('imposterHintToggle');
const topicSelect = document.getElementById('topicSelect'); // Das versteckte Auswahlfeld
const topicChipsContainer = document.getElementById('topicChipsContainer'); // NEU: Der Container für unsere schönen Buttons!
const startGameButton = document.getElementById('startGameButton');
const goToWordManagementButton = document.getElementById('goToWordManagementButton'); // Im Footer

// Dinge auf der Wort-Schatz-Seite
const crewWordInput = document.getElementById('crewWordInput');
const imposterHintWordInput = document.getElementById('imposterHintWordInput');
const addTopicButton = document.getElementById('addTopicButton');
const topicList = document.getElementById('topicList');
const backToSetupButton = document.getElementById('backToSetupButton');

// Dinge auf der Spiel-Seite
const currentPlayerNameDisplay = document.getElementById('currentPlayerName');
const roleDisplay = document.getElementById('roleDisplay');
const revealButton = document.getElementById('revealButton');
const nextPlayerButton = document.getElementById('nextPlayerButton');
const endGameButton = document.getElementById('endGameButton');

// Dinge auf der Ergebnis-Seite
const summaryDetails = document.getElementById('summaryDetails');
const newGameButton = document.getElementById('newGameButton');


// --- 2. Unser Notizbuch (Hier merken wir uns, was im Spiel passiert) ---
let players = [];
let gameRoles = [];
let currentPlayerIndex = 0;
let imposterHintActive = false;

// Unsere Geheimwort-Kategorien und die Wörter darin!
const predefinedCategories = [
    { 
        id: 'all_random', 
        name: "🎲 Zufälliges Abenteuer (alle)", 
        topics: [], // Wird nicht direkt genutzt, ist nur für die Anzeige und Logik
        isDefaultSelected: true // Sollte standardmäßig ausgewählt sein
    },
    { 
        id: 'staedte', 
        name: "🏙️ Große Städte entdecken", 
        topics: [
            { crewWord: "Berlin", imposterHint: "Hauptstadt" },
            { crewWord: "Paris", imposterHint: "Eiffelturm" },
            { crewWord: "New York", imposterHint: "Wolkenkratzer" },
            { crewWord: "London", imposterHint: "Big Ben" },
            { crewWord: "Rom", imposterHint: "Kolosseum" }
        ]
    },
    { 
        id: 'hollywood', 
        name: "⭐ Hollywood-Stars & Filme", 
        topics: [
            { crewWord: "Filmstudio", imposterHint: "Drehort" },
            { crewWord: "Schauspieler", imposterHint: "Beruf" },
            { crewWord: "Popcorn", imposterHint: "Kino-Snack" },
            { crewWord: "Regisseur", imposterHint: "Chef" },
            { crewWord: "Oscar", imposterHint: "Preis" }
        ]
    },
    { 
        id: 'deutschland', 
        name: "🇩🇪 Entdecke Deutschland", 
        topics: [
            { crewWord: "Bundeskanzler", imposterHint: "Politiker" },
            { crewWord: "Brezel", imposterHint: "Gebäck" },
            { crewWord: "Oktoberfest", imposterHint: "Fest" },
            { crewWord: "Schwarzwald", imposterHint: "Gebirge" },
            { crewWord: "Autobahn", imposterHint: "Straße" }
        ]
    },
    { 
        id: 'sport', 
        name: "🏆 Sport-Helden", 
        topics: [
            { crewWord: "Fußball", imposterHint: "Ballspiel" },
            { crewWord: "Schwimmen", imposterHint: "Wassersport" },
            { crewWord: "Basketball", imposterHint: "Korb" },
            { crewWord: "Turnen", imposterHint: "Bewegung" },
            { crewWord: "Radsport", imposterHint: "Fahrrad" }
        ]
    },
    { 
        id: 'essen', 
        name: "🍕 Leckeres Essen", 
        topics: [
            { crewWord: "Pizza", imposterHint: "italienisch" },
            { crewWord: "Burger", imposterHint: "Fast Food" },
            { crewWord: "Schokolade", imposterHint: "Süßigkeit" },
            { crewWord: "Nudeln", imposterHint: "Teigware" },
            { crewWord: "Eis", imposterHint: "kalt" }
        ]
    }
];

// Hier speichern wir die Geheimwörter, die DU hinzufügst
let customTopics = [];


// --- 3. Bildschirm-Zauber (So wechseln wir die Seiten) ---
function showScreen(screenToShow) {
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(screen => {
        screen.classList.remove('active');
    });
    screenToShow.classList.add('active');
}

// --- 4. Detektive verwalten (Auf der Startseite) ---
function renderPlayers() {
    playerList.innerHTML = '';
    players.forEach((player, index) => {
        const li = document.createElement('li');
        li.textContent = player;
        
        const removeButton = document.createElement('button');
        removeButton.textContent = 'x';
        removeButton.classList.add('remove-player-button');
        removeButton.onclick = () => removePlayer(index);
        
        li.appendChild(removeButton);
        playerList.appendChild(li);
    });
    checkGameReadiness(); // Prüft, ob Spiel gestartet werden kann nach Spieleränderung
}

function addPlayer() {
    const name = playerNameInput.value.trim();
    if (name && !players.includes(name)) {
        players.push(name);
        playerNameInput.value = '';
        renderPlayers();
    } else if (name && players.includes(name)) {
        alert('Dieser Detektiv ist schon dabei!');
    }
}

function removePlayer(index) {
    players.splice(index, 1);
    renderPlayers();
}

// --- 5. Geheimwort-Schatz verwalten (NEU: Kategorien und eigene Wörter) ---

// Füllt das Auswahlfeld (und die Chips) auf der Startseite mit den Kategorien
function populateTopicSelection() {
    topicSelect.innerHTML = ''; // Leere das versteckte Select-Feld
    topicChipsContainer.innerHTML = ''; // Leere den Container für die Chips

    const allCategoriesForSelection = [...predefinedCategories];
    if (customTopics.length > 0) {
        allCategoriesForSelection.push({ id: 'custom', name: '✨ Dein Geheimwort-Schatz (selbstgemacht)', topics: customTopics });
    }

    let defaultSelectedIds = [];

    allCategoriesForSelection.forEach(category => {
        // Option für das versteckte Select-Feld
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        topicSelect.appendChild(option);

        // Der sichtbare Chip-Button
        const chip = document.createElement('div');
        chip.classList.add('topic-chip');
        chip.textContent = category.name;
        chip.dataset.categoryId = category.id; // Speichert die ID im Datenattribut

        // Spezielle Klassen für Styling
        if (category.id === 'custom') {
            chip.classList.add('custom-chip');
        } else if (category.id === 'all_random') {
            chip.classList.add('random-chip');
            if (category.isDefaultSelected) {
                defaultSelectedIds.push(category.id);
            }
        }

        // Klick-Funktion für den Chip
        chip.addEventListener('click', () => {
            toggleCategorySelection(category.id);
        });

        topicChipsContainer.appendChild(chip);
    });

    // Wählt standardmäßig die "all_random" Option aus, wenn sie existiert
    // Und synchronisiert die Chips mit dieser Auswahl
    if (defaultSelectedIds.length > 0) {
        selectCategoriesInHiddenSelect(defaultSelectedIds);
        updateChipStyles();
    }
    
    checkGameReadiness(); // Nach dem Füllen des Auswahlfeldes prüfen
}


// Wählt Optionen im versteckten Select-Feld aus
function selectCategoriesInHiddenSelect(idsToSelect) {
    // Zuerst alles deselektieren
    Array.from(topicSelect.options).forEach(option => {
        option.selected = false;
    });

    // Dann die gewünschten IDs auswählen
    idsToSelect.forEach(id => {
        const option = Array.from(topicSelect.options).find(opt => opt.value === id);
        if (option) {
            option.selected = true;
        }
    });
}

// Aktualisiert die Optik der Chips basierend auf dem versteckten Select-Feld
function updateChipStyles() {
    const selectedOptions = Array.from(topicSelect.selectedOptions).map(option => option.value);
    
    Array.from(topicChipsContainer.children).forEach(chip => {
        const categoryId = chip.dataset.categoryId;
        if (selectedOptions.includes(categoryId)) {
            chip.classList.add('selected');
        } else {
            chip.classList.remove('selected');
        }
    });
    checkGameReadiness(); // Nach Auswahländerung prüfen
}


// Funktion zum Umschalten der Kategorie-Auswahl bei Klick auf einen Chip
function toggleCategorySelection(categoryId) {
    const selectedOptions = Array.from(topicSelect.selectedOptions).map(option => option.value);
    
    // Finde die Option im versteckten Select-Feld
    const optionToToggle = Array.from(topicSelect.options).find(opt => opt.value === categoryId);

    if (!optionToToggle) return; // Sollte nicht passieren

    if (categoryId === 'all_random') {
        // Wenn "Zufälliges Abenteuer" geklickt wird:
        // Entweder wird es exklusiv ausgewählt ODER alle abgewählt.
        if (selectedOptions.includes('all_random') && selectedOptions.length === 1) {
            // Wenn es schon ausgewählt war und die einzige Auswahl war, deselektiere alles
            selectCategoriesInHiddenSelect([]);
        } else {
            // Wenn es nicht ausgewählt war oder andere Dinge ausgewählt waren, wähle nur es aus
            selectCategoriesInHiddenSelect(['all_random']);
        }
    } else {
        // Wenn eine normale Kategorie geklickt wird:
        if (selectedOptions.includes('all_random')) {
            // Wenn "Zufälliges Abenteuer" ausgewählt war, entferne es zuerst
            const newSelection = selectedOptions.filter(id => id !== 'all_random');
            selectCategoriesInHiddenSelect(newSelection);
        }

        // Dann die aktuelle Kategorie umschalten
        optionToToggle.selected = !optionToToggle.selected;
    }

    updateChipStyles(); // Update die visuelle Darstellung der Chips
}


function loadCustomTopics() {
    const storedTopics = localStorage.getItem('spionCustomTopics');
    if (storedTopics) {
        customTopics = JSON.parse(storedTopics);
    }
    renderTopics(); // Zeigt die Wörter im Management-Screen an
    populateTopicSelection(); // Aktualisiert das Auswahlfeld und die Chips
}

function saveCustomTopics() {
    localStorage.setItem('spionCustomTopics', JSON.stringify(customTopics));
    renderTopics(); // Aktualisiert die Anzeige im Management-Screen
    populateTopicSelection(); // Aktualisiert das Auswahlfeld und die Chips
}

function renderTopics() {
    topicList.innerHTML = ''; // Leere die Liste der Geheimwörter zuerst

    // Füge die Überschrift für die selbstgemachten Wörter hinzu
    if (customTopics.length === 0) {
        const li = document.createElement('li');
        li.textContent = "Hier warten noch keine Geheimwörter von dir. Füge welche hinzu!";
        topicList.appendChild(li);
        return;
    }

    // Zeige jedes selbstgemachte Geheimwort an
    customTopics.forEach((topic, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>"${topic.crewWord}" ${topic.imposterHint ? `(Tipp: "${topic.imposterHint}")` : ''}</span>
        `;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'x';
        removeButton.classList.add('remove-topic-button');
        removeButton.onclick = () => removeCustomTopic(index); // Spezielle Funktion zum Entfernen
        li.appendChild(removeButton);
        topicList.appendChild(li);
    });
}

function addTopic() {
    const crewWord = crewWordInput.value.trim();
    const imposterHint = imposterHintWordInput.value.trim();

    if (crewWord) {
        customTopics.push({ crewWord, imposterHint });
        saveCustomTopics();
        crewWordInput.value = '';
        imposterHintWordInput.value = '';
        alert('Dein Geheimwort wurde erfolgreich hinzugefügt!');
    } else {
        alert('Bitte gib ein Geheimwort für die Detektive ein!');
    }
}

function removeCustomTopic(indexToRemove) {
    if (indexToRemove >= 0 && indexToRemove < customTopics.length) {
        customTopics.splice(indexToRemove, 1);
        saveCustomTopics();
    }
}

// Prüft, ob genug Spieler und Wörter da sind, um den Start-Button zu aktivieren
function checkGameReadiness() {
    const selectedCategoryIds = Array.from(topicSelect.selectedOptions).map(option => option.value);
    let hasTopics = false;

    if (selectedCategoryIds.length === 0 || selectedCategoryIds.includes('all_random')) {
        // Wenn keine spezifische Kategorie gewählt oder "Zufällig aus allen"
        hasTopics = customTopics.length > 0 || predefinedCategories.some(cat => cat.topics.length > 0);
    } else {
        // Wenn spezifische Kategorien ausgewählt wurden
        for (const selectedId of selectedCategoryIds) {
            if (selectedId === 'custom' && customTopics.length > 0) {
                hasTopics = true;
                break;
            }
            const category = predefinedCategories.find(cat => cat.id === selectedId);
            if (category && category.topics.length > 0) {
                hasTopics = true;
                break;
            }
        }
    }
    
    const isReady = players.length >= 3 && hasTopics;
    startGameButton.disabled = !isReady;
}


// --- 6. Spiellogik: Rollenverteilung und Spielablauf ---
function startGame() {
    if (players.length < 3) {
        alert('Du brauchst mindestens 3 Detektive, um dieses Spiel zu spielen!');
        return;
    }

    const imposterCount = parseInt(imposterCountInput.value);
    if (isNaN(imposterCount) || imposterCount < 1 || imposterCount >= players.length) {
        alert('Bitte sag uns, wie viele Spione es gibt (mindestens 1, aber weniger als alle Detektive zusammen)!');
        return;
    }

    // Sammle alle Wörter aus den tatsächlich ausgewählten Kategorien (aus dem versteckten Select)
    const selectedCategoryIds = Array.from(topicSelect.selectedOptions).map(option => option.value);
    let availableTopicsForGame = [];

    if (selectedCategoryIds.length === 0 || selectedCategoryIds.includes('all_random')) {
        // Wenn nichts ausgewählt ist ODER "Zufällig aus allen" gewählt wurde
        predefinedCategories.forEach(category => {
            if (category.id !== 'all_random') { // "all_random" selbst enthält keine Topics
                availableTopicsForGame = availableTopicsForGame.concat(category.topics);
            }
        });
        availableTopicsForGame = availableTopicsForGame.concat(customTopics);
    } else {
        // Wenn spezifische Kategorien ausgewählt wurden
        for (const categoryId of selectedCategoryIds) {
            if (categoryId === 'custom') {
                availableTopicsForGame = availableTopicsForGame.concat(customTopics);
            } else {
                const category = predefinedCategories.find(cat => cat.id === categoryId);
                if (category) {
                    availableTopicsForGame = availableTopicsForGame.concat(category.topics);
                }
            }
        }
    }

    if (availableTopicsForGame.length === 0) {
        alert('Keine Geheimwörter in den ausgewählten Kategorien! Wähle andere oder füge neue Wörter hinzu.');
        return;
    }

    // Wähle ein zufälliges Geheimwort-Paar aus ALLEN gesammelten Wörtern
    const selectedTopic = availableTopicsForGame[Math.floor(Math.random() * availableTopicsForGame.length)];
    const crewWord = selectedTopic.crewWord;
    const imposterHint = selectedTopic.imposterHint;
    imposterHintActive = imposterHintToggle.checked;

    let tempPlayers = [...players];
    gameRoles = [];

    for (let i = 0; i < imposterCount; i++) {
        const randomIndex = Math.floor(Math.random() * tempPlayers.length);
        const imposterName = tempPlayers.splice(randomIndex, 1)[0];
        gameRoles.push({
            player: imposterName,
            role: 'Spion',
            word: imposterHintActive && imposterHint ? imposterHint : null
        });
    }

    tempPlayers.forEach(player => {
        gameRoles.push({
            player: player,
            role: 'Detektiv',
            word: crewWord
        });
    });

    gameRoles.sort(() => Math.random() - 0.5);

    currentPlayerIndex = 0;
    showScreen(gameScreen);
    preparePlayerDisplay();
}

function preparePlayerDisplay() {
    const currentPlayer = gameRoles[currentPlayerIndex];
    currentPlayerNameDisplay.textContent = currentPlayer.player;
    roleDisplay.innerHTML = '<p class="instruction">Tippe hier, um dein Geheimnis zu sehen!</p>';
    revealButton.classList.remove('hidden');
    nextPlayerButton.classList.add('hidden');
    endGameButton.classList.add('hidden');
}

function revealRole() {
    const currentPlayer = gameRoles[currentPlayerIndex];
    roleDisplay.innerHTML = ''; // Leere die Anzeige

    const roleImage = document.createElement('img');
    const roleHeading = document.createElement('p');
    roleHeading.style.fontSize = '1.2em';
    roleHeading.style.fontWeight = 'bold';


    if (currentPlayer.role === 'Detektiv') {
        roleImage.src = 'icons/crew.png';
        roleImage.alt = 'Detektiv';
        roleHeading.textContent = `Du bist der Detektiv!`;
        roleHeading.style.color = '#00796B';
        
        const wordParagraph = document.createElement('p');
        wordParagraph.classList.add('word');
        wordParagraph.textContent = `Dein Geheimwort: "${currentPlayer.word}"`;
        roleDisplay.appendChild(roleImage);
        roleDisplay.appendChild(roleHeading);
        roleDisplay.appendChild(wordParagraph);
    } else { // Spion
        roleImage.src = 'icons/imposter.png';
        roleImage.alt = 'Spion';
        roleHeading.textContent = `Achtung! Du bist der SPION!`;
        roleHeading.style.color = '#D32F2F';
        
        const imposterText = document.createElement('p');
        imposterText.classList.add('imposter');
        imposterText.style.fontSize = '1.2em';
        if (currentPlayer.word) {
            imposterText.textContent = `Dein Tipp: "${currentPlayer.word}"`;
        } else {
            imposterText.textContent = `Du hast keinen direkten Tipp. Sei clever!`;
        }
        roleDisplay.appendChild(roleImage);
        roleDisplay.appendChild(roleHeading);
        roleDisplay.appendChild(imposterText);
    }

    revealButton.classList.add('hidden');
    nextPlayerButton.classList.remove('hidden');
    if (currentPlayerIndex === gameRoles.length - 1) {
        endGameButton.classList.remove('hidden');
        nextPlayerButton.classList.add('hidden');
    } else {
        endGameButton.classList.add('hidden');
    }
}

function nextPlayer() {
    currentPlayerIndex++;
    if (currentPlayerIndex < gameRoles.length) {
        preparePlayerDisplay();
    } else {
        showSummary();
    }
}

function showSummary() {
    showScreen(summaryScreen);
    summaryDetails.innerHTML = '<h3>Alle Rollen und Geheimwörter im Überblick:</h3><ul></ul>';
    const ul = summaryDetails.querySelector('ul');

    gameRoles.forEach(gameRole => {
        const li = document.createElement('li');
        const roleText = gameRole.role === 'Spion' ? 'Spion' : 'Detektiv';
        const wordText = gameRole.word ? `: "${gameRole.word}"` : '';
        
        li.innerHTML = `<span class="player-name">${gameRole.player}</span>: <span class="player-role ${gameRole.role.toLowerCase()}">${roleText}</span> ${wordText}`;
        ul.appendChild(li);
    });
}

function resetGame() {
    players = [];
    gameRoles = [];
    currentPlayerIndex = 0;
    imposterHintActive = false;
    playerNameInput.value = '';
    imposterCountInput.value = 1;
    imposterHintToggle.checked = false;
    renderPlayers();
    populateTopicSelection(); // Wichtig: Themenauswahl und Chips zurücksetzen
    showScreen(setupScreen);
    checkGameReadiness();
}

// --- 7. Die magischen Ohren (So hört unsere App, wenn etwas passiert) ---
document.addEventListener('DOMContentLoaded', () => {
    loadCustomTopics(); // Lade alle eigenen Themen beim Start
    renderPlayers(); // Zeige die Spielerliste (am Anfang leer)
    populateTopicSelection(); // Füllt die Themen-Chips und das versteckte Select-Feld

    addPlayerButton.addEventListener('click', addPlayer);
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addPlayer();
        }
    });
    startGameButton.addEventListener('click', startGame);
    goToWordManagementButton.addEventListener('click', () => showScreen(wordManagementScreen));
    
    addTopicButton.addEventListener('click', addTopic);
    crewWordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTopic();
        }
    });
    imposterHintWordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTopic();
        }
    });
    backToSetupButton.addEventListener('click', () => showScreen(setupScreen));

    revealButton.addEventListener('click', revealRole);
    nextPlayerButton.addEventListener('click', nextPlayer);
    endGameButton.addEventListener('click', showSummary);

    newGameButton.addEventListener('click', resetGame);

    checkGameReadiness(); // Initial check beim Laden der Seite
});