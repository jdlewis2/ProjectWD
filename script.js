// Audio setup - playing cowboy background tunes and sound effects
let backgroundMusic = null;
let winMusic = null;
let loseMusic = null;
let audioInitialized = false;

// Starts the audio only when the start game button is clicked
function initializeAudio() {
    if (audioInitialized) return; // Don't set up twice
    
    // Load our wildwest music
    backgroundMusic = new Audio('WildWest.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;
    
    // Yeehaw for winners!
    winMusic = new Audio('Yeehaw.mp3');
    winMusic.volume = 0.7;
    
    // Sad trombone for losers
    loseMusic = new Audio('Lose.mp3');
    loseMusic.volume = 0.7;
    
    // Add sound toggle button in the corner
    const soundButton = document.createElement('button');
    soundButton.id = 'sound-toggle';
    soundButton.innerHTML = '🔊';
    soundButton.style.position = 'fixed';
    soundButton.style.top = '10px';
    soundButton.style.right = '10px';
    soundButton.style.zIndex = '1000';
    soundButton.style.padding = '5px 10px';
    soundButton.style.background = '#8B4513';
    soundButton.style.border = '2px solid #FFD700';
    soundButton.style.borderRadius = '5px';
    soundButton.style.cursor = 'pointer';
    document.body.appendChild(soundButton);
    
    // Toggle mute/unmute when clicked
    soundButton.addEventListener('click', function() {
        if (backgroundMusic.paused) {
            backgroundMusic.play()
                .then(() => {
                    soundButton.innerHTML = '🔊';
                })
                .catch(error => {
                    console.error("Audio play failed:", error);
                    alert("Please try clicking again to enable sound");
                });
        } else {
            backgroundMusic.pause();
            soundButton.innerHTML = '🔇';
        }
    });
    
    audioInitialized = true;
}

// Play the victory music when player wins
function onPlayerWin() {
    if (!audioInitialized) return;
    
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    winMusic.play().catch(error => {
        console.error("Win music play failed:", error);
    });
}

// Play the sad tunes when player loses
function onPlayerLose() {
    if (!audioInitialized) return;
    
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    loseMusic.play().catch(error => {
        console.error("Lose music play failed:", error);
    });
}

// Gets background music going again after win/loss
function restartBackgroundMusic() {
    if (!audioInitialized) return;
    
    // Stop any victory/defeat music
    if (winMusic && !winMusic.paused) {
        winMusic.pause();
        winMusic.currentTime = 0;
    }
    
    if (loseMusic && !loseMusic.paused) {
        loseMusic.pause();
        loseMusic.currentTime = 0;
    }
    
    // Fire up the background music
    backgroundMusic.currentTime = 0;
    backgroundMusic.play().catch(error => {
        console.error("Failed to restart background music:", error);
    });
    
    // Update the button icon
    const soundButton = document.getElementById('sound-toggle');
    if (soundButton) {
        soundButton.innerHTML = '🔊';
    }
}

// Initialize audio on first click - browsers need user interaction
document.addEventListener('click', function initAudioOnFirstClick() {
    initializeAudio();
    // Only need this once
    document.removeEventListener('click', initAudioOnFirstClick);
});

// Grab all our screens and buttons for navigation
const introScreen = document.getElementById("intro-screen");
const howToPlayScreen = document.getElementById("how-to-play-screen");
const gameContent = document.getElementById("game-content");
const startGameButton = document.getElementById("start-game-button");
const howToPlayButton = document.getElementById("how-to-play-button");
const closeInstructionsButton = document.getElementById("close-instructions");
const returnToMenuButton = document.getElementById("return-to-menu-button");

// Start game and kick off the music
startGameButton.addEventListener("click", () => {
    // Get audio ready
    initializeAudio();
    
    // Try playing the theme music
    if (backgroundMusic) {
        backgroundMusic.play()
            .catch(error => {
                console.error("Audio play failed on game start:", error);
                // Show a little hint about the sound button
                const soundPrompt = document.createElement('div');
                soundPrompt.innerHTML = 'Click the 🔊 button in the corner to enable music!';
                soundPrompt.style.color = '#FFD700';
                soundPrompt.style.padding = '10px';
                soundPrompt.style.background = 'rgba(0,0,0,0.7)';
                soundPrompt.style.borderRadius = '5px';
                soundPrompt.style.position = 'fixed';
                soundPrompt.style.top = '50px';
                soundPrompt.style.right = '10px';
                soundPrompt.style.zIndex = '1001';
                document.body.appendChild(soundPrompt);
                
                // Clean up after a few seconds
                setTimeout(() => {
                    soundPrompt.remove();
                }, 5000);
            });
    }
    
    // Show the game, hide the intro
    introScreen.classList.add("hide");
    gameContent.classList.remove("hide");
    initializer();
});

// Show how to play instructions
howToPlayButton.addEventListener("click", () => {
    introScreen.classList.add("hide");
    howToPlayScreen.classList.remove("hide");
});

// Return from instructions to menu
closeInstructionsButton.addEventListener("click", () => {
    howToPlayScreen.classList.add("hide");
    introScreen.classList.remove("hide");
});

// Return to main menu from the game
returnToMenuButton.addEventListener("click", () => {
    newGameContainer.classList.add("hide");
    gameContent.classList.add("hide");
    introScreen.classList.remove("hide");
    
    // Reset music when going back to menu
    restartBackgroundMusic();
});

// Start with the intro screen on page load
window.onload = () => {
    introScreen.classList.remove("hide");
    gameContent.classList.add("hide");
};

// Grab all the game elements we'll need
const letterContainer = document.getElementById("letter-container");
const optionsContainer = document.getElementById("options-container");
const userInputSection = document.getElementById("user-input-section");
const newGameContainer = document.getElementById("new-game-container");
const newGameButton = document.getElementById("new-game-button");
const canvas = document.getElementById("canvas");
const resultText = document.getElementById("result-text");
const wantedImage = document.getElementById("wanted-image");

// Our victory and defeat images
const winImage = "TIpHat.png"; // Cowboy tipping his hat
const loseImage = "wanted.png"; // Wanted poster for when they get away

//Difficulty and Word Choices
let options = {
    Easy: ["Guns", "Gold", "Saddle", "Horse", "Saloon", "Cowboy"],
    Normal: ["Pistol", "Sheriff", "Outlaw", "Desert", "Marshal", "Wanted"],
    Hard: ["Revolver", "Stagecoach", "Prospector", "Cowpoke", "Winchester", "TumbleWeed"],
    WildWest: ["Vigilante", "Bandolier", "Maverick", "Desperado", "Bounty", "Gunsmoke"]
};

// Game state tracking
let winCount = 0;
let count = 0;
let chosenWord = "";

// Set up the game
const initializer = () => {
    winCount = 0;
    count = 0;
    userInputSection.innerHTML = "";
    optionsContainer.innerHTML = "";
    letterContainer.classList.add("hide");
    newGameContainer.classList.add("hide");
    letterContainer.innerHTML = "";
    wantedImage.classList.add("hide");
    canvas.classList.remove("hide");

    // Clear previous results
    resultText.innerHTML = "";
    resultText.appendChild(wantedImage);

    // Create A-Z letter buttons
    for (let i = 65; i < 91; i++) {
        let button = document.createElement("button");
        button.classList.add("letters");
        button.innerText = String.fromCharCode(i);
        button.addEventListener("click", () => {
            let charArray = chosenWord.split("");
            let dashes = document.getElementsByClassName("dashes");

            // Check if letter is in the word
            if (charArray.includes(button.innerText)) {
                charArray.forEach((char, index) => {
                    if (char === button.innerText) {
                        dashes[index].innerText = char;
                        winCount += 1;

                        // Check if player won
                        if (winCount == charArray.length) {
                            canvas.classList.add("hide");

                            // Show victory image
                            wantedImage.src = winImage;
                            wantedImage.style.display = "block";
                            wantedImage.classList.remove("hide");

                            // Play yeehaw sound
                            onPlayerWin();

                            // Show victory message
                            const winMsg = document.createElement("h2");
                            winMsg.className = "win-msg";
                            winMsg.innerText = "YEEHAW! You caught the outlaw!";

                            const wordMsg = document.createElement("p");
                            wordMsg.innerHTML = `The word was <span>${chosenWord}</span>`;

                            while (resultText.childNodes.length > 1) {
                                resultText.removeChild(resultText.lastChild);
                            }
                            resultText.appendChild(winMsg);
                            resultText.appendChild(wordMsg);

                            blocker();
                        }
                    }
                });
            } else {
                // Wrong guess - draw next part of hangman
                count += 1;
                drawMan(count);
                if (count === 6) {
                    canvas.classList.add("hide");

                    // Show the wanted poster
                    wantedImage.src = loseImage;
                    wantedImage.style.display = "block";
                    wantedImage.classList.remove("hide");

                    // Play defeat sound
                    onPlayerLose();

                    // Show defeat message
                    const loseMsg = document.createElement("h2");
                    loseMsg.className = "lose-msg";
                    loseMsg.innerText = "Aw Man! You let em get away!";

                    const wordMsg = document.createElement("p");
                    wordMsg.innerHTML = `The word was <span>${chosenWord}</span>`;

                    while (resultText.childNodes.length > 1) {
                        resultText.removeChild(resultText.lastChild);
                    }
                    resultText.appendChild(loseMsg);
                    resultText.appendChild(wordMsg);

                    blocker();
                }
            }
            button.disabled = true;
        });
        letterContainer.append(button);
    }

    displayOptions();
    canvasCreator().initialDrawing();
};

// Show the category selection
const displayOptions = () => {
    optionsContainer.innerHTML += `<h3>Choose Your Posse:</h3>`;
    let buttonCon = document.createElement("div");

    for (let value in options) {
        buttonCon.innerHTML += `
            <button class="options" onclick="generateWord('${value}')">${value}</button>`;
    }

    optionsContainer.appendChild(buttonCon);
};

// Disable buttons after game ends
const blocker = () => {
    let optionsButtons = document.querySelectorAll(".options");
    let letterButtons = document.querySelectorAll(".letters");

    optionsButtons.forEach((button) => {
        button.disabled = true;
    });

    letterButtons.forEach((button) => {
        button.disabled = true;
    });

    newGameContainer.classList.remove("hide");
};

// Pick a random word from selected category
const generateWord = (optionValue) => {
    let optionsButtons = document.querySelectorAll(".options");
    optionsButtons.forEach((button) => {
        if (button.innerText.toLowerCase() === optionValue) {
            button.classList.add("active");
        }
        button.disabled = true;
    });

    letterContainer.classList.remove("hide");
    userInputSection.innerText = "";

    let optionArray = options[optionValue];
    chosenWord = optionArray[Math.floor(Math.random() * optionArray.length)].toUpperCase();

    // Make a nice container for the word dashes
    let wordContainer = document.createElement("div");
    wordContainer.style.display = "flex";
    wordContainer.style.justifyContent = "center";
    wordContainer.style.gap = "10px"; // Spacing between letters
    wordContainer.style.marginTop = "20px";
    
    //Adds an Underscore for Each Letter
    for(let i=0;i<chosenWord.length;i++) {
        let dashSpan=document.createElement("span");
        dashSpan.className="dashes";

        //This if Statement Handles "spaces" in the Word
        if(chosenWord[i]===" "){
            dashSpan.innerText=" ";
            winCount++;
        }else{
            dashSpan.innerText="_";
        }
        dashSpan.style.fontSize="2rem";
        dashSpan.style.fontWeight="bold";
        dashSpan.style.width="30px";
        dashSpan.style.textAlign="center";
        wordContainer.appendChild(dashSpan);
    }
    
    userInputSection.appendChild(wordContainer);
};

// Canvas drawing functions for our cowboy
const canvasCreator = () => {
    let context = canvas.getContext("2d");
    context.beginPath();
    context.lineWidth = 2;

    // Helper for drawing lines
    const drawLine = (fromX, fromY, toX, toY, color = "#000") => {
        context.beginPath();
        context.strokeStyle = color;
        context.moveTo(fromX, fromY);
        context.lineTo(toX, toY);
        context.stroke();
    };

    // Helper for drawing circles
    const drawCircle = (x, y, radius, stroke = "#000", fill = null) => {
        context.beginPath();
        context.strokeStyle = stroke;
        context.arc(x, y, radius, 0, Math.PI * 2, true);
        context.stroke();
        if (fill) {
            context.fillStyle = fill;
            context.fill();
        }
    };

    // Helper for drawing shapes
    const drawShape = (points, stroke = "#000", fill = null) => {
        context.beginPath();
        context.strokeStyle = stroke;
        context.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            context.lineTo(points[i][0], points[i][1]);
        }
        context.closePath();
        if (fill) {
            context.fillStyle = fill;
            context.fill();
        }
        context.stroke();
    };

    // Draw the cowboy head with hat
    const head = () => {
        drawCircle(70, 30, 10, "#000", "#F5D0A9"); // Face

        // Cowboy hat brim
        context.beginPath();
        context.strokeStyle = "#000";
        context.fillStyle = "#8B4513";
        context.ellipse(70, 20, 18, 5, 0, 0, Math.PI * 2);
        context.fill();
        context.stroke();

        // Hat top
        context.beginPath();
        context.strokeStyle = "#000";
        context.fillStyle = "#8B4513";
        context.ellipse(70, 15, 10, 5, 0, 0, Math.PI * 2);
        context.fill();
        context.stroke();

        // Eyes and mouth
        drawCircle(66, 28, 1, "#000", "#000");
        drawCircle(74, 28, 1, "#000", "#000");
        drawLine(67, 34, 73, 34);
    };

    // Draw the cowboy body with bandana
    const body = () => {
        drawLine(70, 40, 70, 80);
        drawShape([[60, 42], [80, 42], [82, 46], [58, 46]], "#000", "#FF0000"); // Red bandana
    };

    // Left arm with gun
    const leftArm = () => {
        drawLine(70, 55, 50, 70);
        drawCircle(50, 70, 3, "#000", "#F5D0A9"); // Hand
        drawShape([[50, 65], [40, 65], [40, 69], [50, 69]], "#000", "#333333"); // Gun
    };

    // Right arm
    const rightArm = () => {
        drawLine(70, 55, 90, 70);
        drawCircle(90, 70, 3, "#000", "#F5D0A9"); // Hand
    };

    // Left leg with boot
    const leftLeg = () => {
        drawLine(70, 80, 50, 110);
        drawShape([[50, 110], [45, 110], [45, 115], [55, 115], [55, 110]], "#000", "#8B4513"); // Boot
        drawLine(45, 113, 42, 113, "#FFD700"); // Spur
    };

    // Right leg with boot and belt
    const rightLeg = () => {
        drawLine(70, 80, 90, 110);
        drawShape([[90, 110], [85, 110], [85, 115], [95, 115], [95, 110]], "#000", "#8B4513"); // Boot
        drawLine(95, 113, 98, 113, "#FFD700"); // Spur
        drawShape([[65, 80], [75, 80], [75, 83], [65, 83]], "#000", "#8B4513"); // Belt
        drawShape([[68, 80], [72, 80], [72, 83], [68, 83]], "#000", "#FFD700"); // Belt buckle
    };

    // Set up the Wild West scene
    const initialDrawing = () => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillStyle = "#87CEEB"; // Sky
        context.fillRect(0, 0, canvas.width, 130);
        context.fillStyle = "#D2B48C"; // Desert ground
        context.fillRect(0, 130, canvas.width, canvas.height - 130);
        context.strokeStyle = "#A0522D"; // Ground line
        context.beginPath();
        context.moveTo(0, 130);
        context.lineTo(canvas.width, 130);
        context.stroke();
        drawShape([[120, 130], [120, 100], [115, 100], [115, 115], [110, 115], [110, 130]], "#000", "#2E8B57"); // Cactus
        drawLine(10, 130, 40, 130, "#8B4513"); // Gallows base
        drawLine(10, 10, 10, 130, "#8B4513"); // Gallows post
        drawLine(10, 10, 70, 10, "#8B4513"); // Gallows top
        drawLine(70, 10, 70, 20, "#A52A2A"); // Noose rope
    };

    return { initialDrawing, head, body, leftArm, rightArm, leftLeg, rightLeg };
};

// Draw our cowboy piece by piece as wrong guesses happen
const drawMan = (count) => {
    let { head, body, leftArm, rightArm, leftLeg, rightLeg } = canvasCreator();

    switch (count) {
        case 1: head(); break; // First wrong guess gets the head
        case 2: body(); break; // Second shows the body
        case 3: leftArm(); break; // Third shows left arm
        case 4: rightArm(); break; // Fourth shows right arm
        case 5: leftLeg(); break; // Fifth shows left leg
        case 6: rightLeg(); break; // Last wrong guess completes the cowboy
        default: break;
    }
};

//This Allows the Player to Choose a Letter with the Keyboard
document.addEventListener("keydown",(event)=>{
    const key=event.key.toUpperCase();
    //Checks if Keystroke is a Letter
    if(key>="A"&&key<="Z"){
        const button=Array.from(document.querySelectorAll(".letters"))
            .find(btn=>btn.innerText===key&&!btn.disabled);
        //Makes it so that the Correct Letter is "Clicked"
        if(button){
            button.click();
        }
    }
});
//Reference:https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event

// Start a new game when button clicked
newGameButton.addEventListener("click", () => {
    // Get the music going again
    restartBackgroundMusic();
    
    // Reset everything for a fresh game
    initializer();
});