let lockedWordElement = null; 
let hoverTimeout;
let isScrolling = false;
let scrollTimeout;

function handleHover(word, element) {
    if (isScrolling || lockedWordElement) return;


    clearTimeout(hoverTimeout);

    hoverTimeout = setTimeout(() => {
        if (!isScrolling && !lockedWordElement) {
            element.classList.add("hovered"); 
            showWordDetails(word, element);  
        }
    }, 500); 
}

function handleMouseOut(element) {
    clearTimeout(hoverTimeout); 
    if (lockedWordElement) return;
    element.classList.remove("hovered");
    hideWordDetails(); 
}

document.addEventListener("scroll", () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {
        isScrolling = false;
    }, 300); 
});

async function handleClick(word, element) {
    if (lockedWordElement === element) {
        unlockWord();
        return;
    }

    unlockWord();

    lockedWordElement = element;
    lockedWordElement.classList.add("locked");

    await showWordDetails(word, element);
}

function unlockWord() {
    if (lockedWordElement) {
        lockedWordElement.classList.remove("locked");
        lockedWordElement = null;
        hideWordDetails();
    }
}

function toggleWords(letter) {
    const wordList = document.getElementById(letter);
    const button = wordList.previousElementSibling;

    if (wordList.style.display === "none" || wordList.style.display === "") {
        wordList.style.display = "block";
        button.innerHTML = letter + " &#x25B2;";
    } else {
        wordList.style.display = "none";
        button.innerHTML = letter + " &#x25BC;";
    }
}

async function showWordDetails(word, element) {
    if (lockedWordElement && lockedWordElement !== element) return;

    const sideScreen = document.getElementById("word-details");
    const title = document.getElementById("word-title");
    const phonetic = document.getElementById("word-phonetic");
    const meaning = document.getElementById("word-meaning");
    const secondaryDefinitions = document.getElementById("word-secondary-definitions");
    const origin = document.getElementById("word-origin");
    const examples = document.getElementById("word-examples");
    const synonyms = document.getElementById("word-synonyms");
    const antonyms = document.getElementById("word-antonyms");
    const audioSource = document.getElementById("audio-source");
    const audioPlayer = document.getElementById("word-audio");

    title.textContent = "Loading...";
    phonetic.textContent = "";
    meaning.textContent = "";
    secondaryDefinitions.innerHTML = "";
    origin.textContent = "";
    examples.textContent = "";
    synonyms.textContent = "";
    antonyms.textContent = "";
    audioSource.src = "";
    audioPlayer.style.display = "none";

    sideScreen.classList.remove("hidden");

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!response.ok) {
            throw new Error("Word not found");
        }

        const data = await response.json();
        const wordData = data[0];

        title.textContent = wordData.word || "Unknown";
        phonetic.textContent = wordData.phonetic ? `Phonetic: ${wordData.phonetic}` : "";
        origin.textContent = wordData.origin ? `Origin: ${wordData.origin}` : "";
        meaning.textContent = wordData.meanings?.[0]?.partOfSpeech ? `Part of Speech: ${wordData.meanings[0].partOfSpeech}` : "";

        const allDefinitions = wordData.meanings.flatMap(meaning => meaning.definitions);
        allDefinitions.forEach((def) => {
            const li = document.createElement("li");
            li.textContent = def.definition;
            secondaryDefinitions.appendChild(li);
        });

        const exampleList = allDefinitions
            .map(def => def.example)
            .filter(example => example)
            .join("; ");
        examples.textContent = exampleList ? `Examples: ${exampleList}` : "";

        const synonymList = allDefinitions.flatMap(def => def.synonyms).filter(Boolean);
        const antonymList = allDefinitions.flatMap(def => def.antonyms).filter(Boolean);
        synonyms.textContent = synonymList.length ? `Synonyms: ${synonymList.join(", ")}` : "";
        antonyms.textContent = antonymList.length ? `Antonyms: ${antonymList.join(", ")}` : "";

        const audioUrl = wordData.phonetics?.find(phonetic => phonetic.audio)?.audio;
        if (audioUrl) {
            audioSource.src = audioUrl.startsWith("//") ? `https:${audioUrl}` : audioUrl;
            audioPlayer.style.display = "block";
            audioPlayer.load(); 
        } else {
            audioPlayer.style.display = "none";
        }

    } catch (error) {
        title.textContent = "Error";
        phonetic.textContent = "";
        meaning.textContent = "";
        secondaryDefinitions.innerHTML = "";
        origin.textContent = "";
        examples.textContent = "";
        synonyms.textContent = "";
        antonyms.textContent = "";
        audioPlayer.style.display = "none";
    }
}

function hideWordDetails() {
    const sideScreen = document.getElementById("word-details");
    sideScreen.classList.add("hidden");
}

document.querySelectorAll(".word-list li").forEach(wordItem => {
    const word = wordItem.textContent;
    wordItem.addEventListener("mouseover", () => handleHover(word, wordItem));
    wordItem.addEventListener("mouseout", () => handleMouseOut(wordItem));
    wordItem.addEventListener("click", () => handleClick(word, wordItem));
});

function filterWords() {
    const searchInput = document.getElementById("search-bar").value.toLowerCase();
    const letterSections = document.querySelectorAll(".letter-section");

    letterSections.forEach(section => {
        const wordList = section.querySelector("ul");
        const words = Array.from(wordList.querySelectorAll("li"));

        let sectionHasMatches = false;

        words.forEach(wordItem => {
            const word = wordItem.textContent.toLowerCase();
            if (word.startsWith(searchInput)) {
                wordItem.style.display = ""; 
                sectionHasMatches = true;
            } else {
                wordItem.style.display = "none";
            }
        });

        section.style.display = sectionHasMatches ? "block" : "none";
    });
}

function binarySearch(words, target) {
    let left = 0;
    let right = words.length - 1;
    const lowerTarget = target.toLowerCase();

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const word = words[mid].textContent.toLowerCase();

        if (word.startsWith(lowerTarget)) {
            while (mid > 0 && words[mid - 1].textContent.toLowerCase().startsWith(lowerTarget)) {
                mid--;
            }
            return mid; 
        } else if (word < lowerTarget) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1; 
}
