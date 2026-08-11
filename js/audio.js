const audio = document.getElementById("bgMusic");
const MAX_VOLUME = 0.5;         // Η μέγιστη ένταση (0.3 = 30%). Ρυθμίστε το από 0.0 έως 1.0.
const FADE_IN_DURATION = 2000;  // Διάρκεια Fade In (2 δευτερόλεπτα)
const FADE_OUT_DURATION = 800;  // Διάρκεια Fade Out (0.8 δευτερόλεπτα)

// 1. Συνάρτηση για ομαλή αύξηση της έντασης (Fade In)
function fadeIn(audioElement) {
    audioElement.volume = 0;
    const speed = 0.02; // Πιο μικρό βήμα για ομαλή άνοδο μέχρι το 0.3
    const intervalTime = FADE_IN_DURATION / (MAX_VOLUME / speed);

    const fadeInterval = setInterval(() => {
        if (audioElement.volume < MAX_VOLUME) {
            audioElement.volume = Math.min(audioElement.volume + speed, MAX_VOLUME);
        } else {
            clearInterval(fadeInterval);
        }
    }, intervalTime);
}

// 2. Συνάρτηση για ομαλή μείωση της έντασης (Fade Out)
function fadeOut(audioElement) {
    const speed = 0.02;
    const intervalTime = FADE_OUT_DURATION / (audioElement.volume / speed);

    const fadeInterval = setInterval(() => {
        if (audioElement.volume > 0) {
            audioElement.volume = Math.max(audioElement.volume - speed, 0);
        } else {
            clearInterval(fadeInterval);
        }
    }, intervalTime);
}

// Λειτουργία έναρξης της μουσικής στο πρώτο κλικ
function startMusic() {
    audio.play().then(() => {
        localStorage.setItem("musicPlaying", "true");
        fadeIn(audio);
        removeInteractionListeners();
    }).catch(error => {
        console.log("Ο browser μπλοκάρει ακόμα τον ήχο. Περιμένει κλικ.");
    });
}

function removeInteractionListeners() {
    document.removeEventListener("click", startMusic);
    document.removeEventListener("touchstart", startMusic);
}

// 3. Έλεγχος κατάστασης κατά το φόρτωμα της σελίδας
window.addEventListener("DOMContentLoaded", () => {
    const savedTime = localStorage.getItem("musicTime");
    const isPlaying = localStorage.getItem("musicPlaying");

    if (savedTime) {
        audio.currentTime = parseFloat(savedTime);
    }

    if (isPlaying === "true" || isPlaying === null) {
        audio.play().then(() => {
            localStorage.setItem("musicPlaying", "true");
            fadeIn(audio); // Fade In μέχρι το 30% κατά την είσοδο
        }).catch(() => {
            document.addEventListener("click", startMusic);
            document.addEventListener("touchstart", startMusic);
        });
    }
});

// Συνεχής αποθήκευση του χρόνου αναπαραγωγής
audio.addEventListener("timeupdate", () => {
    localStorage.setItem("musicTime", audio.currentTime);
});

// 4. Ενεργοποίηση Fade Out πριν την έξοδο
window.addEventListener("beforeunload", () => {
    fadeOut(audio);
});
