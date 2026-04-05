import { ExternalLink } from "lucide-react";
import { LinkItem } from "@/data/links";

interface LinkCardProps {
  link: LinkItem;
}

const LinkCard = ({ link }: LinkCardProps) => {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="mb-3">
        <span className="inline-block rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {link.category}
        </span>
      </div>

      <h3 className="mb-1.5 text-lg font-semibold text-foreground group-hover:text-foreground/70 transition-colors font-sans">
        {link.title}
      </h3>

      <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
        {link.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {link.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground/60">
        Visit link
        <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </a>
  );
};

export default LinkCard;
