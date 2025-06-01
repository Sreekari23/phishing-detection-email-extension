document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("url-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const url = document.getElementById("urlInput").value;

    const response = await fetch("http://localhost:8000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "Suspicious URL Check",
        body: `Check this suspicious link: ${url}`,
        urls: [url],
        attachment_filenames: []
      })
    });

    const result = await response.json();

    // URL-level verdict
    if (result.phishing_urls && result.phishing_urls.length > 0) {
      document.querySelector(".result").innerText = "⚠️ Phishing URL detected!";
    } else {
      document.querySelector(".result").innerText = "✅ URL looks safe.";
    }

    // Gemini LLM analysis
    const llm = result.llm_analysis || {};
    document.getElementById("summary").innerText = llm.summary || "No summary.";
    document.getElementById("phrases").innerText = JSON.stringify(llm.threat_phrases || [], null, 2);
    document.getElementById("recommendations").innerText = JSON.stringify(llm.recommendations || [], null, 2);
  });
});
