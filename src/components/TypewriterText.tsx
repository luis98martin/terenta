import React, { useEffect, useMemo, useRef, useState } from "react";

interface TypewriterTextProps {
  words: string[];
  typingSpeed?: number; // ms per char
  deleteSpeed?: number; // ms per char
  pauseMs?: number; // ms pause after finishing a word
  className?: string;
  showCursor?: boolean;
}

// A11y: cursor is decorative; we render it with aria-hidden
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  words,
  typingSpeed = 120,
  deleteSpeed = 80,
  pauseMs = 1200,
  className,
  showCursor = true,
}) => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  const currentWord = words[index % words.length] || "";

  // Blink cursor
  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 450);
    return () => clearInterval(id);
  }, []);

  // Typing/deleting loop
  useEffect(() => {
    let timer: number | undefined;

    if (!deleting && text.length < currentWord.length) {
      timer = window.setTimeout(() => setText(currentWord.slice(0, text.length + 1)), typingSpeed);
    } else if (!deleting && text.length === currentWord.length) {
      timer = window.setTimeout(() => setDeleting(true), pauseMs);
    } else if (deleting && text.length > 0) {
      timer = window.setTimeout(() => setText(currentWord.slice(0, text.length - 1)), deleteSpeed);
    } else if (deleting && text.length === 0) {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
    }

    return () => timer && window.clearTimeout(timer);
  }, [text, deleting, currentWord, typingSpeed, deleteSpeed, pauseMs, words.length]);

  // Reserve width for the longest word to prevent layout shift
  const longestWord = useMemo(
    () => words.reduce((a, b) => (a.length >= b.length ? a : b), ""),
    [words]
  );
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const [minWidth, setMinWidth] = useState<number>(0);
  useEffect(() => {
    if (measureRef.current) {
      setMinWidth(measureRef.current.offsetWidth);
    }
  }, [longestWord]);

  return (
    <span className={`relative inline-flex items-baseline ${className || ""}`}>
      {/* Off-screen measurer to prevent layout shift */}
      <span
        ref={measureRef}
        className={`${className || ""} absolute invisible -z-10 whitespace-nowrap`}
        aria-hidden
      >
        {longestWord}
      </span>

      <span style={{ minWidth }} className="whitespace-nowrap inline-block">
        {text}
      </span>
      {showCursor && (
        <span aria-hidden className="ml-1 select-none" style={{ opacity: cursorVisible ? 1 : 0 }}>
          |
        </span>
      )}
    </span>
  );
};

export default TypewriterText;
