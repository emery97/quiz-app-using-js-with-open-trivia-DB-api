// Get references to various HTML elements
const _question = document.getElementById('question');
const _options = document.querySelector('.quiz-options');
const _checkBtn = document.getElementById('check-answer');
const _playAgainBtn = document.getElementById('play-again');
const _result = document.getElementById('result');
const _correctScore = document.getElementById('correct-score');
const _totalQuestion = document.getElementById('total-question');
const _countdownEl = document.getElementById('countdown');
let score = 0;
const finalScore = document.querySelector('.modal-body'); // Update this line

// Initialize variables related to the quiz
let correctAnswer = "", correctScore = askedCount = 0, totalQuestion = 10;
let time, countdownInterval;
let sessionToken = ''; // Add a variable for the session token

// Function to start the countdown timer
function startCountdown() {
    const startingMinutes = 1;
    time = startingMinutes * 60;

    updateCountdown();  // Update initially to avoid 1-second delay
    countdownInterval = setInterval(updateCountdown, 1000);
}

// Function to update the countdown timer
function updateCountdown() {
    const minutes = Math.floor(time / 60);
    const seconds = (time % 60).toFixed(0).padStart(2, '0');

    _countdownEl.innerHTML = `${minutes}:${seconds}`;

    if (time <= 0) {
        showGameOverModal();
        clearInterval(countdownInterval);
    } else {
        time--;

        // Check if time is less than or equal to 10
        if (time <= 10) {
            _countdownEl.style.color = 'red';
        } else {
            // If time is greater than 10, reset the color to its default
            _countdownEl.style.color = ''; // or set it to the original color
        }
    }
}

// Function to display the game over modal
function showGameOverModal() {
    const modal = document.getElementById('gameOverModal');
    modal.style.display = 'block';
    finalScore.innerHTML = `<h6>YOUR FINAL SCORE IS: ${correctScore}</h6>`;
}

// Function to close the game over modal and restart the quiz
function closeGameOverModal() {
    const modal = document.getElementById('gameOverModal');
    modal.style.display = 'none';
    restartQuiz();
}

// Function to fetch a session token
async function fetchSessionToken() {
    const tokenUrl = 'https://opentdb.com/api_token.php?command=request';
    try {
        const response = await fetch(tokenUrl);
        const data = await response.json();
        if (data.response_code === 0) {
            sessionToken = data.token;
        }
    } catch (error) {
        console.error('Error fetching session token:', error);
    }
}

// Asynchronous function to fetch and load a new question from an external API
async function loadQuestion() {
    if (askedCount < totalQuestion) {
        // Updated API URL to use session token, category, and difficulty
        const APIUrl = `https://opentdb.com/api.php?amount=1&category=26&difficulty=medium&type=multiple&token=${sessionToken}`;
        try {
            const result = await fetch(APIUrl);
            const data = await result.json();

            if (data.response_code === 0 && data.results.length > 0) {
                _result.innerHTML = "";
                showQuestion(data.results[0]);
            } else {
                console.error('Failed to fetch question from the trivia API.');
            }
        } catch (error) {
            console.error('Error fetching question:', error);
        }
    } else {
        showGameOverModal();
        clearInterval(countdownInterval);
    }
}

// Function to set up event listeners for buttons
function eventListeners() {
    _checkBtn.addEventListener('click', checkAnswer);
    _playAgainBtn.addEventListener('click', closeGameOverModal);
}

// Event listener for the DOMContentLoaded event to initialize the quiz
document.addEventListener('DOMContentLoaded', async function () {
    await fetchSessionToken(); // Fetch session token before starting
    loadQuestion();
    eventListeners();
    _totalQuestion.textContent = totalQuestion;
    _correctScore.textContent = correctScore;
    startCountdown();
});

// Function to display a question and its options
function showQuestion(data) {
    _checkBtn.disabled = false;
    correctAnswer = data.correct_answer;
    let incorrectAnswers = data.incorrect_answers;
    let optionsList = incorrectAnswers;
    optionsList.splice(Math.floor(Math.random() * (incorrectAnswers.length + 1)), 0, correctAnswer);

    _question.innerHTML = `${data.question} <br> <span class="category"> ${data.category} </span>`;
    _options.innerHTML = optionsList.map((option, index) => `<li> ${index + 1}. <span>${option}</span> </li>`).join('');
    selectOption();
}

// Function to handle the selection of an option
function selectOption() {
    _options.querySelectorAll('li').forEach(option => {
        option.addEventListener('click', function () {
            if (_options.querySelector('.selected')) {
                const activeOption = _options.querySelector('.selected');
                activeOption.classList.remove('selected');
            }
            option.classList.add('selected');
        });
    });
}

// Function to check the selected answer against the correct answer
function checkAnswer() {
    _checkBtn.disabled = true;
    if (_options.querySelector('.selected')) {
        let selectedAnswer = _options.querySelector('.selected span').textContent;
        if (selectedAnswer === HTMLDecode(correctAnswer)) {
            correctScore++;
            _result.innerHTML = `<p><i class="fas fa-check"></i>Correct Answer!</p>`;
        } else {
            _result.innerHTML = `<p><i class="fas fa-times"></i>Incorrect Answer!</p> <small><b>Correct Answer: </b>${HTMLDecode(correctAnswer)}</small>`;
        }
        checkCount();
        setTimeout(function () {
            loadQuestion(); // Load the next question after a brief delay
        }, 1000); // Adjust the delay as needed
    } else {
        _result.innerHTML = `<p><i class="fas fa-question"></i>Please select an option!</p>`;
        _checkBtn.disabled = false;
    }
}

// Function to decode HTML entities in a text string
function HTMLDecode(textString) {
    let doc = new DOMParser().parseFromString(textString, "text/html");
    return doc.documentElement.textContent;
}

// Function to update the question count and check if the quiz is complete
function checkCount() {
    askedCount++;
    setCount();
    if (askedCount === totalQuestion) {
        _result.innerHTML += `<p>Your score is ${correctScore}.</p>`;
        _playAgainBtn.style.display = "block";
        _checkBtn.style.display = "none";
    } else {
        setTimeout(function () {
            loadQuestion();
        }, 300);
    }
}

// Function to update the displayed question count and score
function setCount() {
    _totalQuestion.textContent = totalQuestion;
    _correctScore.textContent = correctScore;
}

// Function to restart the quiz
function restartQuiz() {
    correctScore = askedCount = 0;
    _playAgainBtn.style.display = "none";
    _checkBtn.style.display = "block";
    _checkBtn.disabled = false;
    setCount();
    startCountdown(); // Restart the countdown
    loadQuestion(); // Load the first question again
}

