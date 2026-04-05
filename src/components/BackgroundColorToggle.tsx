import { useEffect, useState } from "react";

type BgTint = "none" | "slate" | "emerald" | "amber" | "rose";

const options: Array<{ value: BgTint; label: string; swatchClass: string }> = [
  {
    value: "none",
    label: "No color",
    swatchClass:
      "bg-[linear-gradient(135deg,hsl(var(--foreground)/0.18)_0%,hsl(var(--foreground)/0.18)_48%,transparent_48%,transparent_52%,hsl(var(--foreground)/0.18)_52%,hsl(var(--foreground)/0.18)_100%)]",
  },
  { value: "slate", label: "Slate", swatchClass: "bg-[hsl(210_55%_78%)] dark:bg-[hsl(215_25%_25%)]" },
  { value: "emerald", label: "Emerald", swatchClass: "bg-[hsl(152_50%_74%)] dark:bg-[hsl(156_30%_24%)]" },
  { value: "amber", label: "Amber", swatchClass: "bg-[hsl(42_85%_74%)] dark:bg-[hsl(35_30%_25%)]" },
  { value: "rose", label: "Rose", swatchClass: "bg-[hsl(345_60%_80%)] dark:bg-[hsl(345_25%_25%)]" },
];

const BackgroundColorToggle = () => {
  const [tint, setTint] = useState<BgTint>(() => {
    if (typeof window === "undefined") return "none";
    const saved = localStorage.getItem("bg-tint") as BgTint | null;
    return saved ?? "none";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-bg", tint);
    localStorage.setItem("bg-tint", tint);
  }, [tint]);

  return (
    <div className="bg-color-toggle-wrapper">
      <div className="bg-color-toggle-panel flex flex-col items-center gap-2 rounded-full border border-border bg-card/80 p-2 backdrop-blur-sm">
        {options.map((option) => {
          const isActive = tint === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setTint(option.value)}
              className={`bg-color-toggle-swatch h-6 w-6 rounded-full border transition-transform hover:scale-110 ${
                isActive ? "border-foreground ring-2 ring-ring ring-offset-1 ring-offset-background" : "border-border"
              } ${option.swatchClass}`}
              aria-label={`Set background tint to ${option.label}`}
              title={option.label}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BackgroundColorToggle;
