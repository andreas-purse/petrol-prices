import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FuelTypeFilter } from "@/components/filters/fuel-type-filter";

describe("FuelTypeFilter", () => {
  it("renders all fuel type buttons", () => {
    render(<FuelTypeFilter selected="E10" onChange={() => {}} />);
    expect(screen.getByText("Unleaded (E10)")).toBeInTheDocument();
    expect(screen.getByText("Super Unleaded (E5)")).toBeInTheDocument();
    expect(screen.getByText("Diesel")).toBeInTheDocument();
    expect(screen.getByText("Super Diesel")).toBeInTheDocument();
  });

  it("calls onChange when a fuel type is clicked", () => {
    const onChange = vi.fn();
    const { getByText } = render(<FuelTypeFilter selected="E10" onChange={onChange} />);
    fireEvent.click(getByText("Diesel"));
    expect(onChange).toHaveBeenCalledWith("B7");
  });

  it("marks selected fuel as checked", () => {
    const { getByText } = render(<FuelTypeFilter selected="B7" onChange={() => {}} />);
    const dieselBtn = getByText("Diesel");
    expect(dieselBtn).toHaveAttribute("aria-checked", "true");
  });
});
