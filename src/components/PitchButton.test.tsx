import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { PitchButton } from "./PitchButton";
import { clearPitchCache } from "@/utils/pitchCache";
import type { FullUserProfile } from "@/types";

const mockProfile: FullUserProfile = {
  user_id: "test-1",
  username: "testcreator",
  fullname: "Test Creator",
  url: "https://instagram.com/testcreator",
  picture: "https://example.com/pic.jpg",
  followers: 500000,
  engagement_rate: 0.045,
  is_verified: true,
  brand_affinity: [{ id: 1, name: "Nike" }],
};

describe("PitchButton", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearPitchCache();
  });

  it("renders generate pitch button and displays generated pitch on click", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ pitch: "This creator has amazing 4.50% engagement and aligns well with Nike." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PitchButton profile={mockProfile} platform="instagram" />);

    const btn = screen.getByText("Generate Dossier Memo");
    expect(btn).toBeDefined();

    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText("This creator has amazing 4.50% engagement and aligns well with Nike.")).toBeDefined();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("uses cached pitch on subsequent clicks without calling API again", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ pitch: "Cached pitch result." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PitchButton profile={mockProfile} platform="instagram" />);

    fireEvent.click(screen.getByText("Generate Dossier Memo"));

    await waitFor(() => {
      expect(screen.getByText("Cached pitch result.")).toBeDefined();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Click again
    fireEvent.click(screen.getByText("Generate Dossier Memo"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows calm inline error message on API error", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PitchButton profile={mockProfile} platform="instagram" />);

    fireEvent.click(screen.getByText("Generate Dossier Memo"));

    await waitFor(() => {
      expect(screen.getByText("Couldn't generate a pitch right now — try again in a moment.")).toBeDefined();
    });
  });
});
