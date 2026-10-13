// ============================
// Μάθημα 6: Φόρτωση δεδομένων από το data.json
// ============================

// Μια async function μπορεί να χρησιμοποιήσει τη λέξη "await" μέσα της.
// Το "await" σημαίνει: "περίμενε να ολοκληρωθεί αυτή η ενέργεια πριν προχωρήσεις
// στην επόμενη γραμμή" -- χρήσιμο γιατί το fetch παίρνει χρόνο (πρέπει να
// διαβάσει ένα αρχείο), δεν επιστρέφει τα δεδομένα ακαριαία.
async function loadChurchData() {
  try {
    // Το fetch() ζητάει το αρχείο. Επιστρέφει ένα "Promise" --
    // μια υπόσχεση ότι κάποια στιγμή θα έχουμε απάντηση.
    // Το await "ξεπακετάρει" αυτή την υπόσχεση όταν είναι έτοιμη.
    const response = await fetch("data/data.json");

    // Το fetch ΔΕΝ πετάει σφάλμα αν το αρχείο λείπει (π.χ. 404) --
    // πρέπει να το ελέγξουμε εμείς μέσω του response.ok
    if (!response.ok) {
      throw new Error(`Το αρχείο δεν βρέθηκε: ${response.status}`);
    }

    // Το .json() μετατρέπει το ωμό κείμενο του αρχείου σε πραγματικό
    // JavaScript object/array, με το οποίο μπορούμε να δουλέψουμε.
    // Είναι ΚΙ ΑΥΤΟ ασύγχρονο, γι' αυτό έχει επίσης await.
    const data = await response.json();

    // Προς το παρόν απλά το τυπώνουμε στην Κονσόλα (Console) του browser,
    // για να επιβεβαιώσουμε ότι δουλεύει. Στο επόμενο μάθημα θα το
    // χρησιμοποιήσουμε για να "χτίσουμε" HTML.
    console.log("Δεδομένα ναού φορτώθηκαν:", data);

    // Μόλις έχουμε τα δεδομένα, τα περνάμε στις functions που χτίζουν το HTML
    renderSchedule(data.schedule);
    renderGallery(data.gallery);
    renderNews(data.news);
    renderTheology(data.theology);
  } catch (error) {
    // Αν κάτι πάει στραβά (λείπει το αρχείο, κακή σύνταξη JSON, κλπ.),
    // καταλήγουμε εδώ αντί να "σπάσει" σιωπηλά η σελίδα.
    console.error("Σφάλμα κατά τη φόρτωση δεδομένων:", error);
  }
}

// ============================
// Δημιουργεί δυναμικά τις κάρτες προγράμματος στη σελίδα
// scheduleArray: το array από objects { date, time, title }
// ============================
function renderSchedule(scheduleArray) {
  // Βρίσκουμε το <div id="schedule-grid"> μέσα στη σελίδα -- αυτό
  // είναι το "container" μέσα στο οποίο θα βάλουμε τις κάρτες
  const grid = document.getElementById("schedule-grid");

  // Το .map() τρέχει μια φορά ΓΙΑ ΚΑΘΕ αντικείμενο στο array, και
  // επιστρέφει ένα ΝΕΟ array -- εδώ, ένα array από κομμάτια HTML (strings)
  const cardsHTML = scheduleArray.map(function (item) {
    return `
            <article class="schedule-card">
                <p class="schedule-date">${item.date}</p>
                <p class="schedule-time">${item.time}</p>
                <p class="schedule-title">${item.title}</p>
            </article>
        `;
  });

  // Το .map() μας έδωσε array από strings -- π.χ. ['<article>...', '<article>...'].
  // Το .join('') τα ενώνει όλα σε ΕΝΑ string, χωρίς τίποτα ανάμεσά τους.
  grid.innerHTML = cardsHTML.join("");
}

