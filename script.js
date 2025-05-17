// Basic structure for the Tabata Timer App

// console.log("Script loaded.");

// DO NOT EDIT: Firebase configuration
const firebaseConfig = {
    projectId: "tabata-timer-ff85d",
    appId: "1:788375159314:web:88972d59c3a9e2fbe20ecb",
    storageBucket: "tabata-timer-ff85d.firebasestorage.app",
    apiKey: "AIzaSyDuRO_Y7PVCDTg-dVAwZ6sxyorOxsZBj5c",
    authDomain: "tabata-timer-ff85d.firebaseapp.com",
    messagingSenderId: "788375159314",
    measurementId: "G-JJ5QH7TJZ3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Get Firestore instance
const auth = firebase.auth(); // ADDED: Initialize Firebase Auth
// console.log("Firebase initialized.");

// DOM Elements
const statusDisplay = document.getElementById('status');
const timeLeftDisplay = document.getElementById('time-left');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const resetButton = document.getElementById('reset-button');
const daySelect = document.getElementById('day-select'); // Added day selector
const activityIndicator = document.getElementById('activity-indicator'); // Added activity indicator element
const challengeSelect = document.getElementById('challenge-select'); // Added challenge selector
const mainTitle = document.getElementById('main-title'); // Added main title element
const markCompleteButton = document.getElementById('mark-complete-button'); // Added button reference
const unmarkCompleteButton = document.getElementById('unmark-complete-button'); // Added unmark button reference
const challengeStatusDisplay = document.getElementById('challenge-status'); // Added status display reference
const challengeStatusText = document.getElementById('challenge-status-text'); // Added status text span reference
const certificateDownloadLink = document.getElementById('certificate-download'); // Added certificate link reference

// ADDED: Auth UI Elements
const authContainer = document.getElementById('auth-container');
const loggedOutView = document.getElementById('logged-out-view');
const loggedInView = document.getElementById('logged-in-view');
const googleSigninButton = document.getElementById('google-signin-button');
const emailSigninShowButton = document.getElementById('email-signin-show-button');
const emailForm = document.getElementById('email-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const emailActionButton = document.getElementById('email-action-button');
const signupToggle = document.getElementById('signup-toggle');
const authErrorDisplay = document.getElementById('auth-error');
const userDisplay = document.getElementById('user-display');
const signoutButton = document.getElementById('signout-button');
const soundToggle = document.getElementById('sound-toggle'); // For Task 15

const workDurationDisplay = document.getElementById('work-duration');
const restDurationDisplay = document.getElementById('rest-duration');
const roundsTotalDisplay = document.getElementById('rounds-total');
const totalTimeDisplay = document.getElementById('total-time');

// Timer State Variables
let timerInterval = null;
let currentState = 'idle'; // idle, preparing, working, resting, paused, finished
let currentRound = 0;
let timeRemaining = 0;
let workDuration = 30; // Default to Day 1
let restDuration = 10; // Default to Day 1
let totalRounds = 4;   // Default to Day 1
let currentWorkoutDay = 1; 
let currentUser = null; 
let soundEnabled = false; 
let previousStateBeforePause = 'idle';

// ADDED: Global definition for the tips icon HTML
const iconHtmlWithTooltip = 
    ' <span id="tips-icon-container" style="cursor: pointer;">' + 
        // Use Chat Bubble SVG
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-chat-left-text-fill" viewBox="0 0 16 16">' + 
            '<path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793V2zm3.5 1a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 2.5a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 2.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5z"/>' + 
        '</svg>' + 
        '<span id="tips-tooltip" class="tooltip-text">' + 
            'Tips for All Levels<br><br>' + 
            '• Surface: Jump on shock-absorbing surfaces like gym mats or wooden floors to reduce joint impact.<br>' + 
            '• Footwear: Wear supportive athletic shoes to cushion your feet.<br>' + 
            '• Form: Keep your elbows close to your body, use your wrists to turn the rope, and land softly on the balls of your feet.<br>' + 
            '• Progression: Gradually increase duration and intensity to prevent overuse injuries.<br><br>' + 
            'Remember, consistency and proper technique are key to maximizing the benefits of jump roping while minimizing the risk of injury.' + 
        '</span>' + 
    '</span>';

// --- Progression Plan Definitions (Needed early) ---
const progressionPlan_30day = [
    // Week 1 (Mon, Wed, Fri Workouts; Rest = 30 sec, Rounds = 4)
    { day: 1, work: 30, rest: 30, rounds: 4 },   // Mon (Base)
    { day: 2, work: 0, rest: 0, rounds: 0 },     // Tue - REST
    { day: 3, work: 35, rest: 30, rounds: 4 },   // Wed (+5s work)
    { day: 4, work: 0, rest: 0, rounds: 0 },     // Thu - REST
    { day: 5, work: 40, rest: 30, rounds: 4 },   // Fri (+5s work)
    { day: 6, work: 0, rest: 0, rounds: 0 },     // Sat - REST
    { day: 7, work: 0, rest: 0, rounds: 0 },     // Sun - REST
    // Week 2
    { day: 8, work: 45, rest: 30, rounds: 4 },   // Mon (+5s work)
    { day: 9, work: 0, rest: 0, rounds: 0 },     // Tue - REST
    { day: 10, work: 50, rest: 30, rounds: 4 },  // Wed (+5s work)
    { day: 11, work: 0, rest: 0, rounds: 0 },    // Thu - REST
    { day: 12, work: 55, rest: 30, rounds: 4 },  // Fri (+5s work)
    { day: 13, work: 0, rest: 0, rounds: 0 },    // Sat - REST
    { day: 14, work: 0, rest: 0, rounds: 0 },    // Sun - REST
    // Week 3
    { day: 15, work: 60, rest: 30, rounds: 4 },  // Mon (+5s work)
    { day: 16, work: 0, rest: 0, rounds: 0 },    // Tue - REST
    { day: 17, work: 65, rest: 30, rounds: 4 },  // Wed (+5s work)
    { day: 18, work: 0, rest: 0, rounds: 0 },    // Thu - REST
    { day: 19, work: 70, rest: 30, rounds: 4 }, // Fri (+5s work)
    { day: 20, work: 0, rest: 0, rounds: 0 },    // Sat - REST
    { day: 21, work: 0, rest: 0, rounds: 0 },    // Sun - REST
    // Week 4
    { day: 22, work: 75, rest: 30, rounds: 4 },  // Mon (+5s work)
    { day: 23, work: 0, rest: 0, rounds: 0 },    // Tue - REST
    { day: 24, work: 80, rest: 30, rounds: 4 },  // Wed (+5s work)
    { day: 25, work: 0, rest: 0, rounds: 0 },    // Thu - REST
    { day: 26, work: 85, rest: 30, rounds: 4 }, // Fri (+5s work)
    { day: 27, work: 0, rest: 0, rounds: 0 },    // Sat - REST
    { day: 28, work: 0, rest: 0, rounds: 0 },    // Sun - REST
    // Week 5 - Days 29 & 30
    { day: 29, work: 90, rest: 30, rounds: 4 }, // Mon (+5s work)
    { day: 30, work: 0, rest: 0, rounds: 0 }     // Tue - REST
];
const progressionPlan_15min = [
    // Week 1 (Rounds: 6, Rest: 10s) - 5 Workout Days
    { day: 1, work: 100, rest: 10, rounds: 6 }, // Total: 10:50
    { day: 2, work: 105, rest: 10, rounds: 6 }, // Total: 11:20
    { day: 3, work: 110, rest: 10, rounds: 6 }, // Total: 11:50
    { day: 4, work: 115, rest: 10, rounds: 6 }, // Total: 12:20
    { day: 5, work: 120, rest: 10, rounds: 6 }, // Total: 12:50
    { day: 6, work: 0, rest: 0, rounds: 0 },   // REST DAY
    { day: 7, work: 0, rest: 0, rounds: 0 },   // REST DAY
    // Week 2 (Rounds: 7, Rest: 5s) - 5 Workout Days, Target Met
    { day: 8,  work: 125, rest: 5, rounds: 7 }, // Total: 15:05 (Goal Met!)
    { day: 9,  work: 125, rest: 5, rounds: 7 }, // Maintain target work
    { day: 10, work: 125, rest: 5, rounds: 7 }, // Maintain target work
    { day: 11, work: 125, rest: 5, rounds: 7 }, // Maintain target work
    { day: 12, work: 125, rest: 5, rounds: 7 }, // Maintain target work
    { day: 13, work: 0, rest: 0, rounds: 0 },  // REST DAY
    { day: 14, work: 0, rest: 0, rounds: 0 },  // REST DAY
    // Week 3 (Rounds: 8, Rest: 5s) - 5 Workout Days
    { day: 15, work: 125, rest: 5, rounds: 8 }, // Total: 17:15
    { day: 16, work: 125, rest: 5, rounds: 8 },
    { day: 17, work: 125, rest: 5, rounds: 8 },
    { day: 18, work: 125, rest: 5, rounds: 8 },
    { day: 19, work: 125, rest: 5, rounds: 8 },
    { day: 20, work: 0, rest: 0, rounds: 0 },  // REST DAY
    { day: 21, work: 0, rest: 0, rounds: 0 },  // REST DAY
    // Final Challenge Day
    { day: 22, work: 900, rest: 0, rounds: 1 } // 15 minutes non-stop
];

// --- Challenge Management Variables (Declared early) ---
let currentChallenge = '30day'; // MOVED Declaration higher
let activeProgressionPlan = progressionPlan_30day; // MOVED Declaration higher

// ADDED: Function to get the correct progression plan based on ID
function getProgressionPlan(challengeId) {
    if (challengeId === '30day') {
        return progressionPlan_30day;
    } else if (challengeId === '15min') {
        return progressionPlan_15min;
    } else {
        console.warn(`Unknown challenge ID '${challengeId}', defaulting to 30day plan.`);
        return progressionPlan_30day; // Default fallback
    }
}

// --- Completion State (Declared early) ---
let completionStatus = {
    '30day': { completedDays: new Set(), challengeComplete: false },
    '15min': { completedDays: new Set(), challengeComplete: false }
};

// console.log("Initial state:", { currentState, currentRound, timeRemaining, workDuration, restDuration, totalRounds });
// console.log("Initial day:", currentWorkoutDay); // Removed redundant log - init handles this

// --- Helper Functions ---

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// ADDED: Function to clear local progress data (moved here)
function clearLocalProgress() {
    // console.log("Clearing local progress data.");
    completionStatus = {
        '30day': { completedDays: new Set(), challengeComplete: false },
        '15min': { completedDays: new Set(), challengeComplete: false }
    };
    // Reset challenge completion display
    updateDaySelectorAppearance();
    checkChallengeCompletion();
    // Optionally reset the timer/current day? Let's reset to day 1 of current challenge
    currentWorkoutDay = findFirstIncompleteDay(currentChallenge); // This now defaults to 1 if empty
    daySelect.value = currentWorkoutDay;
    updateWorkoutInfo(currentWorkoutDay); 
}

// --- Progression Plan --- 
// ... progression plans ...

// --- Completion State ---
// const COMPLETION_DOC_ID = "userProgress"; // REMOVED: Will use collection 'userProgress' keyed by userId

// --- Functions --- 

function updateDisplay() {
    timeLeftDisplay.textContent = formatTime(timeRemaining);
    
    let statusText = 'Idle';
    let activityText = '--';
    activityIndicator.className = ' '; // Reset classes

    if (currentState === 'working') {
        statusText = `Work - Round ${currentRound}/${totalRounds}`;
        document.body.style.backgroundColor = '#d4edda'; // Light green for work
        activityText = 'JUMPING!';
        activityIndicator.classList.add('working');
    } else if (currentState === 'resting') {
        statusText = `Rest - Round ${currentRound}/${totalRounds}`;
        document.body.style.backgroundColor = '#fff3cd'; // Light yellow for rest
        activityText = 'Resting...';
        activityIndicator.classList.add('resting');
    } else if (currentState === 'preparing') { // Added Preparing State Display
        statusText = `Get Ready! (Round ${currentRound+1 > totalRounds ? totalRounds : currentRound+1}/${totalRounds})`; // Show next round number
        document.body.style.backgroundColor = '#cfe2ff'; // Light blue for preparing
        activityText = 'Prepare...';
        activityIndicator.classList.add('preparing'); // Optional: Add specific class
    } else if (currentState === 'paused') {
        // Display based on the state *before* pausing
        const roundText = previousStateBeforePause === 'preparing' 
                            ? (currentRound + 1 > totalRounds ? totalRounds : currentRound + 1)
                            : currentRound;
        statusText = `Paused - ${previousStateBeforePause.charAt(0).toUpperCase() + previousStateBeforePause.slice(1)} - Round ${roundText}/${totalRounds}`;
        document.body.style.backgroundColor = '#e2e3e5'; // Light grey for paused
        activityText = 'Paused'; // Show paused state
    } else if (currentState === 'finished') {
        statusText = 'Workout Complete!';
        document.body.style.backgroundColor = '#f0f0f0'; // Back to default
        activityText = 'Finished!';
    } else { // idle state
        statusText = 'Press Start'; // Idle
        document.body.style.backgroundColor = '#f0f0f0'; // Back to default
        activityText = 'Ready?';
    }
    statusDisplay.textContent = statusText;
    activityIndicator.textContent = activityText; // Update activity text

    // console.log("Display updated.");
}

function updateWorkoutInfo(day) {
    // Use the currently active plan
    const workout = activeProgressionPlan.find(p => p.day === day);
    if (!workout) {
        // console.error(`Workout plan for day ${day} in challenge ${currentChallenge} not found.`);
        statusDisplay.textContent = `Error: Day ${day} plan not found.`;
        timeLeftDisplay.textContent = '--:--';
        document.querySelector('#workout-info h2').textContent = `Workout (Day ${day} - Error)`;
        workDurationDisplay.textContent = '-';
        restDurationDisplay.textContent = '-';
        roundsTotalDisplay.textContent = '-';
        totalTimeDisplay.textContent = '--:--';
        resetButton.disabled = true;
        startButton.disabled = true;
        pauseButton.disabled = true;
        return; // Stop further processing if workout not found
    }

    // console.log(`Loading workout for Day ${day}:`, workout); 

    workDuration = workout.work;
    restDuration = workout.rest;
    totalRounds = workout.rounds;

    // Update the displayed info
    document.querySelector('#workout-info h2').textContent = `Today's Workout (Day ${day})`;
    workDurationDisplay.textContent = workDuration;
    restDurationDisplay.textContent = restDuration;
    roundsTotalDisplay.textContent = totalRounds;
    
    const prepTimePerRound = 2; // Added prep time constant
    const totalSeconds = (prepTimePerRound + workDuration + restDuration) * totalRounds - (totalRounds > 0 ? restDuration : 0); // New formula includes prep time
    totalTimeDisplay.textContent = formatTime(totalSeconds > 0 ? totalSeconds : 0);

    daySelect.value = day;

    resetTimer(false); // Don't log reset during load
    
    updateMarkCompleteButtonState(); 
}

function timerTick() {
    if (timeRemaining > 0) {
        timeRemaining--;
        updateDisplay();
    } else {
        clearInterval(timerInterval);
        timerInterval = null;
        // console.log(`Timer reached zero. Current state: ${currentState}, Current round: ${currentRound}`);

        if (currentState === 'working') {
            if (currentRound < totalRounds) {
                currentState = 'resting';
                timeRemaining = restDuration;
                // console.log(`Transitioning to REST state. Round: ${currentRound}, Time: ${timeRemaining}`);
                startTimerInterval();
            } else {
                currentState = 'finished';
                // console.log("Workout finished!");
                updateDisplay();
                updateButtonStates();
            }
        } else if (currentState === 'resting') {
            currentState = 'preparing';
            timeRemaining = 2; // 2 seconds prepare time
            // console.log(`Transitioning to PREPARING state. Next Round: ${currentRound + 1}, Time: ${timeRemaining}`);
            startTimerInterval();
        } else if (currentState === 'preparing') { 
            currentRound++; 
            currentState = 'working';
            timeRemaining = workDuration;
            // console.log(`Transitioning to WORK state. Round: ${currentRound}, Time: ${timeRemaining}`);
            startTimerInterval();
        } else {
            // console.error("Timer tick in unexpected state:", currentState);
            resetTimer();
        }
    }
}

function startTimerInterval() {
    if (!timerInterval) {
        // console.log("Starting timer interval...");
        updateDisplay(); 
        timerInterval = setInterval(timerTick, 1000);
    }
}

function startWorkout() {
    // console.log("Start button clicked.");
    if (currentState === 'idle' || currentState === 'finished') {
        currentRound = 0; 
        currentState = 'preparing'; 
        timeRemaining = 2; 
        // console.log(`Starting workout. Initial state: ${currentState}, Time: ${timeRemaining}`);
        startTimerInterval();
    } else if (currentState === 'paused') {
        currentState = previousStateBeforePause; 
        // console.log(`Resuming workout. State: ${currentState}, Time: ${timeRemaining}`);
        startTimerInterval();
    }
    updateButtonStates();
}

function pauseWorkout() {
    // console.log("Pause button clicked.");
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        previousStateBeforePause = currentState; 
        currentState = 'paused';
        // console.log(`Workout paused. Was in state: ${previousStateBeforePause}, Time remaining: ${timeRemaining}`);
        updateDisplay();
        updateButtonStates();
    }
}

function resetTimer(log = true) {
    // if (log) console.log("Reset button clicked or reset called.");
    clearInterval(timerInterval);
    timerInterval = null;
    currentState = 'idle';
    currentRound = 0;
    const workout = activeProgressionPlan.find(p => p.day === currentWorkoutDay);
    if (workout) {
        timeRemaining = workout.work; 
    } else {
        timeRemaining = 0; 
    }
    // if (log) console.log(`Timer reset to idle state. Day: ${currentWorkoutDay}, Initial time: ${timeRemaining}`);
    updateDisplay();
    updateButtonStates();
}

function updateButtonStates() {
    const isRunning = currentState === 'working' || currentState === 'resting' || currentState === 'preparing'; // Added preparing
    const isPaused = currentState === 'paused';
    const isIdle = currentState === 'idle' || currentState === 'finished';

    startButton.disabled = isRunning;
    pauseButton.disabled = !isRunning;
    resetButton.disabled = isIdle && currentRound === 0; // Only disable reset if truly at the start

    // If paused, change start button text to "Resume"
    if (isPaused) {
        startButton.textContent = 'Resume';
        startButton.disabled = false; // Enable resume button
    } else {
        startButton.textContent = 'Start';
    }
    // console.log(`Button states updated: Start(${!startButton.disabled}), Pause(${!pauseButton.disabled}), Reset(${!resetButton.disabled})`);
}

function handleDaySelectionChange(event) {
    // console.log("--- handleDaySelectionChange START ---"); // Log entry
    const selectedDay = parseInt(event.target.value);
    // console.log(`Day selection changed. Raw value: '${event.target.value}', Parsed Day: ${selectedDay}`); // Log parsed value
    const targetWorkout = activeProgressionPlan.find(p => p.day === selectedDay);
    if (!targetWorkout) {
        //  console.error(`Selected day ${selectedDay} not found in active plan ${currentChallenge}.`);
         return;
    }

    if (!isNaN(selectedDay) && selectedDay !== currentWorkoutDay) {
        currentWorkoutDay = selectedDay;
        // console.log(`Updating currentWorkoutDay to: ${currentWorkoutDay}`);
        updateWorkoutInfo(currentWorkoutDay);
    } else if (isNaN(selectedDay)){
        // console.error("Selected day is not a number:", event.target.value);
    } else {
        // console.log("Selected day is the same as the current day. No change.");
    }
    // console.log("--- handleDaySelectionChange END ---"); // Log exit
}

// --- Day/Challenge Logic ---

function populateDaySelector(plan) {
    // console.log("[TEMP LOG] Entering populateDaySelector. Plan length:", plan ? plan.length : 'null/undefined'); // TEMP LOG
    if (!plan || plan.length === 0) {
        // console.log("[TEMP LOG] Plan invalid or empty. Setting error option."); // TEMP LOG
        daySelect.innerHTML = '<option value="">Error loading days</option>'; 
        return;
    }
    // daySelect.innerHTML = ' '; // Clear existing options using innerHTML
    
    // Clear existing options using removeChild loop
    while (daySelect.firstChild) {
        daySelect.removeChild(daySelect.firstChild);
    }
    // console.log("[TEMP LOG] Cleared daySelect innerHTML."); // TEMP LOG

    plan.forEach(workoutDay => {
        const option = document.createElement('option');
        option.value = workoutDay.day;
        let text = `Day ${workoutDay.day}`;
        let isDisabled = false; 
        if (workoutDay.work === 0 && workoutDay.rest === 0 && workoutDay.rounds === 0) {
            text += " (REST)";
            option.disabled = true; 
            isDisabled = true;
        }
        option.textContent = text;
        daySelect.appendChild(option);
    });
    // console.log(`[TEMP LOG] Finished populating. Added ${plan.length} options.`); // TEMP LOG
}

function handleChallengeSelectionChange(event) {
    // console.log("[Challenge Change] Event triggered."); // LOG: Function start
    const newChallenge = event.target.value;
    // console.log(`[Challenge Change] Selected value: ${newChallenge}`); // LOG: Selected value

    // Prevent unnecessary updates if the selection didn't actually change
    if (newChallenge === currentChallenge) {
        // console.log("[Challenge Change] Selection matches current challenge. No update needed."); // LOG: No change
        return;
    }

    currentChallenge = newChallenge;
    // console.log(`[Challenge Change] currentChallenge updated to: ${currentChallenge}`); // LOG: State update

    let newTitle = ""; // Variable to hold the title before setting

    // Switch the active progression plan AND UPDATE TITLE using innerHTML
    if (currentChallenge === '30day') {
        activeProgressionPlan = progressionPlan_30day;
        newTitle = "30 Day Challenge" + iconHtmlWithTooltip; // Use simpler name
    } else if (currentChallenge === '15min') {
        activeProgressionPlan = progressionPlan_15min;
        newTitle = "15 Minute Challenge" + iconHtmlWithTooltip; // Use simpler name
    } else {
        console.error("Unknown challenge selected:", currentChallenge); // Keep this error log
        activeProgressionPlan = []; 
        newTitle = "Tabata Timer" + iconHtmlWithTooltip; // Keep fallback
    }

    // console.log(`[Challenge Change] Determined new title (before setting): ${newTitle.substring(0, 50)}...`); // LOG: Title to be set (truncated for brevity)
    mainTitle.innerHTML = newTitle; // Set the title
    // console.log(`[Challenge Change] mainTitle.innerHTML updated.`); // LOG: Confirmation

    // Repopulate the day selector based on the new plan
    populateDaySelector(activeProgressionPlan);

    // Reset timer state and select the first available day for the new challenge
    resetTimer(false); 

    // Find the first *incomplete* day for the *new* challenge
    currentWorkoutDay = findFirstIncompleteDay(currentChallenge); 
    daySelect.value = currentWorkoutDay; 

    updateWorkoutInfo(currentWorkoutDay); 
    updateButtonStates(); 
    updateMarkCompleteButtonState(); 
    updateDaySelectorAppearance(); 
    checkChallengeCompletion(); 
}

// --- Helper Functions for Finding Days ---

function findFirstIncompleteDay(challengeId) {
    let plan;
    if (challengeId === '30day') plan = progressionPlan_30day;
    else if (challengeId === '15min') plan = progressionPlan_15min;
    else plan = progressionPlan_30day; // Fallback
    
    const completedDaysSet = completionStatus[challengeId]?.completedDays;
    if (!plan || !completedDaysSet) {
        // console.warn("Data missing for findFirstIncompleteDay, defaulting to 1");
        return 1;
    }

    let lastWorkoutDay = 1;
    for (const dayData of plan) {
        const isRestDay = dayData.work === 0 && dayData.rest === 0 && dayData.rounds === 0;
        if (!isRestDay) {
            lastWorkoutDay = dayData.day; 
            if (!completedDaysSet.has(dayData.day)) {
                return dayData.day; 
            }
        }
    }
    // console.log("All workout days complete or plan empty, returning last workout day:", lastWorkoutDay);
    return lastWorkoutDay; 
}

function findNextIncompleteDayAfter(challengeId, completedDay) {
    let plan;
    if (challengeId === '30day') plan = progressionPlan_30day;
    else if (challengeId === '15min') plan = progressionPlan_15min;
    else plan = progressionPlan_30day; // Fallback
    
    const completedDaysSet = completionStatus[challengeId]?.completedDays;
    if (!plan || !completedDaysSet) return null;

    for (const dayData of plan) {
        if (dayData.day > completedDay) { 
             const isRestDay = dayData.work === 0 && dayData.rest === 0 && dayData.rounds === 0;
             if (!isRestDay && !completedDaysSet.has(dayData.day)) {
                 return dayData.day; 
             }
        }
    }
    // console.log("No further incomplete workout days found after day", completedDay);
    return null; 
}


// --- Completion Logic Functions ---

function updateMarkCompleteButtonState() {
    const dayData = activeProgressionPlan.find(p => p.day === currentWorkoutDay);
    const isRestDay = dayData && dayData.work === 0 && dayData.rest === 0 && dayData.rounds === 0;
    const isAlreadyComplete = completionStatus[currentChallenge]?.completedDays.has(currentWorkoutDay);
    
    // Disable Mark button if it's a rest day OR already marked complete
    markCompleteButton.disabled = isRestDay || isAlreadyComplete;
    // Enable Unmark button ONLY if it's already marked complete AND NOT a rest day
    unmarkCompleteButton.disabled = !isAlreadyComplete || isRestDay;
    
    // Log state for debugging
    // console.log(`Mark/Unmark Button States: Day=${currentWorkoutDay}, isRest=${isRestDay}, isComplete=${isAlreadyComplete}, MarkDisabled=${markCompleteButton.disabled}, UnmarkDisabled=${unmarkCompleteButton.disabled}`);
}

function updateDaySelectorAppearance() {
    // console.log("Updating day selector appearance for challenge:", currentChallenge);
    const completedDaysSet = completionStatus[currentChallenge]?.completedDays;
    if (!completedDaysSet) {
        // console.error("Completion status not found for challenge:", currentChallenge);
        return;
    }

    const options = daySelect.options;
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const dayNum = parseInt(option.value, 10);
        const workoutDay = activeProgressionPlan.find(p => p.day === dayNum);
        const isRestDay = workoutDay && workoutDay.work === 0 && workoutDay.rest === 0 && workoutDay.rounds === 0;

        let text = `Day ${dayNum}`;
        if (isRestDay) {
            text += " (REST)";
        }

        option.classList.remove('day-complete-option'); // Remove class first

        if (completedDaysSet.has(dayNum)) {
            text += " [DONE]";
            option.classList.add('day-complete-option'); // Add class for styling
            // console.log(`Day ${dayNum} is complete.`);
        }
        
        option.textContent = text;
        // Ensure rest days remain disabled regardless of completion status
        option.disabled = isRestDay; 
    }
    // console.log("Day selector appearance updated.");
}

