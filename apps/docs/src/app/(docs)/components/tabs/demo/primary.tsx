import "@brijbyte/md3-react/tabs.css";
import "./primary.css";

import { Tab, TabList, TabPanel, Tabs } from "@brijbyte/md3-react/tabs";

export default function PrimaryTabsDemo() {
  return (
    <Tabs defaultValue="flights" className="demo-primary-tabs">
      <TabList>
        <Tab value="flights">Flights</Tab>
        <Tab value="trips">Trips</Tab>
        <Tab value="explore">Explore</Tab>
      </TabList>
      <TabPanel value="flights" className="panel">
        Search hundreds of airlines and compare fares in one place.
      </TabPanel>
      <TabPanel value="trips" className="panel">
        Your upcoming trips, itineraries, and saved bookings.
      </TabPanel>
      <TabPanel value="explore" className="panel">
        Discover destinations based on your interests and budget.
      </TabPanel>
    </Tabs>
  );
}
