import { auth } from '../config/firebase.js';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';

const provider = new GoogleAuthProvider();

export async function retrySignInPopup() {
  try {
    await signInWithPopup(auth, provider);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export async function retrySignInRedirect() {
  try {
    await signInWithRedirect(auth, provider);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export default function useAuthActions() {
  return { retrySignInPopup, retrySignInRedirect };
}