function checkChallengeCompletion() {
    // console.log("Checking challenge completion for:", currentChallenge);
    const plan = activeProgressionPlan;
    const status = completionStatus[currentChallenge]; 
    const certificateLink = certificateDownloadLink; // Use the reference
    const statusTextSpan = challengeStatusText; // Use the reference
    // console.log("DEBUG CheckCompletion: Ref to certificateLink:", certificateLink);
    // console.log("DEBUG CheckCompletion: Ref to statusTextSpan:", statusTextSpan); // Optional log

    if (!plan || !status || !certificateLink || !statusTextSpan) { // Check for text span too
        // console.error("Cannot check completion: Plan, status, certificate link or status text span missing for", currentChallenge);
        if(statusTextSpan) statusTextSpan.textContent = ' '; 
        if(certificateLink) certificateLink.style.display = 'none'; // Ensure link is hidden on error
        return;
    }

    const totalNonRestDays = plan.filter(day => !(day.work === 0 && day.rest === 0 && day.rounds === 0)).length;
    const completedDaysCount = status.completedDays.size;
    // console.log(`DEBUG CheckCompletion: Non-Rest Days=${totalNonRestDays}, Completed=${completedDaysCount}`);

    if (totalNonRestDays > 0 && completedDaysCount >= totalNonRestDays) {
        // console.log("DEBUG CheckCompletion: Entering 'Challenge Complete' block.");
        // Only trigger confetti if the status wasn't already complete
        if (!status.challengeComplete) {
            // console.log(`Challenge ${currentChallenge} marked as complete! Triggering confetti.`);
            // Trigger confetti animation
            if (typeof confetti === 'function') { 
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 }
                });
            }
        }
        status.challengeComplete = true;
        statusTextSpan.textContent = "🎉 Challenge Complete! 🎉"; // Set text on the span
        challengeStatusDisplay.classList.add('complete'); // Add class to parent div for styling
        
        // --- Set correct certificate based on challenge ---
        if (currentChallenge === '30day') {
            certificateLink.href = 'diploma.png';
            certificateLink.download = '30DayChallenge_Diploma.png';
        } else if (currentChallenge === '15min') {
            certificateLink.href = 'diploma_15min.png';
            certificateLink.download = '15MinChallenge_Diploma.png';
        } else {
            // Default or hide if unexpected challenge?
            certificateLink.href = '#'; // Default fallback
            certificateLink.download = 'Challenge_Diploma.png';
        }
        // --------------------------------------------------

        certificateLink.style.display = 'block'; // Show download link
        // console.log("DEBUG CheckCompletion: Set certificateLink display to block.");
    } else {
        // console.log("DEBUG CheckCompletion: Entering 'Challenge NOT Complete' block.");
        status.challengeComplete = false;
        statusTextSpan.textContent = ' '; // Clear text span if not complete
        challengeStatusDisplay.classList.remove('complete'); // Remove class from parent div
        certificateLink.style.display = 'none'; // Hide download link
        // console.log("DEBUG CheckCompletion: Set certificateLink display to none.");
    }
    updateMarkCompleteButtonState(); 
}