// ============================
// Δημιουργεί δυναμικά τις φωτογραφίες στη gallery (Μάθημα 9)
// galleryArray: array από objects { src, alt, caption }
// Ίδιο ΑΚΡΙΒΩΣ pattern με το renderSchedule -- .map() + .join('')
// ============================
function renderGallery(galleryArray) {
  const grid = document.getElementById("gallery-grid");

  const itemsHTML = galleryArray.map(function (item) {
    // Προσθέσαμε data-src και data-caption -- "κρυφά" attributes πάνω στο
    // ίδιο το div, που δεν εμφανίζονται στη σελίδα αλλά το JS μπορεί να τα διαβάσει
    return `
            <div class="gallery-item" data-src="${item.src}" data-caption="${item.caption}">
                <img src="${item.src}" alt="${item.alt}">
                <p class="gallery-caption">${item.caption}</p>
            </div>
        `;
  });

  grid.innerHTML = itemsHTML.join("");

  // Μόλις "χτίστηκαν" οι κάρτες, τους προσθέτουμε listener για κλικ.
  // ΠΡΕΠΕΙ να γίνει ΜΕΤΑ το innerHTML -- αν προσπαθούσαμε νωρίτερα,
  // τα στοιχεία δεν θα υπήρχαν ακόμα στη σελίδα.
  const items = grid.querySelectorAll(".gallery-item");
  items.forEach(function (item) {
    item.addEventListener("click", function () {
      // Το .dataset διαβάζει τα data-* attributes που ορίσαμε παραπάνω
      openLightbox(item.dataset.src, item.dataset.caption);
    });
  });
}

// ============================
// Δημιουργεί δυναμικά τη λίστα "Τελευταία Νέα" (Μάθημα 15)
// Τρίτη φορά το ΙΔΙΟ pattern (.map() + .join('')) -- αν το αναγνωρίζεις
// πλέον χωρίς να χρειάζεσαι εξήγηση, σημαίνει ότι το έμαθες καλά!
// ============================
function renderNews(newsArray) {
  const list = document.getElementById("news-list");

  const itemsHTML = newsArray.map(function (item) {
    return `<li><a href="${item.url}">${item.title}</a></li>`;
  });

  list.innerHTML = itemsHTML.join("");
}

// ============================
// Δημιουργεί δυναμικά το carousel "Θεολογία και Πίστη"
// Κάθε κάρτα είναι ολόκληρη <a> -- κλικ οπουδήποτε πάνω της
// ανοίγει την τοπική σελίδα (item.url)
// ============================
function renderTheology(theologyArray) {
  const carousel = document.getElementById("theology-carousel");

  const cardsHTML = theologyArray.map(function (item) {
    // Το picture είναι ΠΡΟΑΙΡΕΤΙΚΟ -- αν δεν υπάρχει στο JSON, δεν
    // θέλουμε ένα σπασμένο <img> με κενό src. Φτιάχνουμε το κομμάτι
    // εικόνας ΞΕΧΩΡΙΣΤΑ, και το βάζουμε μέσα στο template ΜΟΝΟ αν υπάρχει.
    const imageHTML = item.picture
      ? `<img src="${item.picture}" alt="${item.title || ""}">`
      : "";

    // Το ίδιο για τον τίτλο -- αν λείπει, δείχνουμε ένα γενικό κείμενο
    const titleText = item.title || "Διαβάστε περισσότερα";

    return `
            <a class="theology-card" href="${item.url}">
                ${imageHTML}
                <div class="theology-card-title">${titleText}</div>
            </a>
        `;
  });

  carousel.innerHTML = cardsHTML.join("");
}

// ============================
// Background μουσική (Μάθημα 16, αναθεωρημένο)
// Ενοποιημένο σύστημα -- πριν ήταν σκόρπιο σε 2 αρχεία (main.js + audio.js),
// που ΚΑΙ ΤΑ ΔΥΟ έλεγχαν το ΙΔΙΟ <audio>, με ασυγχρόνιστη κατάσταση μεταξύ τους.
// ============================
const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");

const MAX_VOLUME = 0.5; // μέγιστη ένταση (0.0 - 1.0)
const FADE_IN_DURATION = 2000; // ms
const FADE_OUT_DURATION = 800; // ms

