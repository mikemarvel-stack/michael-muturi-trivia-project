const startButton = document.getElementById('start-btn');
const quizDiv = document.getElementById('quiz-container');
const startDiv = document.getElementById('start-screen');
const resultDiv = document.getElementById('result-screen');
const questionBox = document.getElementById('question');
const answersUl = document.getElementById('answer-buttons');
const nextBtn = document.getElementById('next-btn');
const scoreText = document.getElementById('score');
const missedList = document.getElementById('correct-answers');
const restartButton = document.getElementById('restart-btn');
const feedbackBox = document.getElementById('feedback');
const timerDisplay = document.getElementById('timer');
const categorySelect = document.getElementById('category-select');

let questions = [];
let currentIndex = 0;
let totalScore = 0;
let missedQs = [];
let questionTimer;
let timeLeft = 15;
let totalTimeStart;

startButton.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', () => {
  currentIndex++;
  showQuestion();
});
restartButton.addEventListener('click', () => {
  resultDiv.classList.add('hidden');
  startDiv.classList.remove('hidden');
});

function startQuiz() {
  const amount = 5;
  const category = categorySelect.value;
  const difficulty = "easy"; 
  const type = "multiple";  

  let apiURL = `https://opentdb.com/api.php?amount=${amount}`;
  if (category) apiURL += `&category=${category}`;
  if (difficulty) apiURL += `&difficulty=${difficulty}`;
  if (type) apiURL += `&type=${type}`;

  fetch(apiURL)
    .then(res => res.json())
    .then(data => {
      questions = data.results;
      currentIndex = 0;
      totalScore = 0;
      missedQs = [];
      totalTimeStart = Date.now();

      startDiv.classList.add('hidden');
      quizDiv.classList.remove('hidden');

      showQuestion();
    })
    .catch(error => {
      console.log("Error fetching questions:", error);
      alert("Couldn't load quiz. Try again later.");
    });
}

function showQuestion() {
  clearInterval(questionTimer);
  feedbackBox.innerText = '';
  nextBtn.classList.add('hidden');
  answersUl.innerHTML = '';

  if (currentIndex >= questions.length) {
    endQuiz();
    return;
  }

  timeLeft = 15;
  updateTimer();
  questionTimer = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(questionTimer);
      feedbackBox.innerText = "Time's up!";
      nextBtn.classList.remove('hidden');
    }
  }, 1000);

  let qData = questions[currentIndex];
  let question = decodeHTML(qData.question);
  let correct = decodeHTML(qData.correct_answer);
  let choices = qData.incorrect_answers.map(decodeHTML);
  choices.push(correct);
  choices.sort(() => Math.random() - 0.5);

  questionBox.innerText = question;

  for (let i = 0; i < choices.length; i++) {
    let li = document.createElement('li');
    li.innerText = choices[i];

    li.addEventListener('click', function () {
      clearInterval(questionTimer);
      if (li.innerText === correct) {
        feedbackBox.innerText = "Correct answer 🎉";
        totalScore++;
      } else {
        feedbackBox.innerText = "incorrect😔 Correct answer is: " + correct;
        missedQs.push({ q: question, a: correct });
      }

      nextBtn.classList.remove('hidden');
    });

    answersUl.appendChild(li);
  }
}

function updateTimer() {
  timerDisplay.innerText = `Time Left: ${timeLeft}s`;
}

function endQuiz() {
  quizDiv.classList.add('hidden');
  resultDiv.classList.remove('hidden');

  let totalTime = Math.round((Date.now() - totalTimeStart) / 1000);
  scoreText.innerText = `${totalScore} / ${questions.length} (Time: ${totalTime}s)`;

  missedList.innerHTML = "<h3>What you missed:</h3>";
  for (let i = 0; i < missedQs.length; i++) {
    let p = document.createElement('p');
    p.innerText = missedQs[i].q + " — Answer: " + missedQs[i].a;
    missedList.appendChild(p);
  }
}

function decodeHTML(str) {
  let txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}