async function handleMarkCompleteClick() { // Made async
    if (!currentUser) {
        console.warn("User not signed in. Cannot mark complete."); // Keep warns?
        alert("Please sign in to save progress.");
        return;
    }
    // console.log(`Marking Day ${currentWorkoutDay} of challenge ${currentChallenge} as complete.`);
    const completedDaysSet = completionStatus[currentChallenge]?.completedDays;
    if (completedDaysSet) {
        if (!completedDaysSet.has(currentWorkoutDay)) { // Only update if not already complete
             completedDaysSet.add(currentWorkoutDay);
             // console.log("Completion set updated:", completedDaysSet);
             updateDaySelectorAppearance();
             checkChallengeCompletion(); // This calls updateMarkCompleteButtonState indirectly
             await saveCompletionStatusToFirebase(); // Save progress (now saves for current user)
             
             // --- Auto-advance to next day ---
             const nextDay = findNextIncompleteDayAfter(currentChallenge, currentWorkoutDay);
             if (nextDay !== null) {
                 // console.log("Auto-advancing to next incomplete day:", nextDay);
                 currentWorkoutDay = nextDay;
                 daySelect.value = currentWorkoutDay; // Update dropdown
                 updateWorkoutInfo(currentWorkoutDay); // Load new day's info
             } else {
                 // console.log("No next incomplete day to advance to.");
                 // Optional: Add feedback if challenge is now fully complete?
             }
             // --------------------------------
        } else {
             // console.log("Day already marked as complete. No changes made.");
        }
    } else {
        console.error("Could not mark day complete - status object missing for challenge:", currentChallenge); // Keep errors?
    }
}

