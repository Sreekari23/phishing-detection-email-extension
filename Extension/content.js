// Function to extract email details
function extractEmailDetails() {
    const subject = document.querySelector('.hP')?.innerText || '';
    const body = document.querySelector('.a3s')?.innerText || '';
    const urls = Array.from(document.querySelectorAll('.a3s a')).map(a => a.href);
    const attachments = Array.from(document.querySelectorAll('.aQy')).map(att => att.innerText);
    return { subject, body, urls, attachments };
  }
  
  // Function to scan all links and mark them
  function scanLinksInEmail() {
    const emailLinks = document.querySelectorAll("div[role='link'] a, .ii a");
  
    emailLinks.forEach(link => {
      const href = link.href;
  
      fetch("http://127.0.0.1:8000/check-url/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: href })
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === "dangerous") {
          link.style.color = "red";
          link.style.border = "2px solid red";
          link.style.backgroundColor = "#ffcccc";
          link.title = "⚠️ Phishing suspected!";
        } else if (data.status === "safe") {
          link.style.color = "green";
          link.title = "✔️ Safe link";
        }
      })
      .catch(error => console.error("Error checking link:", error));
    });
  }
  
  // Function to analyze entire email with Gemini + backend
  function analyzeEmailContent() {
    const emailData = extractEmailDetails();

    console.log("Subject:", subject);
    console.log("Body:", body);
    console.log("URLs:", urls);
    console.log("Attachments:", attachments);

  
    fetch("http://127.0.0.1:8000/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData)
    })
      .then(response => response.json())
      .then(data => {
        // Highlight suspicious URLs
        data.phishing_urls?.forEach(phish => {
            if (!phish.url || typeof phish.url !== "string") return;
          
            try {
              const safeUrl = CSS.escape(phish.url); // Escape special characters
              const links = document.querySelectorAll(`a[href="${safeUrl}"]`);
              
              links.forEach(link => {
                link.style.backgroundColor = "red";
                link.title = phish.verdict || "Phishing URL detected";
              });
            } catch (e) {
              console.warn("Invalid URL for selector:", phish.url, e);
            }
          });
          
  
        // Highlight suspicious attachments
        data.suspicious_attachments?.forEach(file => {
          const attachmentElements = document.querySelectorAll('.aQy');
          attachmentElements.forEach(att => {
            if (att.innerText === file) {
              att.style.backgroundColor = "orange";
              att.title = "Suspicious attachment";
            }
          });
        });
  
        // Display LLM analysis
        if (data.llm_analysis) {
            const existing = document.querySelector(".llm-analysis");
            if (!existing) {
              const analysisDiv = document.createElement("div");
              analysisDiv.className = "llm-analysis";
              analysisDiv.innerText = "🧠 Gemini says: " + JSON.stringify(data.llm_analysis, null, 2);
              analysisDiv.style.marginTop = "10px";
              analysisDiv.style.background = "#f0f0f0";
              analysisDiv.style.padding = "10px";
              analysisDiv.style.border = "1px solid #ddd";
              analysisDiv.style.fontStyle = "italic";
              document.body.appendChild(analysisDiv);
            }
          }
        })
      .catch(error => console.error("Error analyzing email:", error));
  }
  
  // Run both scans every few seconds to keep up with Gmail's dynamic content
  setInterval(() => {
    scanLinksInEmail();
    analyzeEmailContent();
  }, 5000);