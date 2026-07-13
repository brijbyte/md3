import "./editor.css";

import { Button } from "@brijbyte/md3-react/button";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuTrigger,
  MenuTrigger,
} from "@brijbyte/md3-react/menu";
import FormatAlignLeftIcon from "@brijbyte/md3-icons/outlined/FormatAlignLeft";
import FormatClearIcon from "@brijbyte/md3-icons/outlined/FormatClear";
import FormatLineSpacingIcon from "@brijbyte/md3-icons/outlined/FormatLineSpacing";
import FormatListNumberedIcon from "@brijbyte/md3-icons/outlined/FormatListNumbered";
import FormatParagraphIcon from "@brijbyte/md3-icons/outlined/FormatParagraph";
import StrikethroughSIcon from "@brijbyte/md3-icons/outlined/StrikethroughS";
import SubscriptIcon from "@brijbyte/md3-icons/outlined/Subscript";
import SuperscriptIcon from "@brijbyte/md3-icons/outlined/Superscript";

export default function EditorMenuDemo() {
  return (
    <div className="demo-menu-editor">
      <Menu>
        <MenuTrigger render={<Button variant="tonal" />}>Format</MenuTrigger>
        <MenuContent>
          <MenuItem leadingIcon={<StrikethroughSIcon />} trailingText="⌘+Shift+X">
            Strikethrough
          </MenuItem>
          <MenuItem leadingIcon={<SuperscriptIcon />} trailingText="⌘.">
            Superscript
          </MenuItem>
          <MenuItem leadingIcon={<SubscriptIcon />} trailingText="⌘,">
            Subscript
          </MenuItem>
          <MenuSeparator />
          <MenuSubmenu>
            <MenuSubmenuTrigger leadingIcon={<FormatParagraphIcon />}>
              Paragraph styles
            </MenuSubmenuTrigger>
            <MenuContent>
              <MenuItem>Normal text</MenuItem>
              <MenuItem>Title</MenuItem>
              <MenuItem>Subtitle</MenuItem>
              <MenuItem>Heading 1</MenuItem>
              <MenuItem>Heading 2</MenuItem>
            </MenuContent>
          </MenuSubmenu>
          <MenuSubmenu>
            <MenuSubmenuTrigger leadingIcon={<FormatAlignLeftIcon />}>Align</MenuSubmenuTrigger>
            <MenuContent>
              <MenuRadioGroup defaultValue="left">
                <MenuRadioItem value="left">Left</MenuRadioItem>
                <MenuRadioItem value="center">Center</MenuRadioItem>
                <MenuRadioItem value="right">Right</MenuRadioItem>
              </MenuRadioGroup>
            </MenuContent>
          </MenuSubmenu>
          <MenuSubmenu>
            <MenuSubmenuTrigger leadingIcon={<FormatLineSpacingIcon />}>
              Line spacing
            </MenuSubmenuTrigger>
            <MenuContent>
              <MenuRadioGroup defaultValue="custom">
                <MenuRadioItem value="single">Single</MenuRadioItem>
                <MenuRadioItem value="1.15">1.15</MenuRadioItem>
                <MenuRadioItem value="double">Double</MenuRadioItem>
                <MenuRadioItem value="custom">Custom: 1.2</MenuRadioItem>
              </MenuRadioGroup>
              <MenuSeparator />
              <MenuItem>Add space before paragraph</MenuItem>
              <MenuItem>Add space after paragraph</MenuItem>
              <MenuSeparator />
              <MenuItem trailingText="⌘/">Custom spacing…</MenuItem>
            </MenuContent>
          </MenuSubmenu>
          <MenuItem leadingIcon={<FormatListNumberedIcon />}>Numbered lists</MenuItem>
          <MenuSeparator />
          <MenuItem leadingIcon={<FormatClearIcon />} trailingText="⌘/">
            Clear formatting
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}
