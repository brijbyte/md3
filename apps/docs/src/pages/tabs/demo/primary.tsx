import "./primary.css";

import type * as React from "react";
import { Tab, TabList, TabPanel, Tabs } from "@brijbyte/md3-react/tabs";

const panelStyle: React.CSSProperties = {
  padding: 16,
  color: "var(--md-sys-color-on-surface)",
  font: "var(--md-sys-typescale-body-medium-weight) var(--md-sys-typescale-body-medium-size) / var(--md-sys-typescale-body-medium-line-height) var(--md-sys-typescale-body-medium-font)",
};

export default function PrimaryTabsDemo() {
  return (
    <Tabs defaultValue="flights" style={{ width: "100%", maxWidth: 480 }}>
      <TabList>
        <Tab value="flights">Flights</Tab>
        <Tab value="trips">Trips</Tab>
        <Tab value="explore">Explore</Tab>
      </TabList>
      <TabPanel value="flights" style={panelStyle}>
        Search hundreds of airlines and compare fares in one place.
      </TabPanel>
      <TabPanel value="trips" style={panelStyle}>
        Your upcoming trips, itineraries, and saved bookings.
      </TabPanel>
      <TabPanel value="explore" style={panelStyle}>
        Discover destinations based on your interests and budget.
      </TabPanel>
    </Tabs>
  );
}