async function handleUnmarkCompleteClick() { // Made async - New Function
    if (!currentUser) {
        console.warn("User not signed in. Cannot unmark complete."); // Keep warns?
        alert("Please sign in to modify progress.");
        return;
    }
    // console.log(`Unmarking Day ${currentWorkoutDay} of challenge ${currentChallenge}.`);
    const completedDaysSet = completionStatus[currentChallenge]?.completedDays;
    if (completedDaysSet) {
        if (completedDaysSet.has(currentWorkoutDay)) { // Only update if currently complete
            completedDaysSet.delete(currentWorkoutDay);
            // console.log("Completion set updated (removed day):", completedDaysSet);
            updateDaySelectorAppearance();
            checkChallengeCompletion(); // This calls updateMarkCompleteButtonState indirectly
            await saveCompletionStatusToFirebase(); // Save progress (now saves for current user)
        } else {
            // console.log("Day was not marked as complete. No changes made.");
        }
    } else {
        console.error("Could not unmark day complete - status object missing for challenge:", currentChallenge); // Keep errors?
    }
}

// --- Firebase Load/Save Functions (Refactored for Task 13) ---

async function loadCompletionStatusFromFirebase(userId) { 
    // console.log(`Attempting to load progress for user: ${userId}`); // Keep this initial log
    if (!userId) {
        console.log("loadCompletionStatusFromFirebase: No user ID provided, cannot load.");
        clearLocalProgress(); // Clear local data if no user
        return;
    }
    const progressDocRef = db.collection("userProgress").doc(userId);

    try {
        const docSnap = await progressDocRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            // console.log("[Load Progress] Raw data loaded from Firestore:", JSON.stringify(data)); // LOG: Raw Data
            
            // Safely initialize completionStatus if it doesn't exist or isn't structured right
             if (!completionStatus) {
                completionStatus = {};
            }
            
            // Load 30-day challenge progress
            if (data.challenges && data.challenges['30day'] && Array.isArray(data.challenges['30day'].completedDays)) {
                 completionStatus['30day'] = {
                    completedDays: new Set(data.challenges['30day'].completedDays || []),
                    challengeComplete: data.challenges['30day'].challengeComplete || false
                };
            } else {
                 completionStatus['30day'] = { completedDays: new Set(), challengeComplete: false }; // Default if missing/malformed
            }

            // Load 15-min challenge progress
            if (data.challenges && data.challenges['15min'] && Array.isArray(data.challenges['15min'].completedDays)) {
                 completionStatus['15min'] = {
                    completedDays: new Set(data.challenges['15min'].completedDays || []),
                    challengeComplete: data.challenges['15min'].challengeComplete || false
                };
             } else {
                 completionStatus['15min'] = { completedDays: new Set(), challengeComplete: false }; // Default if missing/malformed
             }
             
             // LOG: Log the state *after* parsing
             // console.log("[Load Progress] Local completionStatus after parsing Firestore data:", JSON.stringify(completionStatus, (key, value) => value instanceof Set ? [...value] : value));
        } else {
            console.log(`[Load Progress] No progress document found for user ${userId}. Initializing fresh status.`); // Keep this log
            // If no document exists, initialize the default structure locally
            clearLocalProgress(); 
        }
    } catch (error) {
        console.error("Error loading completion status from Firestore:", error);
        // Optionally clear local state on error to avoid inconsistency
        clearLocalProgress(); 
    }
    // Update UI elements after loading
    updateDaySelectorAppearance();
    checkChallengeCompletion(); // Check if challenge is complete based on loaded data
    // Set the dropdown to the first incomplete day of the *current* challenge
    currentWorkoutDay = findFirstIncompleteDay(currentChallenge); 
    daySelect.value = currentWorkoutDay;
    updateWorkoutInfo(currentWorkoutDay); 
}

