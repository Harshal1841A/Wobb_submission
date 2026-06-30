import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Avatar } from "./Avatar";
import { getInitials } from "../lib/avatarHelpers";

describe("getInitials", () => {
  it("extracts initials from multi-word names", () => {
    expect(getInitials("Cristiano Ronaldo")).toBe("CR");
    expect(getInitials("T-Series")).toBe("TS");
    expect(getInitials("SET India")).toBe("SI");
    expect(getInitials("Vlad and Niki")).toBe("VN");
  });

  it("extracts initials from camelCase or PascalCase single words", () => {
    expect(getInitials("MrBeast")).toBe("MB");
    expect(getInitials("PewDiePie")).toBe("PD");
  });

  it("extracts first two letters from single lowercase word", () => {
    expect(getInitials("cristiano")).toBe("CR");
  });
});

describe("Avatar component", () => {
  it("renders image when src is provided", () => {
    render(<Avatar src="https://example.com/pic.jpg" alt="Test User" name="Test User" />);
    const img = screen.getByRole("img");
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("src", "https://example.com/pic.jpg");
  });

  it("renders initials fallback when image fails to load", () => {
    render(<Avatar src="https://example.com/broken.jpg" alt="Test User" name="Cristiano Ronaldo" />);
    const img = screen.getByRole("img");
    fireEvent.error(img);
    expect(screen.getByText("CR")).toBeInTheDocument();
  });

  it("renders initials fallback immediately when no src is provided", () => {
    render(<Avatar alt="MrBeast avatar" name="MrBeast" />);
    expect(screen.getByText("MB")).toBeInTheDocument();
  });
});
