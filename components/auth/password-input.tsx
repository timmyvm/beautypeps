"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";

/** Password field with a show/hide toggle and an optional strength meter. */
export function PasswordInput({
  showStrength = false,
  className,
  onChange,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { showStrength?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div>
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          className={cn("pr-12", className)}
          onChange={(e) => {
            setValue(e.target.value);
            onChange?.(e);
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-taupe hover:text-espresso"
        >
          {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
      {showStrength && <StrengthMeter value={value} />}
    </div>
  );
}

const LEVELS = [
  { label: "Too short", tone: "bg-danger" },
  { label: "Weak", tone: "bg-danger" },
  { label: "Fair", tone: "bg-amber" },
  { label: "Good", tone: "bg-sage" },
  { label: "Strong", tone: "bg-sage" },
];

function score(pw: string) {
  if (pw.length < 8) return 0;
  let s = 1;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

function StrengthMeter({ value }: { value: string }) {
  const s = score(value);
  const level = LEVELS[s];
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn("h-1 flex-1 rounded-full transition-colors", value && i <= Math.max(s, 1) ? level.tone : "bg-stone")}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-taupe">
        {value ? `${level.label} · ` : ""}At least 8 characters. Longer, with a mix of cases, numbers and symbols, is
        stronger.
      </p>
    </div>
  );
}