async function saveCompletionStatusToFirebase() { 
    // console.log("[Save Progress] Function called."); // LOG: Function start
    if (!currentUser) {
        console.warn("[Save Progress] Cannot save data: No user is signed in."); // Keep original warn
        return;
    }
    const userId = currentUser.uid;
    // console.log(`[Save Progress] Attempting to save for user ${userId}.`); // LOG: User ID

    // LOG: Log the current state *before* preparing data
    // console.log("[Save Progress] Current completionStatus object:", JSON.stringify(completionStatus, (key, value) => value instanceof Set ? [...value] : value));
    // console.log("[Save Progress] Current soundEnabled value:", soundEnabled);
    
    try {
        // Prepare data structure for saving
        const saveData = {
            challenges: {
                '30day': {
                    completedDays: Array.from(completionStatus['30day']?.completedDays || new Set()), 
                    challengeComplete: completionStatus['30day']?.challengeComplete || false
                },
                '15min': {
                    completedDays: Array.from(completionStatus['15min']?.completedDays || new Set()), 
                    challengeComplete: completionStatus['15min']?.challengeComplete || false
                }
            },
            settings: {
                soundEnabled: soundEnabled 
            }
        };
        // console.log("[Save Progress] Data prepared for Firestore:", JSON.stringify(saveData)); // LOG: Data to be saved
        
        // Use set with merge: true to create doc if not exists or update existing
        // console.log("[Save Progress] Calling Firestore set..."); // LOG: Before Firestore call
        await db.collection("userProgress").doc(userId).set(saveData, { merge: true }); 
        // console.log("[Save Progress] Firestore set successful for user data."); // LOG: Success

        // --- REMOVING TEST WRITE BLOCK --- 
        // try {
        //     const testDocId = `test-write-${userId.substring(0, 5)}-${Date.now()}`;
        //     console.log(`[Save Progress - TEST] Attempting test write to: ${testDocId}`);
        //     await db.collection("userProgress").doc(testDocId).set({ 
        //         testPayload: "Simple write test", 
        //         timestamp: new Date(),
        //         originalUserId: userId
        //      });
        //     console.log("[Save Progress - TEST] Test write successful.");
        // } catch (testError) {
        //     console.error("[Save Progress - TEST] Test write FAILED:", testError);
        // }
        // --- END TEST WRITE ---

    } catch (error) {
        console.error("[Save Progress] Error saving completion status to Firebase:", error); // Keep this error log
    }
}

