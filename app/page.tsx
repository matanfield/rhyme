'use client';

import { useState, type FormEvent } from "react";
import { SendHorizontal } from "lucide-react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [rhyme, setRhyme] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = message.trim();

    if (!trimmed) {
      setError("Please share a phrase so we can find a rhyme.");
      setRhyme(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    fetch("/api/rhyme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: trimmed }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          const detailsValue =
            payload?.details && typeof payload.details === "object"
              ? JSON.stringify(payload.details)
              : payload?.details;
          const detail =
            typeof detailsValue === "string" && detailsValue.length > 0
              ? detailsValue
              : payload?.details?.message ?? null;
          const message =
            payload?.error ?? "Something went wrong fetching a rhyme.";

          throw new Error([message, detail].filter(Boolean).join(" "));
        }

        const payload = (await response.json()) as { rhyme?: string };

        if (!payload.rhyme) {
          throw new Error("The rhyme service responded without a rhyme.");
        }

        setRhyme(payload.rhyme);
        setMessage("");
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "We could not reach the rhyme service. Please try again.",
        );
        setRhyme(null);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 px-4 py-16">
      <div className="w-full max-w-xl space-y-8 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Just Rhyme
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Drop your rhymes below. We&apos;ll handle the rhythm soon enough.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-full border border-input bg-background p-2 shadow-sm"
          aria-describedby={error ? "rhyme-error" : undefined}
        >
          <label htmlFor="rhyme-input" className="sr-only">
            Rhyme text
          </label>
          <input
            id="rhyme-input"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write something worth rhyming..."
            className="flex-1 rounded-full bg-transparent px-4 py-2 text-base outline-none"
            autoComplete="off"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send"}
            <SendHorizontal
              className={`h-4 w-4 transition ${isSubmitting ? "opacity-50" : "opacity-100"}`}
              aria-hidden
            />
          </button>
        </form>

        <div className="space-y-3" aria-live="polite">
          {error ? (
            <p
              id="rhyme-error"
              className="text-sm font-medium text-destructive"
            >
              {error}
            </p>
          ) : null}
          {rhyme ? (
            <div className="rounded-2xl border border-border bg-background/80 p-6 text-left shadow-sm backdrop-blur">
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                Your rhyme
              </p>
              <p className="mt-2 text-2xl font-semibold">{rhyme}</p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
