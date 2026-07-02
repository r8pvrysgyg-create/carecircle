import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import { auth } from "./firebase.js";

const provider = new GoogleAuthProvider();

export function setupAuth(onLogin, onLogout) {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userEmail = document.getElementById("userEmail");
  const appContent = document.getElementById("appContent");
  const signedOutMessage = document.getElementById("signedOutMessage");

  loginBtn.onclick = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  };

  logoutBtn.onclick = async () => {
    await signOut(auth);
  };

  onAuthStateChanged(auth, user => {
    if (user) {
      userEmail.textContent = user.email;
      loginBtn.classList.add("hidden");
      logoutBtn.classList.remove("hidden");
      appContent.classList.remove("hidden");
      signedOutMessage.classList.add("hidden");
      onLogin(user);
    } else {
      userEmail.textContent = "";
      loginBtn.classList.remove("hidden");
      logoutBtn.classList.add("hidden");
      appContent.classList.add("hidden");
      signedOutMessage.classList.remove("hidden");
      onLogout();
    }
  });
}