// --- Auth Functions ---

// ADDED: Set up Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Sign out function
function handleSignOut() {
    // console.log("[Auth] handleSignOut called"); // Removed log
    auth.signOut().then(() => {
        // console.log("[Auth] User signed out successfully."); // Removed log
        // UI updates are handled by onAuthStateChanged
    }).catch((error) => {
        // console.error("[Auth] Sign out error:", error); // Keep error reporting?
        authErrorDisplay.textContent = `Sign out failed: ${error.message}`;
        authErrorDisplay.style.display = 'block';
    });
}

// ADDED: Google Sign In function
function handleGoogleSignIn() {
    // console.log("[Auth] handleGoogleSignIn called"); // REMOVED Log entry
    // console.log("[Auth] Current window origin:", window.location.origin); // REMOVED Log origin
    const provider = new firebase.auth.GoogleAuthProvider();
    // Consider using signInWithRedirect for better mobile compatibility
    // auth.signInWithRedirect(provider); 
    // console.log("[Auth] Calling signInWithPopup..."); // REMOVED Log before call
    auth.signInWithPopup(provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = result.credential;
            // const token = credential.accessToken; // Token might not be needed immediately
            // The signed-in user info.
            const user = result.user;
            // console.log("[Auth] Google Sign-In with Popup SUCCEEDED for user:", user?.displayName, user?.uid); // REMOVED Log success
            authErrorDisplay.textContent = ''; // Clear any previous errors
            authErrorDisplay.style.display = 'none'; // Hide error display on success
            // No need to manually update UI here, onAuthStateChanged will handle it
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            // const email = error.email; // Often null in popup errors
            // The firebase.auth.AuthCredential type that was used.
            // const credential = error.credential; // Often null in popup errors
            
            // Keep enhanced logging but maybe simplify prefix
            console.error(`Google Sign-In Error (${errorCode}): ${errorMessage}`, error); 
            
            // Specific error handling suggestions:
            if (errorCode === 'auth/popup-closed-by-user') {
                 authErrorDisplay.textContent = "Sign-in cancelled or popup blocked/interfered with (check COOP). Please try again."; // Updated message
            } else if (errorCode === 'auth/popup-blocked') {
                 authErrorDisplay.textContent = "Popup blocked by browser. Please allow popups for this site and try again.";
            } else if (errorCode === 'auth/cancelled-popup-request') {
                 authErrorDisplay.textContent = "Sign-in cancelled. Only one sign-in window allowed at a time.";
             } else if (errorCode === 'auth/operation-not-allowed') {
                 authErrorDisplay.textContent = "Sign-in method (Google) not enabled in Firebase console.";
             } else if (errorCode === 'auth/network-request-failed') {
                 authErrorDisplay.textContent = "Network error during sign-in. Check connection.";
             } else if (errorCode === 'auth/unauthorized-domain') {
                 authErrorDisplay.textContent = "This domain is not authorized for sign-in. Check Firebase Console.";
            } else {
                 authErrorDisplay.textContent = `Sign-in failed: ${errorMessage}`;
            }
            authErrorDisplay.style.display = 'block'; // Ensure error is visible
        });
}

