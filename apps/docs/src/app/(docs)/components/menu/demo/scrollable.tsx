import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/menu.css";
import "./scrollable.css";

import { Button } from "@brijbyte/md3-react/button";
import {
  Menu,
  MenuContent,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@brijbyte/md3-react/menu";
import TextFieldsIcon from "@brijbyte/md3-icons/outlined/TextFields";

const FONTS = [
  "Arial",
  "Calibri",
  "Cambria",
  "Comic Sans MS",
  "Consolas",
  "Courier New",
  "Garamond",
  "Georgia",
  "Helvetica",
  "Impact",
  "Inter",
  "Lato",
  "Merriweather",
  "Montserrat",
  "Open Sans",
  "Playfair Display",
  "Roboto",
  "Roboto Mono",
  "Roboto Slab",
  "Source Sans Pro",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
];

export default function ScrollableMenuDemo() {
  return (
    <div className="demo-menu-scrollable">
      <Menu>
        <MenuTrigger render={<Button variant="outlined" icon={<TextFieldsIcon />} />}>
          Font
        </MenuTrigger>
        <MenuContent className="demo-menu-scrollable-popup">
          <MenuRadioGroup defaultValue="Roboto">
            {FONTS.map((font) => (
              <MenuRadioItem key={font} value={font}>
                {font}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    </div>
  );
}
