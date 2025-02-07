let recognizing = false;
let recognition;

// Function to check if microphone access is granted
async function checkMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
    return true; // Permission is granted
  } catch (error) {
    return false; // Permission is denied
  }
}


// Initialize speech recognition
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
      alert("Microphone access is required. Please allow access when prompted.");
    }
  };
} else {
  alert("Your browser does not support speech recognition.");
}


// Redirect to permission.html to request microphone access
// Toggle transcription on/off
document.getElementById("checkbox").addEventListener("click", async () => {
  if (!recognition) return;

  // Check if microphone permission is already granted
  const hasPermission = await checkMicrophonePermission();
  if (!hasPermission) {
    // Open permission.html in a new tab to request microphone access
    chrome.tabs.create({ url: chrome.runtime.getURL("permission.html") }, (tab) => {
      // Listen for the tab being closed
      chrome.tabs.onRemoved.addListener((tabId) => {
        if (tabId === tab.id) {
          // After the permission page is closed, check permission again
          checkMicrophonePermission().then((hasPermission) => {
            if (hasPermission) {
              // Start transcription if permission is granted
              if (recognizing) {
                recognition.stop();
                recognizing = false;
                document.getElementById("checkbox").innerText = "Start Transcription";
              } else {
                recognition.start();
                recognizing = true;
                document.getElementById("checkbox").innerText = "Stop Transcription";
              }
            }
          });
        }
      });
    });
  } else {
    // Permission is already granted, start transcription
    if (recognizing) {
      recognition.stop();
      recognizing = false;
      document.getElementById("checkbox").innerText = "Start Transcription";
    } else {
      recognition.start();
      recognizing = true;
      document.getElementById("checkbox").innerText = "Stop Transcription";
    }
  }
});


const transcription = document.getElementById('transcription');

if (recognition) {
  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript + " ";
    }
    transcription.value = transcript;
    transcription.scrollTop = transcription.scrollHeight;
    chrome.storage.local.set({ transcript });
  };


  // Copy text
  document.getElementById("copyBtn").addEventListener("click", () => {
    const transcriptionText = document.getElementById("transcription");
    transcriptionText.select();
    document.execCommand("copy");
  });


  // Toggle saved texts section
  document.getElementById("toggleSavedBtn").addEventListener("click", () => {
    document.getElementById("mainSection").style.display = "none";
    document.getElementById("savedSection").style.display = "block";
    displaySavedTexts();
  });


  // Go back from saved texts section
  document.getElementById("backBtn").addEventListener("click", () => {
    document.getElementById("savedSection").style.display = "none";
    document.getElementById("mainSection").style.display = "block";
  });


  // Save transcribed text
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


// Function to display saved texts
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


// Function to copy saved text
function copySavedText(index) {
  chrome.storage.local.get({ savedTexts: [] }, (data) => {
    navigator.clipboard.writeText(data.savedTexts[index]).then(() => {
    });
  });
}


// Function to remove saved text
function removeSavedText(index) {
  chrome.storage.local.get({ savedTexts: [] }, (data) => {
    const updatedTexts = data.savedTexts.filter((_, i) => i !== index);
    chrome.storage.local.set({ savedTexts: updatedTexts }, displaySavedTexts);
  });
}


// Toggle button glow effect
document.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('checkbox');

  checkbox.addEventListener('change', () => {
    const buttons = document.querySelectorAll('#toggleSavedBtn, #saveBtn, #copyBtn, #backBtn');

    buttons.forEach(button => {
      button.classList.toggle('glow', checkbox.checked);
    });
  });
});