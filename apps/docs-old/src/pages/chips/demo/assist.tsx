import "./assist.css";

import { AssistChip } from "@brijbyte/md3-react/chip";
import CalendarTodayIcon from "@brijbyte/md3-icons/outlined/CalendarToday";
import DirectionsIcon from "@brijbyte/md3-icons/outlined/Directions";
import LocalTaxiIcon from "@brijbyte/md3-icons/outlined/LocalTaxi";

export default function AssistChipsDemo() {
  return (
    <div className="demo-assist-chips">
      <AssistChip icon={<CalendarTodayIcon />}>Set reminder</AssistChip>
      <AssistChip icon={<DirectionsIcon />}>Get directions</AssistChip>
      <AssistChip icon={<LocalTaxiIcon />} elevated>
        Book a ride
      </AssistChip>
      <AssistChip icon={<CalendarTodayIcon />} disabled>
        Unavailable
      </AssistChip>
    </div>
  );
}