let isMusicPlaying = false; // η ΜΟΝΑΔΙΚΗ πηγή αλήθειας για την κατάσταση -- όχι το .paused

function fadeIn(audioEl) {
  audioEl.volume = 0;
  const speed = 0.02;
  const intervalTime = FADE_IN_DURATION / (MAX_VOLUME / speed);
  const fadeInterval = setInterval(function () {
    if (audioEl.volume < MAX_VOLUME) {
      audioEl.volume = Math.min(audioEl.volume + speed, MAX_VOLUME);
    } else {
      clearInterval(fadeInterval);
    }
  }, intervalTime);
}

function fadeOut(audioEl) {
  const speed = 0.02;
  const intervalTime = FADE_OUT_DURATION / (audioEl.volume / speed || 1);
  const fadeInterval = setInterval(function () {
    if (audioEl.volume > 0) {
      audioEl.volume = Math.max(audioEl.volume - speed, 0);
    } else {
      clearInterval(fadeInterval);
    }
  }, intervalTime);
}

function updateMusicIcon() {
  musicToggle.textContent = isMusicPlaying ? "🔊" : "🔈";
  musicToggle.setAttribute(
    "aria-label",
    isMusicPlaying ? "Παύση μουσικής" : "Αναπαραγωγή μουσικής",
  );
}

// Καλείται όταν ο χρήστης κάνει το ΠΡΩΤΟ κλικ/άγγιγμα οπουδήποτε στη σελίδα,
// ΜΟΝΟ αν η αυτόματη αναπαραγωγή είχε μπλοκαριστεί αρχικά
function startMusic() {
  bgMusic
    .play()
    .then(function () {
      isMusicPlaying = true;
      localStorage.setItem("musicPlaying", "true");
      fadeIn(bgMusic);
      updateMusicIcon();
      removeInteractionListeners();
    })
    .catch(function () {
      console.log("Ο browser μπλοκάρει ακόμα τον ήχο. Περιμένει κλικ.");
    });
}

function removeInteractionListeners() {
  document.removeEventListener("click", startMusic);
  document.removeEventListener("touchstart", startMusic);
}

// Επαναφορά θέσης αναπαραγωγής από προηγούμενη επίσκεψη -- ΠΕΡΙΜΕΝΟΥΜΕ
// το 'loadedmetadata' event, αλλιώς το currentTime μπορεί να αγνοηθεί
// (ή να πετάξει σφάλμα) αν το αρχείο mp3 δεν έχει προλάβει να φορτωθεί ακόμα
const savedTime = localStorage.getItem("musicTime");
if (savedTime) {
  bgMusic.addEventListener(
    "loadedmetadata",
    function () {
      bgMusic.currentTime = parseFloat(savedTime);
    },
    { once: true },
  ); // { once: true } -- ο listener αφαιρείται μόνος του μετά την 1η εκτέλεση
}

// Προσπάθεια αυτόματης αναπαραγωγής -- εκτός αν ο χρήστης το είχε
// ρητά σταματήσει την προηγούμενη φορά (musicPlaying === "false")
const wasPlaying = localStorage.getItem("musicPlaying");
if (wasPlaying === "true" || wasPlaying === null) {
  bgMusic
    .play()
    .then(function () {
      isMusicPlaying = true;
      localStorage.setItem("musicPlaying", "true");
      fadeIn(bgMusic);
      updateMusicIcon();
    })
    .catch(function () {
      isMusicPlaying = false;
      updateMusicIcon();
      document.addEventListener("click", startMusic);
      document.addEventListener("touchstart", startMusic);
    });
} else {
  updateMusicIcon();
}

// Αποθήκευση της θέσης αναπαραγωγής, συνεχώς όσο παίζει
bgMusic.addEventListener("timeupdate", function () {
  localStorage.setItem("musicTime", bgMusic.currentTime);
});

