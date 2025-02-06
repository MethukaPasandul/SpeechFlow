// Request microphone permission
navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
        console.log("Microphone access granted.");
        stream.getTracks().forEach(track => track.stop()); // Stop the stream
        window.close(); // Close the temporary webpage
    })
    .catch((error) => {
        console.error("Microphone access denied:", error);
        alert("Microphone access is required for transcription. Please reload the extension and allow access.");
        window.close(); // Close the temporary webpage
    });