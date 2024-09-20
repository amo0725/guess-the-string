let TARGET_STRING = `
|--------------------------------------------------|
|    Yo Bro ~ ~ ~                                  |
|                                                  |
|    If you can read this message successfully.    |
|    That means the code is working fine.          |
|    And you are so lucky to see this message XD   |
|    I hope you like it !                          |
|                                                  |
|    Amo Y(^ W ^)Y                                 |
|--------------------------------------------------|
`; // Default target string

const CHARACTERS = []; // Available characters for guessing
let result = []; // To store correct guesses
let currentGuesses = []; // To display ongoing guesses
let totalGuesses = 0;
let startTime;
let guesserSpeed = 50; // Default guesser speed (ms)
let guessersPerChar = 10; // Default number of guessers per character
let updateCounter = 0;
const PROGRESS_BAR_LENGTH = 30; // Fixed length for progress bar
const updateFrequency = 10; // Update UI every 10 guesses
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

  const punctuationMarks = [' ', ',', '.', ';', ':', "'", '"', '!', '?'];
  const mathOperators = ['+', '-', '*', '/', '=', '<', '>', '%'];
  const brackets = ['(', ')', '{', '}', '[', ']'];
  const currencySymbols = ['$', '€', '£', '¥'];
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
  if (!forceUpdate && updateCounter % updateFrequency !== 0) return; // Only update every 10 guesses unless forced

  const completedCount = result.filter((char) => char !== '').length;
  const progressPercentage = Math.round(
    (completedCount / TARGET_STRING.length) * 100
  );

  // Update progress bar fill
  progressBarFill.style.width = `${progressPercentage}%`;

  // Build the output: display correct guesses or current guess for each character
  const output = currentGuesses
    .map((char, index) => (result[index] !== '' ? result[index] : char))
    .join('');

  // Update the output on the page
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

  while (!correctGuessFound) {
    await Promise.all(
      Array(guessersPerChar)
        .fill(null)
        .map(async () => {
          const guess = getRandomCharacter();
          totalGuesses++;

          if (!correctGuessFound) {
            currentGuesses[index] = guess; // Update current guesses
            displayCurrentState(); // Refresh display
          }

          if (guess === targetChar) {
            correctGuessFound = true;
            result[index] = guess; // Lock the correct character
          }
        })
    );

    await sleep(guesserSpeed); // Simulate slot machine-style guessing
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

// Initialize character set and start the guessing process
initializeCharacterSet();
guessAllCharacters();

// Handle user input for custom string and restart
document.getElementById('restart-btn').addEventListener('click', () => {
  const customString = editor.getValue();
  if (customString) {
    TARGET_STRING = customString;
  }
  guessAllCharacters(); // Start again with the new string
});

// Handle slider input for speed and number of guessers
document.getElementById('speed-slider').addEventListener('input', function () {
  guesserSpeed = this.value;
  document.getElementById('speed-value').textContent = `${guesserSpeed}ms`;
});

document
  .getElementById('guessers-slider')
  .addEventListener('input', function () {
    guessersPerChar = this.value;
    document.getElementById(
      'guessers-value'
    ).textContent = `${guessersPerChar} Guessers`;
  });
