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
      className="hover-chroma-border group block rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <h3 className="mb-1 text-base font-semibold text-foreground transition-colors group-hover:text-foreground/70 font-sans">
        {link.title}
      </h3>

      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
        {link.description}
      </p>

      <div className="mb-0.5 flex flex-wrap gap-1.5">
        {link.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
};

export default LinkCard;
