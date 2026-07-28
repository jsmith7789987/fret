"use client";

import { useEffect, useRef, useState } from "react";

// Minimal typings for the Web Speech API (not in standard lib.dom).
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number } & Record<number, SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
}

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    (
      window as unknown as {
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      }
    ).webkitSpeechRecognition ??
    (
      window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionLike;
      }
    ).SpeechRecognition;
  if (!Ctor) return null;
  try {
    return new Ctor();
  } catch {
    return null;
  }
}

export function VoiceInput({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseRef = useRef("");

  useEffect(() => {
    const rec = getRecognition();
    setSupported(Boolean(rec));
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  function start() {
    try {
      const rec = getRecognition();
      if (!rec) {
        setSupported(false);
        return;
      }
      recognitionRef.current = rec;
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      baseRef.current = value ? value.trim() + " " : "";

      rec.onresult = (e) => {
        let transcript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        onChange((baseRef.current + transcript).trim());
      };
      rec.onerror = () => setRecording(false);
      rec.onend = () => setRecording(false);

      rec.start();
      setRecording(true);
    } catch {
      // Clean fallback to text-only input.
      setSupported(false);
      setRecording(false);
    }
  }

  function stop() {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setRecording(false);
  }

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={4}
          className="w-full resize-none rounded-card border-[0.5px] border-hairline bg-white px-4 py-3 pr-12 text-[15px] text-ink placeholder:text-muted/60 focus:border-ink"
        />
        {supported && (
          <button
            type="button"
            onClick={recording ? stop : start}
            aria-label={recording ? "Stop recording" : "Start voice input"}
            className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
              recording
                ? "border-amber-border bg-amber-bg"
                : "border-hairline bg-white hover:border-ink"
            }`}
          >
            {recording ? (
              <span className="h-2.5 w-2.5 rounded-full bg-amber animate-pulseDot" />
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-muted"
                aria-hidden
              >
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="17" x2="12" y2="22" />
              </svg>
            )}
          </button>
        )}
      </div>
      {supported ? (
        <p className="mt-2 text-[12px] text-muted">
          {recording
            ? "Listening… tap the dot to stop."
            : "Type, or tap the mic to speak."}
        </p>
      ) : (
        <p className="mt-2 text-[12px] text-muted">Type your answer.</p>
      )}
    </div>
  );
}
