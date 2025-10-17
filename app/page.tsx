'use client';

import { useState, type FormEvent } from "react";
import { SendHorizontal } from "lucide-react";

export default function Home() {
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
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
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Send
            <SendHorizontal className="h-4 w-4" aria-hidden />
          </button>
        </form>
      </div>
    </main>
  );
}