// Ομαλό fade-out πριν ο χρήστης φύγει από τη σελίδα
window.addEventListener("beforeunload", function () {
  fadeOut(bgMusic);
});

// Το κουμπί -- toggle, με fade in/out αντί για απότομο play/pause
musicToggle.addEventListener("click", function () {
  if (isMusicPlaying) {
    fadeOut(bgMusic);
    setTimeout(function () {
      bgMusic.pause();
    }, FADE_OUT_DURATION + 50);
    isMusicPlaying = false;
    localStorage.setItem("musicPlaying", "false");
  } else {
    bgMusic.play();
    fadeIn(bgMusic);
    isMusicPlaying = true;
    localStorage.setItem("musicPlaying", "true");
  }
  updateMusicIcon();
});

// ============================
// Lightbox: άνοιγμα/κλείσιμο (Μάθημα 10)
// ============================
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");

function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxCaption.textContent = caption;
  lightbox.classList.add("active");
}

function closeLightbox() {
  lightbox.classList.remove("active");
}

// 1. Κλικ στο κουμπί × κλείνει
lightboxClose.addEventListener("click", closeLightbox);

// 2. Κλικ ΟΠΟΥΔΗΠΟΤΕ στο σκούρο φόντο (όχι πάνω στην ίδια την εικόνα) κλείνει
lightbox.addEventListener("click", function (event) {
  // event.target είναι το ΑΚΡΙΒΕΣ στοιχείο που πατήθηκε.
  // Αν πατήθηκε η ίδια η εικόνα, το target θα ήταν το <img>, όχι το lightbox.
  // Θέλουμε να κλείνει ΜΟΝΟ όταν πατηθεί το φόντο, όχι η φωτογραφία.
  if (event.target === lightbox) {
    closeLightbox();
  }
});

// 3. Πάτημα του πλήκτρου Escape κλείνει
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeLightbox();
  }
});

// ============================
// Μάθημα 11: Αποστολή φόρμας με fetch (χωρίς επαναφόρτωση σελίδας)
// ============================
const contactForm = document.getElementById("contact-form-el");
const formStatus = document.getElementById("form-status");

contactForm.addEventListener("submit", async function (event) {
  // Το preventDefault() σταματάει την ΠΡΟΕΠΙΛΕΓΜΕΝΗ συμπεριφορά του browser
  // για ένα submit -- που είναι να "φύγει" από τη σελίδα προς το action URL.
  // Θέλουμε να το χειριστούμε ΕΜΕΙΣ, μέσω JS, χωρίς να φύγουμε.
  event.preventDefault();

  formStatus.textContent = "Αποστολή...";

  // Το FormData "μαζεύει" αυτόματα όλα τα πεδία της φόρμας (name + value)
  // σε ένα object έτοιμο προς αποστολή -- δεν χρειάζεται να τα διαβάσουμε
  // ένα-ένα με το χέρι.
  const formData = new FormData(contactForm);

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json", // λέμε στο Formspree "θέλουμε JSON απάντηση"
      },
    });

    if (response.ok) {
      formStatus.textContent = "Ευχαριστούμε! Το μήνυμά σας στάλθηκε.";
      formStatus.style.color = "green";
      contactForm.reset(); // αδειάζει όλα τα πεδία της φόρμας
    } else {
      throw new Error("Κάτι πήγε στραβά");
    }
  } catch (error) {
    formStatus.textContent = "Δεν στάλθηκε. Δοκιμάστε ξανά ή καλέστε μας.";
    formStatus.style.color = "red";
    console.error("Σφάλμα αποστολής φόρμας:", error);
  }
});

// Καλούμε τη function για να ξεκινήσει η φόρτωση δεδομένων του ναού
loadChurchData();

// ============================
// Μάθημα 14: Custom Ημερολόγιο (calendar card)
// ============================

