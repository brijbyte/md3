import "@brijbyte/md3-react/tabs.css";
import "./secondary.css";

import { Tab, TabList, TabPanel, Tabs } from "@brijbyte/md3-react/tabs";

export default function SecondaryTabsDemo() {
  return (
    <Tabs defaultValue="overview" className="demo-secondary-tabs">
      <TabList variant="secondary">
        <Tab value="overview">Overview</Tab>
        <Tab value="specs">Specifications</Tab>
        <Tab value="guidelines">Guidelines</Tab>
      </TabList>
      <TabPanel value="overview" className="panel">
        Secondary tabs sit within a content area to separate related content.
      </TabPanel>
      <TabPanel value="specs" className="panel">
        Measurements, states, and design tokens for this component.
      </TabPanel>
      <TabPanel value="guidelines" className="panel">
        Usage guidance: when to prefer secondary over primary tabs.
      </TabPanel>
    </Tabs>
  );
}
