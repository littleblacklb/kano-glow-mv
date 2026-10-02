import { isValidElement } from "react";
import { describe, expect, test } from "vitest";
import { Sky } from "./Backdrop";

// Inspect this pure component's rendered element tree without a browser or extra renderer types.
const elements = (node: unknown): Array<{ type: unknown; props: Record<string, unknown> }> => {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  return [{ type: node.type, props: node.props }, ...elements(node.props.children)];
};
const skyElements = (t: number, handCloseUp = false) => elements(Sky({ t, handCloseUp }));
const hasClouds = (t: number, handCloseUp = false) =>
  skyElements(t, handCloseUp).some((el) => el.props.id === "dusk-cloud-edge");

describe("residual dusk framing", () => {
  test("uses broken cloud silhouettes in the wide shot", () => {
    expect(hasClouds(201)).toBe(true);
    expect(skyElements(201).filter((el) => el.type === "path")).toHaveLength(3);
  });

  test("never draws a second horizon strip behind the close-up", () => {
    for (const t of [203.4, 203.9, 206, 211, 214.2]) {
      expect(hasClouds(t, true)).toBe(false);
    }
  });

  test("removes the clouds outside the approved dusk window", () => {
    for (const t of [160, 172, 214.2, 226]) {
      expect(hasClouds(t)).toBe(false);
    }
  });
});
