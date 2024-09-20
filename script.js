let TARGET_STRING = `
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   Welcome to the Guess String Challenge !                │
│                                                          │
│   If you can read this,                                  │
|   the code is not just working,                          │
│   it's excelling!                                        │
│                                                          │
│   Symbols and Unicode await you:                         │
│                                                          │
│   Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr  |
|   Ss Tt Uu Vv Ww Xx Yy Zz 0 1 2 3 4 5 6 7 8 9            │
|   , . ; : ' " ! ? + - * / = < > %                        |
|   Ω ≈ ∑ ∆ √ ∫ π ✖ ➕ ➖ ➗ ∞                           │
│   $ € £ ¥ @ # & ^ ~ | _                                  │
│   ( ) { } [ ] ┌ ┐ └ ┘ ─                                  │
|                                                          │
│                                                          │
│   Good luck decoding this masterpiece!                   │
│                                                          │
│   Best Wishes,                                           │
│   Amo                                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
`;

const CHARACTERS = []; // Available characters for guessing
let result = []; // To store correct guesses
let currentGuesses = []; // To display ongoing guesses
let totalGuesses = 0;
let startTime;
let guesserSpeed = 150; // Default guesser speed (ms)
let guessersPerChar = 10; // Default number of guessers per character
let updateCounter = 0;
const PROGRESS_BAR_LENGTH = 30; // Fixed length for progress bar
const updateFrequency = 20; // Numbers of guesses before updating the UI
const progressBarFill = document.getElementById('progress-bar-fill');
const outputElement = document.getElementById('output');

// Populate CHARACTERS array with alphanumeric and special characters
function initializeCharacterSet() {
  CHARACTERS.length = 0; // Reset characters
  for (let i = 0; i < 26; i++) {
    CHARACTERS.push(String.fromCharCode(65 + i)); // A-Z
    CHARACTERS.push(String.fromCharCode(97 + i)); // a-z
  }
  for (let i = 0; i < 10; i++) {
    CHARACTERS.push(String.fromCharCode(48 + i)); // 0-9
  }

  const currencySymbols = ['$', '€', '£', '¥'];
  const punctuationMarks = [' ', ',', '.', ';', ':', "'", '"', '!', '?'];
  const mathOperators = [
    '+',
    '-',
    '*',
    '/',
    '=',
    '<',
    '>',
    '%',
    '≈',
    '√',
    '∫',
    'π',
    '∆',
    'Ω',
    '∑',
    '∞',
    '✖',
    '➕',
    '➖',
    '➗',
  ];
  const brackets = ['(', ')', '{', '}', '[', ']', '┌', '┐', '└', '┘', '─', '│'];
  const otherSymbols = [
    '@',
    '#',
    '&',
    '^',
    '~',
    '|',
    '_',
    '\\',
    '\n',
    '\r',
    '\t',
  ];

  CHARACTERS.push(
    ...punctuationMarks,
    ...mathOperators,
    ...brackets,
    ...currencySymbols,
    ...otherSymbols
  );
}

// Initialize CodeMirror editor for user input
const editor = CodeMirror.fromTextArea(
  document.getElementById('custom-input'),
  {
    lineNumbers: true,
    mode: 'javascript', // You can change this mode to plaintext or another language if needed
    theme: 'default',
    indentWithTabs: true,
    indentUnit: 4,
  }
);

// Helper function to sleep for a given time (in milliseconds)
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Display the current state with a fixed-length progress bar
function displayCurrentState(forceUpdate = false) {
  updateCounter++;
  if (!forceUpdate && updateCounter % updateFrequency !== 0) return;

  const completedCount = result.filter((char) => char !== '').length;
  const progressPercentage = Math.round(
    (completedCount / TARGET_STRING.length) * 100
  );
  progressBarFill.style.width = `${progressPercentage}%`;
  const output = currentGuesses
    .map((char, index) => (result[index] !== '' ? result[index] : char))
    .join('');
  outputElement.innerText = output;
}

// Update stats on the page
function displayStats() {
  const endTime = Date.now();
  const timeSpent = (endTime - startTime) / 1000;
  document.getElementById(
    'stats'
  ).innerText = `Total guesses: ${totalGuesses} | Time: ${timeSpent.toFixed(
    2
  )} seconds`;

  // Show the input and button for the next round
  document.getElementById('custom-input').classList.remove('hidden');
  document.getElementById('restart-btn').classList.remove('hidden');
  document.getElementById('customization-options').classList.remove('hidden');
}

// Get a random character for guessing
function getRandomCharacter() {
  return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
}

// Simulate the guessing process for each character with multiple guessers
async function guessCharacterAtIndex(index, targetChar) {
  let correctGuessFound = false;
  const guessers = Array(guessersPerChar).fill(null);

  while (!correctGuessFound) {
    await Promise.all(
      guessers.map(async () => {
        const guess = getRandomCharacter();
        totalGuesses++;
        if (!correctGuessFound) {
          currentGuesses[index] = guess;
          displayCurrentState();
        }
        if (guess === targetChar) {
          correctGuessFound = true;
          result[index] = guess;
        }
      })
    );
    await sleep(guesserSpeed);
  }
}

// Process the entire string: guess all characters in parallel
async function guessAllCharacters() {
  console.log(
    `${guesserSpeed}ms per guess | ${guessersPerChar} guessers per char`
  );
  outputElement.classList.add('pulse-animation');

  // Hide customization options and start spinner
  document.getElementById('custom-input').classList.add('hidden');
  document.getElementById('restart-btn').classList.add('hidden');
  document.getElementById('customization-options').classList.add('hidden');
  document.getElementById('loading-spinner').classList.remove('hidden');

  result = Array(TARGET_STRING.length).fill(''); // Reset result array
  currentGuesses = Array(TARGET_STRING.length).fill(''); // Reset current guesses
  totalGuesses = 0; // Reset guess count
  startTime = Date.now(); // Start timer

  await Promise.all(
    TARGET_STRING.split('').map((char, index) =>
      guessCharacterAtIndex(index, char)
    )
  );

  // Hide spinner when done
  document.getElementById('loading-spinner').classList.add('hidden');

  // Remove the pulse animation class
  outputElement.classList.remove('pulse-animation');

  // Display final result and statistics
  displayCurrentState(true);
  displayStats();
}

function resetGame() {
  result = Array(TARGET_STRING.length).fill('');
  currentGuesses = Array(TARGET_STRING.length).fill('');
  totalGuesses = 0;
  startTime = Date.now();
  updateCounter = 0; // Reset counter
  progressBarFill.style.width = '0%'; // Reset progress bar
  outputElement.innerText = 'Loading...'; // Reset output
}

// Initialize character set and start the guessing process
initializeCharacterSet();
resetGame();
guessAllCharacters();

// Handle user input for custom string and restart
document.getElementById('restart-btn').addEventListener('click', () => {
  const customString = editor.getValue();
  if (customString) {
    TARGET_STRING = customString;
  }
  resetGame();
  guessAllCharacters(); // Start again with the new string
});

// Handle slider input for speed and number of guessers
document.getElementById('speed-slider').addEventListener('input', function () {
  guesserSpeed = parseInt(this.value, 10);
  document.getElementById('speed-value').textContent = `${guesserSpeed}ms`;
});

document
  .getElementById('guessers-slider')
  .addEventListener('input', function () {
    guessersPerChar = parseInt(this.value, 10);
    document.getElementById(
      'guessers-value'
    ).textContent = `${guessersPerChar} Guessers`;
  });
