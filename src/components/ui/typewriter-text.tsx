import { useEffect, useMemo, useState } from "react";

type TypewriterProps = {
  text: string[];
  speed?: number;
  loop?: boolean;
  className?: string;
  cursorClassName?: string;
};

const deletingSpeedFactor = 0.55;
const pauseDuration = 1400;

export function Typewriter({
  text,
  speed = 100,
  loop = true,
  className = "",
  cursorClassName = "",
}: TypewriterProps) {
  const entries = useMemo(
    () => text.filter((item) => item.trim().length > 0),
    [text],
  );
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (entries.length === 0) {
      return undefined;
    }

    const currentText = entries[phraseIndex] ?? "";
    const reachedEnd = displayedText === currentText;
    const reachedStart = displayedText.length === 0;

    let timeout = speed;

    if (!isDeleting && reachedEnd) {
      if (!loop && phraseIndex === entries.length - 1) {
        return undefined;
      }

      timeout = pauseDuration;
    } else if (isDeleting) {
      timeout = Math.max(30, Math.round(speed * deletingSpeedFactor));
    }

    const timer = window.setTimeout(() => {
      if (!isDeleting && reachedEnd) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && reachedStart) {
        setIsDeleting(false);
        setPhraseIndex((current) => {
          const next = current + 1;

          if (next >= entries.length) {
            return loop ? 0 : current;
          }

          return next;
        });
        return;
      }

      setDisplayedText((current) =>
        isDeleting
          ? current.slice(0, -1)
          : currentText.slice(0, current.length + 1),
      );
    }, timeout);

    return () => window.clearTimeout(timer);
  }, [displayedText, entries, isDeleting, loop, phraseIndex, speed]);

  return (
    <span className={`inline-flex items-baseline ${className}`.trim()}>
      <span>{displayedText}</span>
      <span
        aria-hidden="true"
        className={`ml-1 inline-block h-[0.95em] w-[0.08em] animate-pulse rounded-full bg-current align-middle ${cursorClassName}`.trim()}
      />
    </span>
  );
}
