import "./suggestion.css";

import { SuggestionChip } from "@brijbyte/md3-react/chip";

export default function SuggestionChipsDemo() {
  return (
    <div className="demo-suggestion-chips">
      <SuggestionChip>Sounds good</SuggestionChip>
      <SuggestionChip>Send address</SuggestionChip>
      <SuggestionChip elevated>Running late</SuggestionChip>
    </div>
  );
}
