"use client";

import { useState, type FormEvent } from "react";
import { MessageCircleQuestion, Send } from "lucide-react";
import { answerCommonComparisonQuestion, type QuestionAnswer } from "@/lib/answerQuestion";
import type { ParsedNeed } from "@/lib/needSignals";
import type { Tool } from "@/data/types";

export default function AskAboutNeeds({ tools, parsedNeed }: { tools: Tool[]; parsedNeed?: ParsedNeed | null }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<QuestionAnswer | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;
    setAnswer(answerCommonComparisonQuestion(trimmed, tools, parsedNeed));
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <MessageCircleQuestion size={16} className="text-accent" />
        Is there anything specific you want to know?
      </h3>
      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={parsedNeed ? "e.g. Why did you recommend this?" : "e.g. What will I miss if I choose CapCut?"}
          className="focus-ring min-w-0 flex-1 rounded-full border border-border-strong bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted"
        />
        <button
          type="submit"
          className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-accent-hover"
          aria-label="Ask"
        >
          <Send size={15} />
        </button>
      </form>

      {answer && (
        <div className="mt-4 rounded-xl border border-border bg-stone-50/60 p-4">
          <p className="text-sm font-semibold text-foreground">{answer.title}</p>
          {answer.matched ? (
            <ul className="mt-2 space-y-1.5">
              {answer.rows.map((row) => (
                <li key={row.tool.id} className="text-sm text-foreground/80">
                  <span className="font-medium text-foreground">{row.tool.name}:</span> {row.value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-sm text-muted">{answer.note}</p>
          )}
        </div>
      )}
    </div>
  );
}
