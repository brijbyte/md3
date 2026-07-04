import "./semantic.css";

import { Typography } from "@brijbyte/md3-react/typography";

// `as` picks the rendered element for semantics/SEO; `variant` picks the style.
// Props (and the ref type) follow the element: `as="a"` accepts `href`.
export default function SemanticDemo() {
  return (
    <article className="demo-typography-semantic">
      <Typography as="h1" variant="headline-large">
        Blog post title
      </Typography>
      <Typography as="span" variant="label-medium" className="demo-typography-semantic-meta">
        March 14 · 6 min read
      </Typography>
      <Typography as="h2" variant="title-medium">
        A section heading
      </Typography>
      <Typography variant="body-medium">
        Body copy rendered as a regular paragraph. Headings above render as real <code>h1</code>/
        <code>h2</code> elements while taking any role from the type scale, and{" "}
        <Typography as="a" variant="body-medium" href="#" className="demo-typography-semantic-link">
          links stay anchors
        </Typography>
        .
      </Typography>
    </article>
  );
}
