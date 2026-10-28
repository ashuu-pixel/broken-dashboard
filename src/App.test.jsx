
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const mockMetrics = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  title: `Metric ${index + 1}`,
  body: `Description ${index + 1}`,
}));

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Metricly dashboard", () => {
  it("renders metric cards when API data loads", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMetrics,
    });

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Metric 1" }))
      .toBeInTheDocument();

    expect(screen.getByText("125")).toBeInTheDocument();
    expect(screen.getByText("1,000")).toBeInTheDocument();
  });

  it("filters metrics by category after form submission", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMetrics,
    });

    render(<App />);

    await screen.findByRole("heading", { name: "Metric 1" });

    await user.selectOptions(screen.getByLabelText("Category"), "Sales");
    await user.click(screen.getByRole("button", { name: "Apply filters" }));

    expect(screen.getByRole("heading", { name: "Metric 2" }))
      .toBeInTheDocument();

    expect(screen.queryByRole("heading", { name: "Metric 1" }))
      .not.toBeInTheDocument();

    expect(screen.getByText("4 results")).toBeInTheDocument();
  });

  it("shows an error message when the API request fails", async () => {
    fetch.mockRejectedValue(new Error("Network failure"));

    render(<App />);

    expect(await screen.findByRole("alert"))
      .toHaveTextContent("Unable to load dashboard data.");

    expect(screen.queryByText("Loading metrics..."))
      .not.toBeInTheDocument();
  });
  
  it("shows an empty state when no metrics match the filters", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMetrics,
    });

    render(<App />);

    await screen.findByRole("heading", { name: "Metric 1" });

    await user.selectOptions(
      screen.getByLabelText("Category"),
      "Sales"
    );

    await user.clear(screen.getByLabelText("Minimum value"));
    await user.type(
      screen.getByLabelText("Minimum value"),
      "999999"
    );

    await user.click(
      screen.getByRole("button", { name: "Apply filters" })
    );
expect(
  screen.getByRole("heading", { name: "No matching metrics" })
).toBeInTheDocument();
  });

  it("resets the filters", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMetrics,
    });

    render(<App />);

    await screen.findByRole("heading", { name: "Metric 1" });

    await user.selectOptions(
      screen.getByLabelText("Category"),
      "Sales"
    );

    await user.click(
      screen.getByRole("button", { name: "Apply filters" })
    );

    expect(screen.getByText("4 results")).toBeInTheDocument();

    await user.click(
  screen.getByRole("button", { name: /Reset filters/ })
);

    expect(screen.getByText("8 results")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toHaveValue("All");
  });

});
