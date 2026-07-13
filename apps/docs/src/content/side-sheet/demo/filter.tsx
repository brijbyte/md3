"use client";
import "./filter.css";

import { Button } from "@brijbyte/md3-react/button";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import { FilterChip } from "@brijbyte/md3-react/chip";
import {
  SideSheet,
  SideSheetTrigger,
  SideSheetContent,
  SideSheetTitle,
  SideSheetClose,
} from "@brijbyte/md3-react/side-sheet";
import { Typography } from "@brijbyte/md3-react/typography";
import CloseIcon from "@brijbyte/md3-icons/outlined/Close";

const CATEGORIES = ["Furniture", "Lighting", "Decor", "Textiles", "Storage"];
const PRICES = ["Under $50", "$50–$150", "$150+"];

export default function FilterSideSheetDemo() {
  return (
    <SideSheet>
      <SideSheetTrigger render={<Button variant="filled" />}>Filter results</SideSheetTrigger>
      <SideSheetContent className="demo-side-sheet-filter">
        <div className="demo-side-sheet-filter-header">
          <SideSheetTitle render={<Typography variant="title-large" />}>Filters</SideSheetTitle>
          <SideSheetClose render={<IconButton aria-label="Close" variant="standard" />}>
            <CloseIcon />
          </SideSheetClose>
        </div>
        <div className="demo-side-sheet-filter-body">
          <Typography variant="title-medium">Category</Typography>
          <div className="demo-side-sheet-filter-chips">
            {CATEGORIES.map((category, i) => (
              <FilterChip key={category} defaultPressed={i === 0}>
                {category}
              </FilterChip>
            ))}
          </div>
          <Typography variant="title-medium">Price</Typography>
          <div className="demo-side-sheet-filter-chips">
            {PRICES.map((price) => (
              <FilterChip key={price}>{price}</FilterChip>
            ))}
          </div>
        </div>
        <div className="demo-side-sheet-filter-actions">
          <Button variant="text">Reset</Button>
          <SideSheetClose render={<Button variant="filled" />}>Apply</SideSheetClose>
        </div>
      </SideSheetContent>
    </SideSheet>
  );
}
