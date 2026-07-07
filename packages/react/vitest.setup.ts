import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// RTL renders into document.body; unmount between tests.
afterEach(cleanup);
