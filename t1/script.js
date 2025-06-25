const questions = [
    {
        question: "What is the capital of France?",
        options: ["Berlin", "London", "Paris", "Madrid"],
        answer: 2,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/320px-Tour_Eiffel_Wikimedia_Commons.jpg"
    },
    {
        question: "Which language runs in a web browser?",
        options: ["Java", "C", "Python", "JavaScript"],
        answer: 3,
        image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png"
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        answer: 1,
        image: "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg"
    },
    {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent Van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
        answer: 2,
        image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Mona_Lisa.jpg"
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        answer: 3,
        image: "https://upload.wikimedia.org/wikipedia/commons/5/54/Pacific_Ocean_-_en.png"
    }
];

let currentQuestion = 0;
let score = 0;
let timerInterval;
let timeLeft = 15;

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const submitBtn = document.getElementById('submit');
const nextBtn = document.getElementById('next');
const restartBtn = document.getElementById('restart');
const timerEl = document.getElementById('timer');
const cheerImg = document.getElementById('cheer-img');

// Create an image element for the quiz question (not the cheer image)
let imageEl = document.createElement('img');
imageEl.style.maxWidth = "100%";
imageEl.style.margin = "18px auto";
imageEl.style.display = "block";
imageEl.alt = "Question image";
questionEl.after(imageEl);

function showQuestion(index) {
    const q = questions[index];
    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';
    feedbackEl.textContent = '';
    nextBtn.style.display = 'none';
    submitBtn.style.display = '';
    submitBtn.disabled = false;
    cheerImg.style.display = 'none';

    // Show image if available
    if (q.image) {
        imageEl.src = q.image;
        imageEl.style.display = "block";
    } else {
        imageEl.style.display = "none";
    }

    q.options.forEach((option, i) => {
        const li = document.createElement('li');
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'option';
        input.value = i;
        label.appendChild(input);
        label.appendChild(document.createTextNode(option));
        li.appendChild(label);
        optionsEl.appendChild(li);
    });

    startTimer();
}

function getSelectedOption() {
    const radios = document.getElementsByName('option');
    for (const radio of radios) {
        if (radio.checked) return parseInt(radio.value);
    }
    return null;
}

function startTimer() {
    timeLeft = 15;
    timerEl.textContent = `Time left: ${timeLeft}s`;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `Time left: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitBtn.click(); // Auto-submit when time runs out
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

submitBtn.addEventListener('click', () => {
    const selected = getSelectedOption();
    if (selected === null) {
        feedbackEl.textContent = "Please select an option!";
        feedbackEl.style.color = "#e74c3c";
        return;
    }

    stopTimer();
    cheerImg.style.display = 'none';

    if (selected === questions[currentQuestion].answer) {
        feedbackEl.textContent = "Correct!";
        feedbackEl.style.color = "#43cea2";
        // Show cheer image for 1, 2, 3, or 4 correct answers
        if (score === 0) {
            cheerImg.src = "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif";
            cheerImg.alt = "Good start!";
            cheerImg.style.display = "block";
        } else if (score === 1) {
            cheerImg.src = "https://tenor.com/view/action-heroes-clapping-hands-opening-mouth-vijay-gif-1854556121726669314";
            cheerImg.alt = "Nice try!";
            cheerImg.style.display = "block";
        } else if (score === 2) {
            cheerImg.src = "https://tenor.com/view/master-vijay-bigil-thalapathy-sriraam-gif-17490118";
            cheerImg.alt = "Good job!";
            cheerImg.style.display = "block";
        } else if (score === 3) {
            cheerImg.src = "https://tenor.com/view/vijay-mass-tamil-gif-15103762190904976428";
            cheerImg.alt = "Great work!";
            cheerImg.style.display = "block";
        } else if (score === 4) {
            cheerImg.src = "https://tenor.com/view/tamil-chat-tamil-movie-tamil-comedy-star-chat-star-tamil-chat-gif-12075474285976864121";
            cheerImg.alt = "So close!";
            cheerImg.style.display = "block";
        }
        score++;
    } else {
        feedbackEl.textContent = "Incorrect!";
        feedbackEl.style.color = "#e74c3c";
    }

    scoreEl.textContent = `Score: ${score} / ${questions.length}`;
    submitBtn.disabled = true;
    nextBtn.style.display = '';
    nextBtn.textContent = currentQuestion < questions.length - 1 ? "Next" : "Finish";
    submitBtn.style.display = 'none';
});

nextBtn.addEventListener('click', () => {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        showQuestion(currentQuestion);
    } else {
        questionEl.textContent = "Quiz Completed!";
        imageEl.style.display = "none";
        optionsEl.innerHTML = '';
        timerEl.textContent = '';
        submitBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        restartBtn.style.display = '';

        // Show cheer up message and image based on final score
        if (score === 5) {
            feedbackEl.textContent = "🎉 Amazing! You got a perfect score! 5/5! 🎉";
            feedbackEl.style.color = "#43cea2";
            cheerImg.src = "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif";
            cheerImg.alt = "Congratulations!";
            cheerImg.style.display = "block";
        } else if (score === 4) {
            feedbackEl.textContent = "👏 Great job! You scored 4/5!";
            feedbackEl.style.color = "#43cea2";
            cheerImg.src = "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjlvajEya3M2Ym1xZjJncmRxMHNhYTNubnMxZmIyb2d6Zm5lOWwxaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/M961KSxQEnUxjI8toI/giphy.gif";
            cheerImg.alt = "So close!";
            cheerImg.style.display = "block";
        } else if (score === 3) {
            feedbackEl.textContent = "👍 Good effort! You scored 3/5!";
            feedbackEl.style.color = "#43cea2";
            cheerImg.src = "Sivaji+Template-41.jpg";
            cheerImg.alt = "Great work!";
            cheerImg.style.display = "block";
        } else if (score === 2) {
            feedbackEl.textContent = "🙂 Keep practicing! You scored 2/5!";
            feedbackEl.style.color = "#43cea2";
            cheerImg.src = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDY1azg0dzN5dHloNWRrb3Fyejl0Znlicmlhem10M2Nvc2RhZWRtaCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/E93IVzNIdicoQm3hL3/giphy.gif";
            cheerImg.alt = "Good job!";
            cheerImg.style.display = "block";
        } else if (score === 1) {
            feedbackEl.textContent = "🙌 You scored 1/5! Try again!";
            feedbackEl.style.color = "#43cea2";
            cheerImg.src = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjVtaWNleTZyZ2I5anNobjVvb2dtN2luYmxjZG12ejlrdWt6M3FvZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/SqfHFPbzxw98xwFOiE/giphy.gif";
            cheerImg.alt = "Nice try!";
            cheerImg.style.display = "block";
        } else {
            feedbackEl.textContent = "Don't give up! Try again!";
            feedbackEl.style.color = "#e74c3c";
            cheerImg.style.display = "none";
        }
    }
});

restartBtn.addEventListener('click', () => {
    currentQuestion = 0;
    score = 0;
    scoreEl.textContent = `Score: 0 / ${questions.length}`;
    restartBtn.style.display = 'none';
    stopTimer();
    showQuestion(currentQuestion);
});

// Initialize first question
scoreEl.textContent = `Score: 0 / ${questions.length}`;
restartBtn.style.display = 'none';
nextBtn.style.display = 'none';
showQuestion(currentQuestion);