import { describe, it, expect } from "vitest";
import { normalizeStation, normalizeStations } from "@/lib/feeds/normalizer";
import sampleFeed from "@/__fixtures__/sample-feed.json";

describe("normalizeStation", () => {
  it("normalizes a valid station with numeric coordinates", () => {
    const result = normalizeStation(sampleFeed.stations[0]);
    expect(result).toEqual({
      siteId: "asda-001",
      brand: "Asda",
      address: "123 High Street, London",
      postcode: "SW1A 1AA",
      latitude: 51.5007,
      longitude: -0.1246,
      prices: { E10: 138.9, E5: 145.9, B7: 157.9, SDV: 162.9 },
    });
  });

  it("handles string coordinates and string prices", () => {
    const result = normalizeStation(sampleFeed.stations[1]);
    expect(result).not.toBeNull();
    expect(result!.latitude).toBe(53.4808);
    expect(result!.longitude).toBe(-2.2426);
    expect(result!.prices.E10).toBe(141.5);
    expect(result!.prices.E5).toBe(148.9);
  });

  it("handles null prices by omitting them", () => {
    const result = normalizeStation(sampleFeed.stations[2]);
    expect(result).not.toBeNull();
    expect(result!.prices).toEqual({ E10: 140.2, B7: 158.5, SDV: 163.2 });
    expect(result!.prices.E5).toBeUndefined();
  });

  it("normalizes brand casing", () => {
    const result = normalizeStation(sampleFeed.stations[2]);
    expect(result!.brand).toBe("SHELL");
  });

  it("rejects stations outside UK bounds", () => {
    const result = normalizeStation(sampleFeed.stations[3]);
    expect(result).toBeNull();
  });

  it("rejects stations with no valid prices", () => {
    const result = normalizeStation(sampleFeed.stations[4]);
    expect(result).toBeNull();
  });

  it("rejects completely invalid input", () => {
    expect(normalizeStation(null)).toBeNull();
    expect(normalizeStation(undefined)).toBeNull();
    expect(normalizeStation({})).toBeNull();
    expect(normalizeStation("not a station")).toBeNull();
  });

  it("rejects negative prices", () => {
    const station = {
      site_id: "test",
      brand: "Test",
      address: "Test",
      postcode: "XX1 1XX",
      location: { latitude: 52.0, longitude: -1.0 },
      prices: { E10: -5.0 },
    };
    expect(normalizeStation(station)).toBeNull();
  });

  it("rejects absurdly high prices", () => {
    const station = {
      site_id: "test",
      brand: "Test",
      address: "Test",
      postcode: "XX1 1XX",
      location: { latitude: 52.0, longitude: -1.0 },
      prices: { E10: 1500 },
    };
    expect(normalizeStation(station)).toBeNull();
  });
});

describe("normalizeStations", () => {
  it("filters out invalid stations from a feed", () => {
    const results = normalizeStations(sampleFeed.stations);
    // Should include the first 3 (valid UK coords + prices) and exclude last 2
    expect(results).toHaveLength(3);
    expect(results.map((s) => s.siteId)).toEqual(["asda-001", "bp-002", "shell-003"]);
  });

  it("handles empty array", () => {
    expect(normalizeStations([])).toEqual([]);
  });
});
