const fileInput = document.getElementById("fileInput");
const inputText = document.getElementById("inputText");
const summarizeBtn = document.getElementById("summarizeBtn");
const loading = document.getElementById("loading");
const summaryResult = document.getElementById("summaryResult");
const summaryText = document.getElementById("summaryText");

const API_URL = "https://your-api-gateway-url.amazonaws.com/prod/summarize"; // Replace this

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  if (file.type === "text/plain") {
    reader.onload = (e) => {
      inputText.value = e.target.result;
    };
    reader.readAsText(file);
  } else if (file.type === "application/pdf") {
    const typedArray = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument(typedArray).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str).join(" ");
      text += strings + "\n\n";
    }
    inputText.value = text.trim();
  } else {
    alert("Only .txt or .pdf files are supported.");
  }
});

summarizeBtn.addEventListener("click", async () => {
  const text = inputText.value.trim();
  if (!text) {
    alert("Please provide or upload content.");
    return;
  }

  loading.classList.remove("hidden");
  summaryResult.classList.add("hidden");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error("Failed to summarize.");

    const data = await response.json();
    summaryText.textContent = data.summary || "No summary returned.";
    summaryResult.classList.remove("hidden");
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    loading.classList.add("hidden");
  }
});
