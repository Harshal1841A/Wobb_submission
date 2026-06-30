import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GrowthChart } from "@/components/GrowthChart";

describe("GrowthChart", () => {
  it("renders empty state message when data has fewer than 2 points", () => {
    render(<GrowthChart data={[{ month: "2023-01", followers: 100 }]} />);
    expect(screen.getByText("Not enough history to show a trend.")).toBeDefined();
  });

  it("renders chart header and toggle when sufficient data is provided", () => {
    const mockData = [
      { month: "2023-01", followers: 100, avg_likes: 10 },
      { month: "2023-02", followers: 200, avg_likes: 20 },
    ];
    render(<GrowthChart data={mockData} />);
    expect(screen.getByText("Follower Trajectory")).toBeDefined();
    const checkbox = screen.getByLabelText("Compare Avg Likes") as HTMLInputElement;
    expect(checkbox).toBeDefined();
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    const btnRecent = screen.getByText("Last 2mo");
    expect(btnRecent).toBeDefined();
    fireEvent.click(btnRecent);
  });

  it("renders skeleton layout when isLoading is true", () => {
    render(<GrowthChart isLoading={true} />);
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });
});
