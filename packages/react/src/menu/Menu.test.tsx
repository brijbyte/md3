import { DirectionProvider } from "@base-ui/react/direction-provider";
import { render, waitFor } from "@testing-library/react";
import { userEvent } from "@vitest/browser/context";
import { expect, test } from "vitest";
// Resolves --md-sys-shape-* so corner-radius assertions see real values.
import "../generated/tokens.css";
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
  type MenuContentProps,
} from "./Menu";

async function openMenu(contentProps: Partial<MenuContentProps> = {}) {
  const { getByRole } = render(
    <Menu>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent {...contentProps}>
        <MenuItem>Item 1</MenuItem>
        <MenuItem>Item 2</MenuItem>
      </MenuContent>
    </Menu>,
  );
  await userEvent.click(getByRole("button"));
  return await waitFor(() => {
    const popup = document.querySelector('[role="menu"]');
    expect(popup).not.toBeNull();
    return popup as HTMLElement;
  });
}

const itemHeight = (popup: HTMLElement) =>
  getComputedStyle(popup.querySelector('[role="menuitem"]')!).minHeight;

test("items are 48px tall at default density", async () => {
  const popup = await openMenu();
  expect(popup.hasAttribute("data-density")).toBe(false);
  expect(itemHeight(popup)).toBe("48px");
});

// m3 density guidance: each step from 0 to -3 removes 4px of item height.
test("density steps tighten item height by 4px each", async () => {
  const popup = await openMenu({ density: -3 });
  expect(popup.getAttribute("data-density")).toBe("-3");
  expect(itemHeight(popup)).toBe("36px");
});

test("density 0 renders no data-density attribute", async () => {
  const popup = await openMenu({ density: 0 });
  expect(popup.hasAttribute("data-density")).toBe(false);
});

async function openSegmentedMenu(contentProps: Partial<MenuContentProps> = {}) {
  const { getByRole } = render(
    <Menu>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent variant="segmented" {...contentProps}>
        <MenuGroup>
          <MenuRadioGroup defaultValue="two">
            <MenuRadioItem value="one">Item 1</MenuRadioItem>
            <MenuRadioItem value="two">Item 2</MenuRadioItem>
            <MenuRadioItem value="three">Item 3</MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>
        <MenuGroup>
          <MenuItem>Item 4</MenuItem>
          <MenuItem>Item 5</MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>,
  );
  await userEvent.click(getByRole("button"));
  return await waitFor(() => {
    const popup = document.querySelector('[role="menu"]');
    expect(popup).not.toBeNull();
    return popup as HTMLElement;
  });
}

// Segmented anatomy: transparent flex popup with a 2px gap between group cards,
// 44px items (Compose SegmentedMenuTokens.Item).
test("segmented variant lays groups out as gap-separated containers", async () => {
  const popup = await openSegmentedMenu();
  expect(popup.getAttribute("data-variant")).toBe("segmented");
  const popupStyle = getComputedStyle(popup);
  expect(popupStyle.display).toBe("flex");
  expect(popupStyle.rowGap).toBe("2px");
  const group = popup.querySelector('[role="group"]')!;
  expect(getComputedStyle(group).padding).toBe("4px");
  expect(itemHeight(popup)).toBe("44px");
});

test("density stacks on the segmented item height", async () => {
  const popup = await openSegmentedMenu({ density: -1 });
  expect(itemHeight(popup)).toBe("40px");
});

// Item corners must nest concentrically inside the group corners: medium (12px)
// only against the stack's large (16px) outer corners — first group's top, last
// group's bottom — and extra-small (4px) against every small (8px) corner.
test("segmented item corners stay concentric with their group corners", async () => {
  const popup = await openSegmentedMenu();
  const items = Array.from(popup.querySelectorAll('[role="menuitem"], [role="menuitemradio"]'));
  const [first, , lastOfFirstGroup, firstOfLastGroup] = items;
  // Top of the stack (inside the first group, via the RadioGroup wrapper).
  expect(getComputedStyle(first).borderStartStartRadius).toBe("12px");
  // First group's bottom corner is small → its last item stays extra-small.
  expect(getComputedStyle(lastOfFirstGroup).borderEndEndRadius).toBe("4px");
  // Last group's TOP corner is small → its first item must not round up.
  expect(getComputedStyle(firstOfLastGroup).borderStartStartRadius).toBe("4px");
  // Bottom of the stack.
  expect(getComputedStyle(items[items.length - 1]).borderEndEndRadius).toBe("12px");
});

// Mixed menus: rows without a leading icon reserve its box (12+24+12) so all
// labels align; menus with no icons at all keep the plain 12px inset.
test("icon-less items align with iconed siblings", async () => {
  const { getByRole } = render(
    <Menu>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem>Document</MenuItem>
        <MenuItem leadingIcon={<svg viewBox="0 0 24 24" />}>Share</MenuItem>
      </MenuContent>
    </Menu>,
  );
  await userEvent.click(getByRole("button"));
  const popup = await waitFor(() => {
    const el = document.querySelector('[role="menu"]');
    expect(el).not.toBeNull();
    return el as HTMLElement;
  });
  const [plain, iconed] = Array.from(popup.querySelectorAll('[role="menuitem"]'));
  expect(getComputedStyle(plain).paddingInlineStart).toBe("48px");
  expect(getComputedStyle(iconed).paddingInlineStart).toBe("12px");
});

test("no icon box is reserved when no item has a leading icon", async () => {
  const popup = await openMenu();
  const item = popup.querySelector('[role="menuitem"]')!;
  expect(getComputedStyle(item).paddingInlineStart).toBe("12px");
});

// Regression: the popup portals to document.body, outside a scoped
// DirectionProvider's DOM — without the stamped dir it rendered LTR in RTL apps.
test("popup follows a scoped DirectionProvider's rtl direction", async () => {
  const { getByRole } = render(
    <DirectionProvider direction="rtl">
      <Menu>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent>
          <MenuItem>Item 1</MenuItem>
        </MenuContent>
      </Menu>
    </DirectionProvider>,
  );
  await userEvent.click(getByRole("button"));
  const popup = await waitFor(() => {
    const el = document.querySelector('[role="menu"]');
    expect(el).not.toBeNull();
    return el as HTMLElement;
  });
  expect(getComputedStyle(popup).direction).toBe("rtl");
});
