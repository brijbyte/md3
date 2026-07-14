import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/chip.css";
import "./filter.css";

import { FilterChip } from "@brijbyte/md3-react/chip";
import DirectionsIcon from "@brijbyte/md3-icons/outlined/Directions";

export default function FilterChipsDemo() {
  return (
    <div className="demo-filter-chips">
      <FilterChip defaultPressed>Washer / dryer</FilterChip>
      <FilterChip>Elevator</FilterChip>
      <FilterChip icon={<DirectionsIcon />}>Near transit</FilterChip>
      <FilterChip elevated>Pet friendly</FilterChip>
      <FilterChip disabled>Garage</FilterChip>
      <FilterChip disabled defaultPressed>
        Furnished
      </FilterChip>
    </div>
  );
}
