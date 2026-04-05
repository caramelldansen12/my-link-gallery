import { links, categories } from "@/data/links";

const SitemapFooter = () => {
  const grouped = categories.map((cat) => ({
    category: cat,
    items: links.filter((l) => l.category === cat),
  }));

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
          {grouped.map(({ category, items }) => (
            <div key={category}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground/70 hover:text-foreground transition-colors"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          Made with ♥ — Replace these links with your own!
        </div>
      </div>
    </footer>
  );
};

export default SitemapFooter;
