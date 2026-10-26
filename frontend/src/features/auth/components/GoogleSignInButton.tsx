"use client";

import { useState } from "react";
import {
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

function GoogleSignInControls() {
  const [message, setMessage] = useState<string | null>(null);

  const handleGoogleSuccess = (_response: CredentialResponse) => {
    setMessage(
      "Google devolvió la credencial, pero el backend aún no la valida; no se inició sesión."
    );
  };

  if (!googleClientId) {
    return (
      <div>
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 opacity-80 cursor-not-allowed shadow-xs"
        >
          <GoogleMark />
          Continuar con Google
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() =>
          setMessage("No se pudo completar la verificación con Google.")
        }
        useOneTap
        text="continue_with"
        shape="pill"
        size="large"
        width="360"
      />
      {message && (
        <p
          className="text-center text-xs text-amber-700 dark:text-amber-300"
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  );
}

export function GoogleSignInButton() {
  if (!googleClientId) {
    return <GoogleSignInControls />;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <GoogleSignInControls />
    </GoogleOAuthProvider>
  );
}

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      width={20}
      height={20}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.9 6.1-15Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
      />
      <path
        fill="#EA4335"
        d="M24 12c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
      />
    </svg>
  );
}
