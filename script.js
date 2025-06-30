const summaryBtn = document.getElementById("summaryBtn");
const quizBtn = document.getElementById("quizBtn");
const articleInput = document.getElementById("articleInput");
const loading = document.getElementById("loading");
const summarySection = document.getElementById("summarySection");
const quizSection = document.getElementById("quizSection");
const summaryText = document.getElementById("summaryText");
const quizContainer = document.getElementById("quizContainer");

// API Key
const API_KEY = GEMINI_API_KEY;


async function callGeminiAPI(promptText) {
  loading.classList.remove("hidden");
  summarySection.classList.add("hidden");
  quizSection.classList.add("hidden");

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }]
    })
  });

  const data = await response.json();
  loading.classList.add("hidden");

  try {
    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    return "⚠️ Error generating content. Please try again.";
  }
}

//summary
summaryBtn.addEventListener("click", async () => {
  const input = articleInput.value.trim();
  if (!input) return alert("Please paste some article content first!");

  const prompt = `Summarize the following text in 5-7 concise lines:\n\n${input}`;
  const result = await callGeminiAPI(prompt);

  summaryText.textContent = result;
  summarySection.classList.remove("hidden");
  quizSection.classList.add("hidden");
});

// Quiz 
quizBtn.addEventListener("click", async () => {
  const input = articleInput.value.trim();
  if (!input) return alert("Please paste some article content first!");

  const prompt = `
  Generate 3 multiple-choice quiz questions based on the following article.
  Each question should have 4 options. Highlight the correct option like this: (✔)
  
  Article: """${input}"""
  `;

  const result = await callGeminiAPI(prompt);
  renderQuiz(result);
});

// Render quiz questions from plain text
function renderQuiz(rawText) {
  quizContainer.innerHTML = ""; 
  const questions = rawText.trim().split(/\n\s*\n/); 

  questions.forEach((qBlock, index) => {
    const lines = qBlock.trim().split("\n");
    let questionText = lines[0];
    let options = lines.slice(1);

    // If first line is just a number or empty, merge with next line
    if (/^\d+\.$/.test(questionText.trim()) && options.length > 0) {
    questionText = `${questionText} ${options[0]}`;
    options = options.slice(1);
    }
    // Ensure options are formatted correctly
    options = options.map(opt => opt.trim()).filter(opt => opt.length > 0);


    const qDiv = document.createElement("div");
    qDiv.className = "quiz-question";

    const qTitle = document.createElement("p");
    qTitle.textContent = `${index + 1}. ${questionText}`;
    qDiv.appendChild(qTitle);

    options.forEach((opt, i) => {
      const label = document.createElement("label");
      label.className = "quiz-option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${index}`;
      input.value = opt;

      label.appendChild(input);
      label.append(` ${opt.replace("(✔)", "").trim()}`);

      input.addEventListener("change", () => {
        if (opt.includes("✔")) {
          label.style.color = "green";
        } else {
          label.style.color = "red";
        }
      });

      qDiv.appendChild(label);
      qDiv.appendChild(document.createElement("br"));
    });

    quizContainer.appendChild(qDiv);
  });

  summarySection.classList.add("hidden");
  quizSection.classList.remove("hidden");
}
