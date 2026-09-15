"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import RecommendationCard from "@/components/RecommendationCard";
import { getRecommendations, type QuestionnaireAnswers } from "@/lib/recommend";
import type { Audience, CategorySlug, ExperienceLevel, PriceTier, Strength } from "@/data/types";
import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface Question<K extends keyof QuestionnaireAnswers> {
  key: K;
  title: string;
  options: Option<QuestionnaireAnswers[K]>[];
}

const QUESTIONS: [
  Question<"category">,
  Question<"experience">,
  Question<"budget">,
  Question<"audience">,
  Question<"priority">
] = [
  {
    key: "category",
    title: "What are you trying to do?",
    options: [
      { value: "writing" as CategorySlug, label: "Writing" },
      { value: "design" as CategorySlug, label: "Design" },
      { value: "video" as CategorySlug, label: "Video" },
      { value: "coding" as CategorySlug, label: "Coding" },
      { value: "research" as CategorySlug, label: "Research" },
      { value: "marketing" as CategorySlug, label: "Marketing" },
      { value: "productivity" as CategorySlug, label: "Productivity" },
      { value: "business" as CategorySlug, label: "Business" },
    ],
  },
  {
    key: "experience",
    title: "What's your experience level?",
    options: [
      { value: "beginner" as ExperienceLevel, label: "Beginner" },
      { value: "intermediate" as ExperienceLevel, label: "Intermediate" },
      { value: "advanced" as ExperienceLevel, label: "Advanced" },
    ],
  },
  {
    key: "budget",
    title: "What's your budget?",
    options: [
      { value: "free" as PriceTier, label: "Free" },
      { value: "under-500" as PriceTier, label: "Under ₹500/month" },
      { value: "500-1000" as PriceTier, label: "₹500–₹1,000/month" },
      { value: "1000-plus" as PriceTier, label: "₹1,000+/month" },
    ],
  },
  {
    key: "audience",
    title: "Who are you?",
    options: [
      { value: "students" as Audience, label: "Student" },
      { value: "creators" as Audience, label: "Creator" },
      { value: "developers" as Audience, label: "Developer" },
      { value: "freelancers" as Audience, label: "Freelancer" },
      { value: "businesses" as Audience, label: "Business" },
    ],
  },
  {
    key: "priority",
    title: "What matters most?",
    options: [
      { value: "ease-of-use" as Strength, label: "Ease of use" },
      { value: "quality" as Strength, label: "Best quality" },
      { value: "price" as Strength, label: "Lowest price" },
      { value: "features" as Strength, label: "Most features" },
      { value: "speed" as Strength, label: "Speed" },
    ],
  },
];

type Step = "intro" | number | "results";

export default function FindMyToolClient() {
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});

  const recommendations = useMemo(() => {
    if (step !== "results") return [];
    return getRecommendations(answers as QuestionnaireAnswers, 5);
  }, [step, answers]);

  function selectOption<K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) {
    const next = { ...answers, [key]: value };
    setAnswers(next);

    if (typeof step === "number") {
      if (step < QUESTIONS.length - 1) {
        setTimeout(() => setStep(step + 1), 180);
      } else {
        setTimeout(() => setStep("results"), 180);
      }
    }
  }

  function goBack() {
    if (typeof step === "number") {
      if (step === 0) setStep("intro");
      else setStep(step - 1);
    } else if (step === "results") {
      setStep(QUESTIONS.length - 1);
    }
  }

  function restart() {
    setAnswers({});
    setStep("intro");
  }

  if (step === "intro") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          <Sparkles size={13} className="text-accent" />
          Takes about 30 seconds
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Let&apos;s find the right tool for you.
        </h1>
        <p className="mt-3 max-w-md text-muted">
          Answer a few quick questions and we&apos;ll narrow it down.
        </p>
        <button
          type="button"
          onClick={() => setStep(0)}
          className="focus-ring mt-8 inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          Get started
          <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  if (step === "results") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Your best matches
            </h1>
            <p className="mt-1.5 text-muted">
              Ranked using your answers against our tool database — no black box, just fit.
            </p>
          </div>
          <button
            type="button"
            onClick={restart}
            className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border-strong px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-stone-50"
          >
            <RotateCcw size={14} />
            Start over
          </button>
        </div>

        {recommendations.length === 0 ? (
          <p className="mt-10 text-muted">
            We couldn&apos;t find a strong match. Try{" "}
            <Link href="/explore" className="text-accent underline underline-offset-2">
              exploring the full catalog
            </Link>{" "}
            instead.
          </p>
        ) : (
          <div className="mt-8 space-y-5">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={rec.tool.id} recommendation={rec} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const question = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;
  const selectedValue = answers[question.key];

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-stone-100 hover:text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="w-14 shrink-0 text-right text-xs text-muted">
          {step + 1} / {QUESTIONS.length}
        </span>
      </div>

      <h1 className="mt-8 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {question.title}
      </h1>

      <div
        className={cn(
          "mt-8 grid gap-3",
          question.options.length > 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"
        )}
      >
        {question.options.map((option) => {
          const active = selectedValue === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => selectOption(question.key, option.value)}
              aria-pressed={active}
              className={cn(
                "focus-ring rounded-xl border px-4 py-5 text-left text-sm font-medium transition-all",
                active
                  ? "border-accent bg-accent-soft text-accent shadow-sm"
                  : "border-border bg-surface text-foreground hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