// ADDED: Email/Password Action function
function handleEmailPasswordAction() {
    const email = emailInput.value;
    const password = passwordInput.value;
    const isSignUp = emailActionButton.textContent === 'Sign Up'; // Check button text

    // console.log(`Attempting Email/Password Action: ${isSignUp ? 'Sign Up' : 'Sign In'}`); // REMOVED log
    // console.log(`Email: ${email}, Password: [REDACTED]`); // REMOVED log (Password redacted for safety)
    authErrorDisplay.style.display = 'none'; // Clear previous errors

    if (!email || !password) {
        // console.error("Email or password field is empty."); // REMOVED log
        authErrorDisplay.textContent = 'Please enter both email and password.';
        authErrorDisplay.style.display = 'block';
        return;
    }

    if (isSignUp) {
        // Sign Up
        // console.log("Calling createUserWithEmailAndPassword..."); // REMOVED log
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                // console.log("Sign Up successful:", user); // REMOVED log
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // console.error("Sign Up Error:", errorCode, errorMessage); // REMOVED log
                authErrorDisplay.textContent = `Sign Up Failed: ${errorMessage}`;
                authErrorDisplay.style.display = 'block';
            });
    } else {
        // Sign In
        // console.log("Calling signInWithEmailAndPassword..."); // REMOVED log
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                // console.log("Sign In successful:", user); // REMOVED log
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // console.error("Sign In Error:", errorCode, errorMessage); // REMOVED log
                authErrorDisplay.textContent = `Sign In Failed: ${errorMessage}`;
                authErrorDisplay.style.display = 'block';
            });
    }
}

// --- Event Listeners (Moved inside DOMContentLoaded) ---

// --- Initialization ---
async function initializeApp() {
    console.log("Initializing app..."); // Keep this log

    // --- Authentication Listener ---
    auth.onAuthStateChanged(async (user) => {
        // console.log("[AUTH_DEBUG] onAuthStateChanged triggered."); // ADDED LOG
        if (user) {
            // User is signed in.
            currentUser = user;
            // console.log("[AUTH_DEBUG] User is signed IN:", user.displayName, user.uid); // ADDED LOG
            userDisplay.textContent = `Welcome, ${user.displayName || user.email}!`;
            authErrorDisplay.textContent = ''; // Clear errors on successful auth change
            updateUIForAuthState(true); // Show logged-in view

            // Load user-specific progress
            await loadCompletionStatusFromFirebase(user.uid); // Now calls the async function
            
            // Set the initial state based on loaded progress and current challenge
            initializeAppUIBasedOnState(); 

        } else {
            // User is signed out.
            currentUser = null;
            // console.log("[AUTH_DEBUG] User is signed OUT."); // ADDED LOG
            userDisplay.textContent = '';
            updateUIForAuthState(false); // Show logged-out view
            
            clearLocalProgress(); // Clear local data on sign out
            
            // Reset UI to default state for logged-out user
            initializeAppUIBasedOnState(); 
        }
    });
    
    // Initialize challenge selection first
    // console.log("Initializing challenge selection..."); // Less critical log
    challengeSelect.value = currentChallenge; // Set dropdown to current challenge
    activeProgressionPlan = getProgressionPlan(currentChallenge); // Ensure plan matches dropdown
    // Update title initially - USING USER-SPECIFIED NAMES NOW
    let initialTitleText = "Tabata Timer"; // Default fallback
    if (currentChallenge === '15min') {
        initialTitleText = '15 Minute Challenge'; // Use simpler name
    } else if (currentChallenge === '30day') {
        initialTitleText = '30 Day Challenge'; // Use simpler name
    }
    // mainTitle.textContent = currentChallenge === '15min' ? '15 Minute Jump Rope Challenge' : '30-Day Jump Rope Challenge'; // OLD LOGIC

    // Add the tips icon immediately after the title
    mainTitle.innerHTML = initialTitleText + iconHtmlWithTooltip; // Set combined title
    
    // Make sure tooltip event listener is attached after adding the icon
    const tipsIconContainer = document.getElementById('tips-icon-container');
    if (tipsIconContainer) {
        tipsIconContainer.addEventListener('click', toggleTipsTooltip);
        tipsIconContainer.addEventListener('mouseenter', () => {
             const tooltip = document.getElementById('tips-tooltip');
             if(tooltip) tooltip.style.display = 'block'; 
        });
        tipsIconContainer.addEventListener('mouseleave', () => {
             const tooltip = document.getElementById('tips-tooltip');
             if(tooltip) tooltip.style.display = 'none'; 
        });
    }


    // Populate Day Selector based on the *active* progression plan
    // console.log("Populating day selector..."); // Less critical log
    populateDaySelector(activeProgressionPlan);

    // Set initial workout day based on the current challenge's first incomplete day
    // (This happens within onAuthStateChanged or its subsequent calls now)
    
    // Set initial state and display (will be refined by auth state changes)
    // console.log("Setting initial timer state..."); // Less critical log
    // resetTimer(false); // Reset without logging initial state yet, auth change handles it
    
    // console.log("Adding event listeners..."); // Less critical log
    // Add Event Listeners
    startButton.addEventListener('click', startWorkout);
    pauseButton.addEventListener('click', pauseWorkout);
    resetButton.addEventListener('click', () => resetTimer(true)); // Add log=true here
    daySelect.addEventListener('change', handleDaySelectionChange);
    challengeSelect.addEventListener('change', handleChallengeSelectionChange); // Added challenge selector listener
    markCompleteButton.addEventListener('click', handleMarkCompleteClick); // Added listener
    unmarkCompleteButton.addEventListener('click', handleUnmarkCompleteClick); // Added listener
    
    // Auth Listeners
    googleSigninButton.addEventListener('click', handleGoogleSignIn);
    emailSigninShowButton.addEventListener('click', () => {
        emailForm.style.display = emailForm.style.display === 'none' ? 'block' : 'none';
    });
    signupToggle.addEventListener('change', () => {
        const isSignUp = signupToggle.checked;
        emailActionButton.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    });
    emailActionButton.addEventListener('click', handleEmailPasswordAction);
    signoutButton.addEventListener('click', handleSignOut);
    soundToggle.addEventListener('click', handleSoundToggle); // For Task 15
    // Log the element before trying to add a listener
    // console.log("Attempting to find element with ID 'export-progress-button':", document.getElementById('export-progress-button')); // REMOVED LOG
    // CORRECTED ID: Use 'export-button' instead of 'export-progress-button'
    const exportButtonElement = document.getElementById('export-button');
    if (exportButtonElement) {
      exportButtonElement.addEventListener('click', handleExportProgressClick);
    }

    
    // Initial check based on potential existing auth state (before listener fires)
    // If currentUser is already set (e.g., page reload with persisted session), update UI
    // Note: onAuthStateChanged usually fires quickly on load if user is logged in.
    // If not, the listener will handle the logged-out state.
    // console.log("Initial auth check (before listener guaranteed fire):", auth.currentUser); // Log initial sync state
    // Removed explicit UI update here, relying on onAuthStateChanged for consistency
    
    // console.log("App Initialization complete."); // Keep this log
}

