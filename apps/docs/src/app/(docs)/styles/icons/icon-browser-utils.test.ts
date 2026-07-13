import { expect, test } from "vitest";
import { iconRefs, matchesToken, searchToken } from "./icon-browser-utils";

test("searchToken lowercases, trims, and keeps only name chars", () => {
  expect(searchToken("  Home ")).toBe("home");
  expect(searchToken("Account_Circle")).toBe("account_circle");
  expect(searchToken("10K")).toBe("10k");
});

test("searchToken drops chars that never appear in icon names", () => {
  expect(searchToken('home"]{}')).toBe("home");
  expect(searchToken("a\\b c")).toBe("abc");
  expect(searchToken("émoji")).toBe("moji");
});

test("matchesToken matches on either the snake name or the lowercased component", () => {
  expect(matchesToken("account_circle", "AccountCircle", "")).toBe(true); // no filter
  expect(matchesToken("account_circle", "AccountCircle", "circle")).toBe(true); // name
  expect(matchesToken("account_circle", "AccountCircle", "accountcircle")).toBe(true); // pascal
  expect(matchesToken("home", "Home", "settings")).toBe(false);
});

test("iconRefs appends Fill only for the filled variant and builds the import", () => {
  expect(iconRefs("home", "Home", "outlined", false)).toEqual({
    name: "home",
    component: "Home",
    path: "@brijbyte/md3-icons/outlined/Home",
    importLine: 'import Home from "@brijbyte/md3-icons/outlined/Home";',
  });
  expect(iconRefs("home", "Home", "rounded", true).component).toBe("HomeFill");
  expect(iconRefs("home", "Home", "rounded", true).path).toBe(
    "@brijbyte/md3-icons/rounded/HomeFill",
  );
  // Digit-leading names carry the Icon prefix through unchanged.
  expect(iconRefs("10k", "Icon10k", "sharp", true).component).toBe("Icon10kFill");
});
