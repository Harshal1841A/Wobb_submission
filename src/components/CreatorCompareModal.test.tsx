import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CreatorCompareModal } from "./CreatorCompareModal";
import type { ShortlistEntry } from "@/store/shortlistStore";

vi.mock("@/utils/profileLoader", () => ({
  loadProfileByUsername: vi.fn(async (username: string) => {
    if (username === "mrbeast") {
      return {
        data: {
          success: true,
          user_profile: {
            user_id: "101",
            username: "mrbeast",
            fullname: "MrBeast",
            picture: "https://example.com/mb.jpg",
            followers: 330000000,
            engagement_rate: 0.05,
            avg_views: 150000000,
            is_verified: true,
            paid_post_performance: 0.95,
            brand_affinity: [{ id: 1, name: "Feastables" }],
          },
        },
      };
    }
    return {
      data: {
        success: true,
        user_profile: {
          user_id: "102",
          username: "khaby.lame",
          fullname: "Khabane Lame",
          picture: "https://example.com/kl.jpg",
          followers: 163000000,
          engagement_rate: 0.02,
          avg_views: 40000000,
          is_verified: true,
          paid_post_performance: 0.7,
          brand_affinity: [{ id: 2, name: "Hugo Boss" }],
        },
      },
    };
  }),
}));

describe("CreatorCompareModal", () => {
  const mockEntries: ShortlistEntry[] = [
    {
      profile: {
        user_id: "101",
        username: "mrbeast",
        fullname: "MrBeast",
        picture: "https://example.com/mb.jpg",
        url: "",
        is_verified: true,
        followers: 330000000,
      },
      platform: "tiktok",
      addedAt: Date.now(),
    },
    {
      profile: {
        user_id: "102",
        username: "khaby.lame",
        fullname: "Khabane Lame",
        picture: "https://example.com/kl.jpg",
        url: "",
        is_verified: true,
        followers: 163000000,
      },
      platform: "tiktok",
      addedAt: Date.now(),
    },
  ];

  it("renders nothing when open is false", () => {
    render(<CreatorCompareModal open={false} onClose={vi.fn()} entries={mockEntries} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders head-to-head comparison and highlights winners when open", async () => {
    const onClose = vi.fn();
    render(<CreatorCompareModal open={true} onClose={onClose} entries={mockEntries} />);

    expect(screen.getByRole("dialog", { name: "Head-to-Head Creator Comparison" })).toBeInTheDocument();
    expect(screen.getByText("Head-to-Head Arena //")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("@mrbeast")).toBeInTheDocument();
      expect(screen.getByText("@khaby.lame")).toBeInTheDocument();
    });

    // Check that Feastables and Hugo Boss brand affinities rendered
    expect(screen.getByText("Feastables")).toBeInTheDocument();
    expect(screen.getByText("Hugo Boss")).toBeInTheDocument();

    // Check BEST winner tag rendered for highest followers/engagement
    const bestTags = screen.getAllByText("BEST");
    expect(bestTags.length).toBeGreaterThan(0);

    // Close button
    const closeBtn = screen.getByRole("button", { name: "Close comparison modal" });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
