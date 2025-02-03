let recognizing = false;
let recognition;

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript + " ";
    }
    document.getElementById("transcription").value = transcript;
    chrome.storage.local.set({ transcript });
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    if (event.error === "not-allowed") {
      alert("Microphone access is required. Click 'Start Transcription' again and allow access when prompted.");
    }
  };
} else {
  alert("Your browser does not support speech recognition.");
}

document.getElementById("checkbox").addEventListener("click", () => {
  if (!recognition) return;

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(() => {
      if (recognizing) {
        recognition.stop();
        recognizing = false;
        document.getElementById("checkbox").innerText = "Start Transcription";
      } else {
        recognition.start();
        recognizing = true;
        document.getElementById("checkbox").innerText = "Stop Transcription";
      }
    })
    .catch(() => {
      alert("Please grant microphone access in Chrome settings and reload the extension.");
    });
});


const transcription = document.getElementById('transcription');

if (recognition) { // Check if speech recognition is initialized
  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript + " ";
    }
    transcription.value = transcript;

    // Auto-scroll to the bottom
    transcription.scrollTop = transcription.scrollHeight; // Key line for auto-scrolling
    chrome.storage.local.set({ transcript });
  };


  // copy texts
  document.getElementById("copyBtn").addEventListener("click", () => {
    const transcriptionText = document.getElementById("transcription");
    transcriptionText.select();
    document.execCommand("copy");
  });

  // when press saved text button...
  document.getElementById("toggleSavedBtn").addEventListener("click", () => {
    document.getElementById("mainSection").style.display = "none";
    document.getElementById("savedSection").style.display = "block";
    displaySavedTexts();
  });

  // go back from saved text page
  document.getElementById("backBtn").addEventListener("click", () => {
    document.getElementById("savedSection").style.display = "none";
    document.getElementById("mainSection").style.display = "block";
  });

  // save yranscribed texts
  document.getElementById("saveBtn").addEventListener("click", () => {
    const text = document.getElementById("transcription").value;
    if (text.trim() !== "") {
      chrome.storage.local.get({ savedTexts: [] }, (data) => {
        const updatedTexts = [text, ...data.savedTexts];
        chrome.storage.local.set({ savedTexts: updatedTexts }, displaySavedTexts);
      });
    }
  });
}


// function for preview saved texts
function displaySavedTexts() {
  chrome.storage.local.get({ savedTexts: [] }, (data) => {
    const savedTextsDiv = document.getElementById("savedTexts");
    savedTextsDiv.innerHTML = "";
    data.savedTexts.forEach((text, index) => {
      const div = document.createElement("div");
      div.className = "saved-text";

      const span = document.createElement("span");
      span.textContent = text;
      span.title = text;

      const copyBtn = document.createElement("button");
      copyBtn.id = "copyBtn2";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", () => copySavedText(index));

      const removeBtn = document.createElement("button");
      removeBtn.id = "removeBtn";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => removeSavedText(index));

      div.appendChild(span);
      div.appendChild(copyBtn);
      div.appendChild(removeBtn);
      savedTextsDiv.appendChild(div);
    });
  });
}


// function for copy saved texts
function copySavedText(index) {
  chrome.storage.local.get({ savedTexts: [] }, (data) => {
    navigator.clipboard.writeText(data.savedTexts[index]).then(() => {
    });
  });
}


// function for remove saved texts
function removeSavedText(index) {
  chrome.storage.local.get({ savedTexts: [] }, (data) => {
    const updatedTexts = data.savedTexts.filter((_, i) => i !== index);
    chrome.storage.local.set({ savedTexts: updatedTexts }, displaySavedTexts);
  });
}


document.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('checkbox');

  checkbox.addEventListener('change', () => {
    const buttons = document.querySelectorAll('#toggleSavedBtn, #saveBtn, #copyBtn, #backBtn');

    buttons.forEach(button => {
      button.classList.toggle('glow', checkbox.checked);
    });
  });
});