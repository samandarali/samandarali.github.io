// ds-progress.js

import { initializeApp, getApps } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "sqllearner-431e3.firebaseapp.com",
  projectId: "sqllearner-431e3",
  storageBucket: "sqllearner-431e3.firebasestorage.app",
  messagingSenderId: "325278422631",
  appId: "1:325278422631:web:db1726ad6108428d5926c2"
};


// Prevent Firebase from being initialized twice.
const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const progressCache = new Map();

let currentTopic = null;


// Create a safe Firestore document ID.
function createProgressId(pageId, topicId) {
  return `${pageId}__${topicId}`
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-");
}


// Expose auth state for the page.
window.dsAuth = auth;


// Load all Data Science progress for the signed-in user.
async function loadProgress(userId) {
  progressCache.clear();

  const progressRef = collection(
    db,
    "users",
    userId,
    "dsProgress"
  );

  const snapshot = await getDocs(progressRef);

  snapshot.forEach((documentSnapshot) => {
    const progress = documentSnapshot.data();

    progressCache.set(
      progress.progressId,
      progress.status
    );
  });

  applyAllProgress();
}


// Save a selected status.
async function saveProgress(pageId, topicId, topicName, status) {
  const user = auth.currentUser;

  if (!user) {
    showLoginMessage();
    return;
  }

  const progressId = createProgressId(pageId, topicId);

  const progressRef = doc(
    db,
    "users",
    user.uid,
    "dsProgress",
    progressId
  );

  await setDoc(progressRef, {
    progressId,
    pageId,
    topicId,
    topicName,
    status,
    updatedAt: serverTimestamp()
  });

  progressCache.set(progressId, status);

  applyTopicStatus(pageId, topicId, status);
}


// Apply a status class to one topic.
function applyTopicStatus(pageId, topicId, status) {
  const selector =
    `[data-progress-page="${CSS.escape(pageId)}"]` +
    `[data-progress-topic="${CSS.escape(topicId)}"]`;

  document.querySelectorAll(selector).forEach((element) => {
    element.classList.remove(
      "status-know",
      "status-practice",
      "status-dontknow"
    );

    if (status) {
      element.classList.add(`status-${status}`);
    }

    const label = element.querySelector(".knowledge-label");

    if (label) {
      const labels = {
        know: "I know this",
        practice: "Need practice",
        dontknow: "Not learned yet"
      };

      label.textContent = labels[status] || "Set knowledge level";
    }
  });
}


// Apply saved progress after cards are rendered.
function applyAllProgress() {
  document
    .querySelectorAll("[data-progress-page][data-progress-topic]")
    .forEach((element) => {
      const pageId = element.dataset.progressPage;
      const topicId = element.dataset.progressTopic;
      const progressId = createProgressId(pageId, topicId);

      applyTopicStatus(
        pageId,
        topicId,
        progressCache.get(progressId)
      );
    });
}


// Called when the user clicks a knowledge button.
window.openKnowledgePopup = function (
  pageId,
  topicId,
  topicName,
  event
) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  currentTopic = {
    pageId,
    topicId,
    topicName
  };

  const popup = document.getElementById("knowledge-popup");
  const topicLabel = document.getElementById("knowledge-topic-name");

  if (!popup || !topicLabel) {
    console.error("Knowledge popup HTML is missing.");
    return;
  }

  topicLabel.textContent = topicName;
  popup.classList.add("open");

  const loginMessage =
    document.getElementById("knowledge-login-message");

  const statusButtons =
    document.getElementById("knowledge-status-buttons");

  if (auth.currentUser) {
    loginMessage.style.display = "none";
    statusButtons.style.display = "flex";
  } else {
    loginMessage.style.display = "block";
    statusButtons.style.display = "none";
  }
};


window.closeKnowledgePopup = function () {
  const popup = document.getElementById("knowledge-popup");

  if (popup) {
    popup.classList.remove("open");
  }

  currentTopic = null;
};


window.selectKnowledgeStatus = async function (status) {
  if (!currentTopic) return;

  try {
    await saveProgress(
      currentTopic.pageId,
      currentTopic.topicId,
      currentTopic.topicName,
      status
    );

    closeKnowledgePopup();
  } catch (error) {
    console.error("Could not save progress:", error);
    alert("Your progress could not be saved.");
  }
};


function showLoginMessage() {
  const loginMessage =
    document.getElementById("knowledge-login-message");

  const statusButtons =
    document.getElementById("knowledge-status-buttons");

  if (loginMessage) loginMessage.style.display = "block";
  if (statusButtons) statusButtons.style.display = "none";
}


// Make this available after dynamically rendering cards.
window.refreshKnowledgeProgress = applyAllProgress;


// React whenever login status changes.
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await loadProgress(user.uid);
  } else {
    progressCache.clear();

    document
      .querySelectorAll("[data-progress-page][data-progress-topic]")
      .forEach((element) => {
        element.classList.remove(
          "status-know",
          "status-practice",
          "status-dontknow"
        );

        const label =
          element.querySelector(".knowledge-label");

        if (label) {
          label.textContent = "Set knowledge level";
        }
      });
  }
});
