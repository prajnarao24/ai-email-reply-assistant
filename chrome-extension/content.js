const API_URL = "http://localhost:8080/api/email/generate";

// Finds the reply box (the last open one)
function getReplyBox() {
  const boxes = document.querySelectorAll('div[role="textbox"][g_editable="true"]');
  return boxes.length ? boxes[boxes.length - 1] : null;
}

// Reads the text of the email being replied to
function getEmailContent() {
  const emails = document.querySelectorAll(".a3s.aiL");
  if (emails.length === 0) return "";
  return emails[emails.length - 1].innerText;
}

// Builds the panel once and attaches it to the page
function createPanel() {
  if (document.getElementById("ai-panel")) return;

  const panel = document.createElement("div");
  panel.id = "ai-panel";
  panel.innerHTML = `
    <select id="ai-tone">
      <option value="professional">Professional</option>
      <option value="friendly">Friendly</option>
      <option value="formal">Formal</option>
      <option value="casual">Casual</option>
    </select>
    <select id="ai-length">
      <option value="short">Short</option>
      <option value="medium">Medium</option>
      <option value="detailed">Detailed</option>
    </select>
    <input id="ai-extra" type="text" maxlength="300"
           placeholder="Extra instruction (optional)">
    <button id="ai-btn">AI Reply</button>`;
  document.body.appendChild(panel);

  document.getElementById("ai-btn").addEventListener("click", generateReply);
}

// Places the panel in the Send row, or above the toolbar if there's no room
function positionPanel() {
  const panel = document.getElementById("ai-panel");
  if (!panel) return;

  const toolbars = document.querySelectorAll(".btC");
  if (!getReplyBox() || toolbars.length === 0) {
    panel.style.display = "none";
    return;
  }

  const bar = toolbars[toolbars.length - 1];
  const barRect = bar.getBoundingClientRect();

  const send = bar.querySelector('div[role="button"][data-tooltip^="Send"]');
  const sendRect = (send || bar).getBoundingClientRect();

  const dots = [...bar.querySelectorAll('[aria-label="More options"], [data-tooltip="More options"]')]
    .find((el) => Math.abs(el.getBoundingClientRect().top - sendRect.top) < 40);

  // measure the panel at its natural (full) width first
  panel.style.maxWidth = "none";
  panel.style.display = "flex";
  const naturalWidth = panel.offsetWidth;

  const preferredLeft = dots ? dots.getBoundingClientRect().right + 10 : barRect.left + 440;
  const rightLimit = barRect.right - 50;

  let left, top;
  if (preferredLeft + naturalWidth <= rightLimit) {
    // enough room: same row as Send
    left = preferredLeft;
    top = sendRect.top + sendRect.height / 2 - panel.offsetHeight / 2;
  } else {
    // narrow: squeeze into the compose box width (wraps to 2 rows), sit above the toolbar
    panel.style.maxWidth = barRect.width - 32 + "px";
    left = barRect.left + 16;
    top = barRect.top - panel.offsetHeight - 6;
  }

  left = Math.max(8, Math.min(left, window.innerWidth - panel.offsetWidth - 8));
  top = Math.max(8, top);

  panel.style.left = left + "px";
  panel.style.top = top + "px";
}

// Sends the email to your Java backend and types the reply into Gmail
async function generateReply() {
  const btn = document.getElementById("ai-btn");
  const tone = document.getElementById("ai-tone").value;
  const length = document.getElementById("ai-length").value;
  const extraInstruction = document.getElementById("ai-extra").value.trim();
  const emailContent = getEmailContent().slice(0, 5000);
  const box = getReplyBox();
  if (!box) return;

  btn.innerText = "Generating...";
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailContent, tone, length, extraInstruction })
    });

    if (res.status === 400) {
      alert(await res.text());
    } else if (!res.ok) {
      throw new Error("Server error");
    } else {
      const reply = await res.text();
      box.focus();
      document.execCommand("insertText", false, reply);
    }
  } catch (e) {
    alert("Could not generate reply. Is the backend running?");
  }
  btn.innerText = "AI Reply";
}

createPanel();
positionPanel();

new MutationObserver(positionPanel).observe(document.body, { childList: true, subtree: true });
window.addEventListener("scroll", positionPanel, true);
window.addEventListener("resize", positionPanel);