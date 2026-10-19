const form = document.getElementById("chatForm");
const questionInput = document.getElementById("question");
const messages = document.getElementById("chatMessages");
const loading = document.getElementById("loading");
const sendButton = document.getElementById("sendButton");

const nameInput = document.getElementById("studentName");
const classInput = document.getElementById("studentClass");
const greeting = document.getElementById("greeting");

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = `message ${type}-message`;
  message.textContent = text;
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

document.getElementById("saveProfile").addEventListener("click", () => {
  const name = nameInput.value.trim();
  const studentClass = classInput.value.trim();

  greeting.textContent = name || "Teman";

  if (name || studentClass) {
    addMessage(
      `Profil belajar diperbarui${name ? ` untuk ${name}` : ""}${studentClass ? `, kelas ${studentClass}` : ""}.`,
      "ai"
    );
  } else {
    addMessage("Isi nama atau kelas dulu, bro.", "ai");
  }
});

document.querySelectorAll(".quick-card").forEach((button) => {
  button.addEventListener("click", () => {
    questionInput.value = button.dataset.prompt;
    questionInput.focus();
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = questionInput.value.trim();
  if (!question || sendButton.disabled) return;

  const name = nameInput.value.trim();
  const studentClass = classInput.value.trim();

  const fullQuestion =
    `${name ? "Nama siswa: " + name + "\n" : ""}` +
    `${studentClass ? "Kelas: " + studentClass + "\n" : ""}` +
    question;

  addMessage(question, "user");
  questionInput.value = "";
  sendButton.disabled = true;
  loading.hidden = false;

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question: fullQuestion })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Terjadi kesalahan.");
    }

    addMessage(data.answer, "ai");
  } catch (error) {
    addMessage(
      `Maaf bro, AI belum bisa menjawab. ${error.message} Coba lagi nanti.`,
      "ai"
    );
  } finally {
    loading.hidden = true;
    sendButton.disabled = false;
    questionInput.focus();
  }
});