// Πίνακες-αντιστοίχισης: η θέση i αντιστοιχεί στο τι επιστρέφει
// το today.getDay() (0-6) ή το today.getMonth() (0-11).
// Τα φτιάχνουμε ΕΜΕΙΣ, αντί να βασιστούμε στο Intl του browser,
// ώστε να ελέγχουμε ακριβώς τη μορφή (π.χ. γενική πτώση "Αυγούστου")
const dayNames = [
  "Κυριακή",
  "Δευτέρα",
  "Τρίτη",
  "Τετάρτη",
  "Πέμπτη",
  "Παρασκευή",
  "Σάββατο",
];
const monthNames = [
  "Ιανουαρίου",
  "Φεβρουαρίου",
  "Μαρτίου",
  "Απριλίου",
  "Μαΐου",
  "Ιουνίου",
  "Ιουλίου",
  "Αυγούστου",
  "Σεπτεμβρίου",
  "Οκτωβρίου",
  "Νοεμβρίου",
  "Δεκεμβρίου",
];

async function loadCalendar() {
  // new Date() χωρίς όρισμα δίνει τη ΣΗΜΕΡΙΝΗ ημερομηνία/ώρα του υπολογιστή
  const today = new Date();

  // .getDay() -> 0 (Κυριακή) έως 6 (Σάββατο). Το χρησιμοποιούμε ως index στο dayNames.
  const dayName = dayNames[today.getDay()];

  // .getDate() -> η ημέρα του μήνα (1-31)
  const dateNum = today.getDate();

  // .getMonth() -> 0 (Ιανουάριος) έως 11 (Δεκέμβριος) -- ΠΡΟΣΟΧΗ, ξεκινάει από το 0!
  const monthName = monthNames[today.getMonth()];

  // .getFullYear() -> το πλήρες έτος, π.χ. 2026
  const year = today.getFullYear();

  // Γεμίζουμε τα στοιχεία της σελίδας -- ίδιο pattern με πριν (.textContent)
  document.getElementById("cal-day-name").textContent = dayName;
  document.getElementById("cal-date-num").textContent = dateNum;
  document.getElementById("cal-month").textContent = monthName;
  document.getElementById("cal-year").textContent = year;

  // Χτίζουμε το κλειδί "MM-DD" ακριβώς στην ίδια μορφή με το saints.json.
  // Το .padStart(2, '0') προσθέτει μηδενικό μπροστά αν χρειάζεται --
  // π.χ. ο μήνας 8 γίνεται "08", όχι "8" -- ΑΛΛΙΩΣ δεν θα ταίριαζε το κλειδί!
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // +1 γιατί το getMonth() είναι 0-based
  const dd = String(dateNum).padStart(2, "0");
  const key = `${mm}-${dd}`;

  const feastElement = document.getElementById("cal-feast");

  try {
    const response = await fetch("data/saints.json");
    if (!response.ok) {
      throw new Error("Δεν βρέθηκε το saints.json");
    }
    const saints = await response.json();

    // ΝΕΑ σύνταξη: saints[key] αντί για saints.key -- λέγεται "bracket notation".
    // Χρειάζεται όταν το "όνομα πεδίου" είναι ΜΕΤΑΒΛΗΤΗ (το key), όχι σταθερό
    // κείμενο -- το saints.key θα έψαχνε κυριολεκτικά για πεδίο ονόματι "key"!
    feastElement.textContent =
      saints[key] || "Δεν υπάρχει καταχωρημένη εορτή για σήμερα";
  } catch (error) {
    feastElement.textContent = "Δεν φορτώθηκε το εορτολόγιο";
    console.error("Σφάλμα φόρτωσης εορτολογίου:", error);
  }
}

// Τώρα που η function ΚΑΙ τα arrays που χρησιμοποιεί έχουν ήδη δηλωθεί
// παραπάνω, μπορούμε να την καλέσουμε με ασφάλεια:
loadCalendar();

// ============================
// Μάθημα 8: Mobile menu (hamburger)
// ============================

// Βρίσκουμε τα δύο στοιχεία που μας χρειάζονται: το κουμπί και το μενού
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");

