import "./SkipLink.css";

import { Typography } from "@/ui/typography";

// Google-search-style skip link: visually hidden off-screen until it
// receives focus (first tab stop), then jumps to #main-content.
export function SkipLink() {
  return (
    <Typography as="a" variant="label-large" href="#main-content" className="docs-skip-link">
      Skip to main content
    </Typography>
  );
}
