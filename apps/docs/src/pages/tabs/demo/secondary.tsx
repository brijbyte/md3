import "./secondary.css";

import type * as React from "react";
import { Tab, TabList, TabPanel, Tabs } from "@brijbyte/md3-react/tabs";

const panelStyle: React.CSSProperties = {
  padding: 16,
  color: "var(--md-sys-color-on-surface)",
  font: "var(--md-sys-typescale-body-medium-weight) var(--md-sys-typescale-body-medium-size) / var(--md-sys-typescale-body-medium-line-height) var(--md-sys-typescale-body-medium-font)",
};

export default function SecondaryTabsDemo() {
  return (
    <Tabs defaultValue="overview" style={{ width: "100%", maxWidth: 480 }}>
      <TabList variant="secondary">
        <Tab value="overview">Overview</Tab>
        <Tab value="specs">Specifications</Tab>
        <Tab value="guidelines">Guidelines</Tab>
      </TabList>
      <TabPanel value="overview" style={panelStyle}>
        Secondary tabs sit within a content area to separate related content.
      </TabPanel>
      <TabPanel value="specs" style={panelStyle}>
        Measurements, states, and design tokens for this component.
      </TabPanel>
      <TabPanel value="guidelines" style={panelStyle}>
        Usage guidance: when to prefer secondary over primary tabs.
      </TabPanel>
    </Tabs>
  );
}
