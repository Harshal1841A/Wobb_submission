import { beforeEach, describe, expect, it } from "vitest";
import { useShortlistStore } from "@/store/shortlistStore";
import type { UserProfileSummary } from "@/types";

const mockProfile = (id: string): UserProfileSummary => ({
  user_id: id,
  username: `user_${id}`,
  url: `https://instagram.com/user_${id}`,
  picture: "https://example.com/pic.jpg",
  fullname: `User ${id}`,
  is_verified: false,
  followers: 1000,
  engagement_rate: 0.02,
});

beforeEach(() => {
  useShortlistStore.setState({ entries: [] });
  localStorage.clear();
});

describe("useShortlistStore", () => {
  it("adds a profile", () => {
    useShortlistStore.getState().add(mockProfile("1"), "instagram");
    expect(useShortlistStore.getState().entries).toHaveLength(1);
  });

  it("prevents duplicate entries for the same profile + platform", () => {
    const profile = mockProfile("1");
    useShortlistStore.getState().add(profile, "instagram");
    useShortlistStore.getState().add(profile, "instagram");
    expect(useShortlistStore.getState().entries).toHaveLength(1);
  });

  it("allows the same user_id across different platforms", () => {
    const profile = mockProfile("1");
    useShortlistStore.getState().add(profile, "instagram");
    useShortlistStore.getState().add(profile, "youtube");
    expect(useShortlistStore.getState().entries).toHaveLength(2);
  });

  it("removes a profile", () => {
    const profile = mockProfile("1");
    useShortlistStore.getState().add(profile, "instagram");
    useShortlistStore.getState().remove("1", "instagram");
    expect(useShortlistStore.getState().entries).toHaveLength(0);
  });

  it("toggle adds then removes", () => {
    const profile = mockProfile("1");
    useShortlistStore.getState().toggle(profile, "instagram");
    expect(useShortlistStore.getState().has("1", "instagram")).toBe(true);
    useShortlistStore.getState().toggle(profile, "instagram");
    expect(useShortlistStore.getState().has("1", "instagram")).toBe(false);
  });

  it("clears all entries", () => {
    useShortlistStore.getState().add(mockProfile("1"), "instagram");
    useShortlistStore.getState().add(mockProfile("2"), "youtube");
    useShortlistStore.getState().clear();
    expect(useShortlistStore.getState().entries).toHaveLength(0);
  });
});
