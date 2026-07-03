import "./icons.css";

import ExploreIcon from "@brijbyte/md3-icons/outlined/explore";
import FlightIcon from "@brijbyte/md3-icons/outlined/flight";
import LuggageIcon from "@brijbyte/md3-icons/outlined/luggage";
import { Tab, TabList, Tabs } from "@brijbyte/md3-react/tabs";

export default function TabsWithIconsDemo() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", maxWidth: 480 }}
    >
      {/* Primary: icon stacks above the label (64dp container) */}
      <Tabs defaultValue="flights">
        <TabList aria-label="Travel (primary)">
          <Tab value="flights" icon={<FlightIcon />}>
            Flights
          </Tab>
          <Tab value="trips" icon={<LuggageIcon />}>
            Trips
          </Tab>
          <Tab value="explore" icon={<ExploreIcon />}>
            Explore
          </Tab>
        </TabList>
      </Tabs>
      {/* Secondary: icon sits inline beside the label */}
      <Tabs defaultValue="flights">
        <TabList variant="secondary" aria-label="Travel (secondary)">
          <Tab value="flights" icon={<FlightIcon />}>
            Flights
          </Tab>
          <Tab value="trips" icon={<LuggageIcon />}>
            Trips
          </Tab>
          <Tab value="explore" icon={<ExploreIcon />}>
            Explore
          </Tab>
        </TabList>
      </Tabs>
    </div>
  );
}
