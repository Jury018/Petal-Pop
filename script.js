// Redirect to the game page
function startGame() {
    // Save the music state to localStorage
    localStorage.setItem("musicMuted", backgroundMusic.muted);
    localStorage.setItem("musicCurrentTime", backgroundMusic.currentTime);

    // Redirect to the game page
    window.location.href = "home.html";
}

// Show the instructions modal
function viewInstructions() {
    document.getElementById("instructions-modal").style.display = "block";
}

// Close the instructions modal
function closeInstructions() {
    document.getElementById("instructions-modal").style.display = "none";
}

// Show the high scores modal
function viewHighScores() {
    const highScores = getHighScores();
    const highScoresList = document.getElementById("high-scores-list");

    // Clear the list before adding new scores
    highScoresList.innerHTML = "";

    // Add each high score to the list
    if (highScores.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No high scores yet!";
        highScoresList.appendChild(li);
    } else {
        highScores.forEach((score, index) => {
            const li = document.createElement("li");
            li.textContent = `${index + 1}. ${score.name} - ${score.score}`;
            highScoresList.appendChild(li);
        });
    }

    document.getElementById("high-scores-modal").style.display = "block";
}

// Close the high scores modal
function closeHighScores() {
    document.getElementById("high-scores-modal").style.display = "none";
}

// Save a new high score securely
function saveHighScore(name, score) {
    const highScores = getHighScores();

    // Add the new score
    highScores.push({ name, score });

    // Sort the scores in descending order and keep only the top 5
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(5);

    // Save back to localStorage securely
    const encryptedScores = btoa(JSON.stringify(highScores)); // Base64 encode the scores
    localStorage.setItem("highScores", encryptedScores);
}

// Retrieve high scores securely
function getHighScores() {
    const encryptedScores = localStorage.getItem("highScores");
    if (!encryptedScores) return [];

    try {
        const decryptedScores = atob(encryptedScores); // Base64 decode the scores
        return JSON.parse(decryptedScores);
    } catch (error) {
        console.error("Error decoding high scores:", error);
        return [];
    }
}

// Background music and sound icon elements
const backgroundMusic = document.getElementById("background-music");
const soundIconImg = document.getElementById("sound-icon-img");

// Ensure autoplay works and handle browser restrictions
window.addEventListener("load", () => {
    // Attempt to play the music
    const playPromise = backgroundMusic.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log("Background music is playing.");
            })
            .catch(() => {
                console.log("Autoplay prevented. Music will play after user interaction.");
            });
    }
});

// Start music on any click interaction
document.addEventListener("click", () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play().then(() => {
            console.log("Background music started after click interaction.");
        }).catch((error) => {
            console.error("Error playing music:", error);
        });
    }
});

// Toggle sound (mute/unmute) and update the icon
function toggleSound() {
    if (backgroundMusic.muted) {
        backgroundMusic.muted = false;
        backgroundMusic.play().catch((error) => {
            console.log("Error playing music:", error);
        });
        soundIconImg.classList.remove("fa-volume-mute");
        soundIconImg.classList.add("fa-volume-up");
        console.log("Music unmuted");
    } else {
        backgroundMusic.muted = true;
        backgroundMusic.pause();
        soundIconImg.classList.remove("fa-volume-up");
        soundIconImg.classList.add("fa-volume-mute");
        console.log("Music muted");
    }
}

// Attach event listeners to buttons
document.getElementById("start-game-button").addEventListener("click", startGame);
document.getElementById("view-instructions-button").addEventListener("click", viewInstructions);
document.getElementById("close-instructions-button").addEventListener("click", closeInstructions);
document.getElementById("view-high-scores-button").addEventListener("click", viewHighScores);
document.getElementById("close-high-scores-button").addEventListener("click", closeHighScores);
document.getElementById("sound-icon").addEventListener("click", toggleSound);