// Το addEventListener "ακούει" για ένα συγκεκριμένο συμβάν (event) --
// εδώ, 'click' -- και τρέχει τη function που δίνουμε κάθε φορά που συμβαίνει
navToggle.addEventListener("click", function () {
  // Το classList.toggle() είναι έξυπνο: αν η κλάση 'nav-open' ΔΕΝ υπάρχει,
  // την προσθέτει. Αν ΥΠΑΡΧΕΙ ήδη, την αφαιρεί. Ιδανικό για on/off συμπεριφορά.
  navMenu.classList.toggle("nav-open");

  // Ελέγχουμε αν η κλάση υπάρχει ΤΩΡΑ (μετά το toggle), για να ενημερώσουμε
  // σωστά το aria-expanded -- σημαντικό για προσβασιμότητα (screen readers)
  const isOpen = navMenu.classList.contains("nav-open");
  navToggle.setAttribute("aria-expanded", isOpen);
});

// Όταν ο χρήστης κάνει κλικ σε ΟΠΟΙΟΔΗΠΟΤΕ link μέσα στο μενού,
// θέλουμε το μενού να κλείνει αυτόματα (και όχι να μένει ανοιχτό
// ενώ ο χρήστης βλέπει ήδη το section που διάλεξε).

// Το querySelectorAll βρίσκει ΟΛΑ τα στοιχεία που ταιριάζουν με τον
// επιλογέα -- εδώ, όλα τα <a> μέσα στο navMenu. Επιστρέφει μια λίστα.
const navLinks = navMenu.querySelectorAll("a");

// Το forEach τρέχει μια function για ΚΑΘΕ στοιχείο της λίστας --
// παρόμοιο με το .map() που είδαμε, αλλά χωρίς να μας ενδιαφέρει
// κάποιο αποτέλεσμα, απλά θέλουμε να "κάνουμε κάτι" σε καθένα.
navLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    navMenu.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

function renderPoster(data) {
  // --- Επικεφαλίδα ---
  document.getElementById("title1").textContent = data.header.title1;
  document.getElementById("title2").textContent = data.header.title2;
  document.getElementById("subtitle1").textContent = data.header.subtitle1;
  document.getElementById("subtitle2").textContent = data.header.subtitle2;

  // --- Ημέρες ---
  const container = document.getElementById("days-container");
  container.innerHTML = ""; // καθαρισμός πριν το γέμισμα

  data.days.forEach((day) => {
    const dayBlock = document.createElement("section");
    dayBlock.className = "day-block";

    const dateEl = document.createElement("h3");
    dateEl.className = "day-date title-red";
    dateEl.textContent = day.date;
    dayBlock.appendChild(dateEl);

    if (day.feast) {
      const feastEl = document.createElement("h4");
      feastEl.className = "day-feast title-red";
      feastEl.textContent = day.feast;
      dayBlock.appendChild(feastEl);
    }

    day.services.forEach((service) => {
      const group = document.createElement("div");
      group.className = "service-group";

      const timeEl = document.createElement("p");
      timeEl.className = "service-time";
      timeEl.textContent = service.time_label;
      group.appendChild(timeEl);

      const descEl = document.createElement("p");
      descEl.className = "service-desc";
      descEl.textContent = service.description;
      group.appendChild(descEl);

      const locEl = document.createElement("p");
      locEl.className = "service-location";
      locEl.textContent = service.location;
      group.appendChild(locEl);

      dayBlock.appendChild(group);
    });

    container.appendChild(dayBlock);
  });

  // --- Υποσέλιδο ---
  document.getElementById("footer-text").textContent = data.footer;
}

document.addEventListener("DOMContentLoaded", () => {
  fetch("data/data1.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Δεν βρέθηκε το data.json (HTTP " + response.status + ")",
        );
      }
      return response.json();
    })
    .then((data) => renderPoster(data))
    .catch((error) => {
      console.error("Σφάλμα φόρτωσης δεδομένων:", error);
      document.getElementById("days-container").textContent =
        "Σφάλμα: δεν ήταν δυνατή η φόρτωση του προγράμματος.";
    });
});
