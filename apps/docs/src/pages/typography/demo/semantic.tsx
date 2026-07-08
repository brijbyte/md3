import "./semantic.css";

import { Typography } from "@brijbyte/md3-react/typography";

// Each variant already defaults to a semantic element (headline-large → h1, label-medium
// → span, …); `as` only needs to override that default, e.g. for SEO or a real form label.
// Props (and the ref type) follow the element: `as="a"` accepts `href`.
export default function SemanticDemo() {
  return (
    <article className="demo-typography-semantic">
      <Typography variant="headline-large">Blog post title</Typography>
      <Typography variant="label-medium" className="demo-typography-semantic-meta">
        March 14 · 6 min read
      </Typography>
      <Typography variant="title-medium">A section heading</Typography>
      <Typography variant="body-large">
        Body copy rendered as a regular paragraph. Headings above render as real <code>h1</code>/
        <code>h3</code> elements by default from their variant, and{" "}
        <Typography as="a" variant="body-large" href="#" className="demo-typography-semantic-link">
          links stay anchors
        </Typography>
        .
      </Typography>
      <Typography as="label" variant="label-medium">
        Captioning a form field? Pass <code>as="label"</code> explicitly.
      </Typography>
    </article>
  );
}