// Run initialization when the script loads
// initializeApp(); // REMOVED - Moved inside DOMContentLoaded

// Attach Event Listeners AFTER the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get element references again here, just to be safe
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const resetButton = document.getElementById('reset-button');
    const daySelect = document.getElementById('day-select');
    const challengeSelect = document.getElementById('challenge-select');
    const markCompleteButton = document.getElementById('mark-complete-button');
    const unmarkCompleteButton = document.getElementById('unmark-complete-button');
    const exportButton = document.getElementById('export-button'); // CORRECTED ID HERE TOO
    const signoutButton = document.getElementById('signout-button');
    const googleSigninButton = document.getElementById('google-signin-button');
    const emailSigninShowButton = document.getElementById('email-signin-show-button');
    const emailForm = document.getElementById('email-form'); // Needed for the listener below
    const signupToggle = document.getElementById('signup-toggle');
    const emailActionButton = document.getElementById('email-action-button');
    const soundToggle = document.getElementById('sound-toggle');
    const authErrorDisplay = document.getElementById('auth-error'); // Needed for listener

    // --- Run Initialization FIRST --- 
    initializeApp(); // MOVED HERE

    // --- THEN Attach Listeners ---
    // console.log("DOM fully loaded and parsed, attaching event listeners..."); // REMOVED log

    // Check if elements exist before adding listeners (robustness)
    if (startButton) startButton.addEventListener('click', startWorkout);
    if (pauseButton) pauseButton.addEventListener('click', pauseWorkout);
    if (resetButton) resetButton.addEventListener('click', () => resetTimer(true));
    if (daySelect) daySelect.addEventListener('change', handleDaySelectionChange);
    if (challengeSelect) challengeSelect.addEventListener('change', handleChallengeSelectionChange);
    if (markCompleteButton) markCompleteButton.addEventListener('click', handleMarkCompleteClick);
    if (unmarkCompleteButton) unmarkCompleteButton.addEventListener('click', handleUnmarkCompleteClick);
    if (exportButton) exportButton.addEventListener('click', handleExportProgressClick);

    // ADDED: Auth Event Listeners
    if (signoutButton) signoutButton.addEventListener('click', handleSignOut);
    if (googleSigninButton) googleSigninButton.addEventListener('click', handleGoogleSignIn);
    if (emailSigninShowButton) emailSigninShowButton.addEventListener('click', () => {
        // console.log('Email Sign In/Up clicked');
        if(emailForm) emailForm.style.display = emailForm.style.display === 'none' ? 'block' : 'none';
        if(authErrorDisplay) authErrorDisplay.style.display = 'none';
    });
    if (signupToggle) signupToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const isSigningUp = emailActionButton.textContent === 'Sign Up';
        if (emailActionButton) emailActionButton.textContent = isSigningUp ? 'Sign In' : 'Sign Up';
        if (signupToggle) signupToggle.textContent = isSigningUp ? 'Need an account? Sign Up' : 'Have an account? Sign In';
        if (authErrorDisplay) authErrorDisplay.style.display = 'none';
    });
    if (emailActionButton) emailActionButton.addEventListener('click', handleEmailPasswordAction);
    if (soundToggle) soundToggle.addEventListener('change', handleSoundToggle); // MOVED definition earlier
    
    // Listener for tips icon (moved here, after initializeApp runs)
    const tipsIconContainer = document.getElementById('tips-icon-container');
    if (tipsIconContainer) tipsIconContainer.addEventListener('click', toggleTipsTooltip);

    // console.log("DOM fully loaded and parsed, event listeners attached."); // Confirm listener setup runs - Redundant Now
});

// Make sure handler functions are defined above this point
// function handleExportProgressClick() { ... }
// ...

// --- Export Function --- 

function handleExportProgressClick() {
    if (!currentUser) {
        console.warn("User not signed in. Cannot export progress."); // Keep warn
        alert("Please sign in to export your progress.");
        return;
    }
    // console.log(`Exporting progress for challenge: ${currentChallenge}`);
    // ... rest of function ...
}

// ADDED: Function to handle sound toggle change
function handleSoundToggle(event) {
    soundEnabled = event.target.checked;
    if (currentUser) { // Only save if user is logged in
        // LOG: Check user and log before saving
        saveCompletionStatusToFirebase(); 
    }
}

// ADDED: Function to update UI based on Auth State
function updateUIForAuthState(isLoggedIn) {
    // console.log(`[UI Auth] Updating UI for loggedIn = ${isLoggedIn}`); // Removed log
    if (isLoggedIn) {
        loggedOutView.style.display = 'none';
        loggedInView.style.display = 'block';
        // Ensure other relevant UI updates happen here if needed
        markCompleteButton.disabled = false; // Enable completion tracking
        unmarkCompleteButton.disabled = false; // Enable unmarking
        // ... any other UI adjustments for logged-in state
    } else {
        loggedInView.style.display = 'none';
        loggedOutView.style.display = 'block';
        emailForm.style.display = 'none'; // Ensure email form is hidden on logout/initial view
        emailSigninShowButton.textContent = 'Sign in/up with Email'; // Reset button text
        markCompleteButton.disabled = true; // Disable completion tracking
        unmarkCompleteButton.disabled = true; // Disable unmarking
        // ... any other UI adjustments for logged-out state
    }
}

// ADDED: Function to toggle the visibility of the tips tooltip
function toggleTipsTooltip() {
    const tooltip = document.getElementById('tips-tooltip');
    if (tooltip) {
        tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
    }
}

// ADDED: Centralized function for UI initialization based on current state
function initializeAppUIBasedOnState() {
    // console.log("[Init UI] Function called."); // LOG: Function start
    // LOG: Log the state of completionStatus when this function starts
    // console.log("[Init UI] completionStatus at start:", JSON.stringify(completionStatus, (key, value) => value instanceof Set ? [...value] : value)); 
    // console.log("[Init UI] Initializing UI based on current state..."); // Log for debugging
    updateDaySelectorAppearance(); // Update visuals based on loaded/cleared data
    checkChallengeCompletion();    // Check if current challenge is complete

    // Select the first incomplete day for the *current* challenge
    const firstIncomplete = findFirstIncompleteDay(currentChallenge);
    currentWorkoutDay = firstIncomplete;
    if (daySelect) { // Ensure daySelect exists
        daySelect.value = firstIncomplete; // Set dropdown to the correct day
    }

    updateWorkoutInfo(firstIncomplete); // Load workout info for that day
    resetTimer(false); // Reset timer state (don't log)
    updateButtonStates(); // Ensure buttons are in correct initial state
    // console.log("[Init UI] UI initialization complete.");
} 