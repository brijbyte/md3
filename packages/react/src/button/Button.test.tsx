import { render, screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";
import { expect, test, vi } from "vitest";
import { Button } from "./Button";

test("renders label and default filled variant", () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole("button", { name: "Click me" });
  expect(button).toBeInTheDocument();
  expect(button).toHaveAttribute("data-variant", "filled");
});

test("fires onClick", async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Press</Button>);
  await userEvent.click(screen.getByRole("button", { name: "Press" }));
  expect(onClick).toHaveBeenCalledOnce();
});

test("disabled button is not clickable", async () => {
  const onClick = vi.fn();
  render(
    <Button disabled onClick={onClick}>
      Nope
    </Button>,
  );
  const button = screen.getByRole("button", { name: "Nope" });
  expect(button).toBeDisabled();
  await userEvent.click(button, { force: true });
  expect(onClick).not.toHaveBeenCalled();
});
