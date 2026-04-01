import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MathText } from "../../../../src/components/math/MathText";

const renderToString =
  vi.fn<(value: string, options: { displayMode: boolean }) => string>();

vi.mock("katex", () => ({
  default: {
    renderToString: (value: string, options: { displayMode: boolean }) =>
      renderToString(value, options),
  },
}));

describe("MathText", () => {
  it("shows the empty placeholder when the value is empty or nullish", () => {
    const { rerender } = render(<MathText value="   " emptyText="vacío" />);
    expect(screen.getByText("vacío")).toBeInTheDocument();

    rerender(<MathText value={null} emptyText="sin contenido" />);
    expect(screen.getByText("sin contenido")).toBeInTheDocument();
  });

  it("renders plain text, inline math and display math tokens", () => {
    renderToString.mockImplementation(
      (value, options) =>
        `<span data-display="${String(options.displayMode)}">${value}</span>`,
    );

    const { container } = render(
      <MathText value={"Texto $x+1$ y $$y^2$$ final"} emptyText="vacío" />,
    );

    expect(container).toHaveTextContent("Texto");
    expect(container.querySelector('[data-display="false"]')).toHaveTextContent(
      "x+1",
    );
    expect(container.querySelector('[data-display="true"]')).toHaveTextContent(
      "y^2",
    );
    expect(renderToString).toHaveBeenCalledWith(
      "x+1",
      expect.objectContaining({ displayMode: false, throwOnError: false }),
    );
    expect(renderToString).toHaveBeenCalledWith(
      "y^2",
      expect.objectContaining({ displayMode: true, throwOnError: false }),
    );
  });

  it("falls back to the raw token when KaTeX rendering throws", () => {
    renderToString.mockImplementation((value, options) => {
      if (value === "boom") {
        throw new Error("render failed");
      }
      return `<span data-display="${String(options.displayMode)}">${value}</span>`;
    });

    render(
      <MathText value={"Previo $ok$ después $boom$ final"} emptyText="vacío" />,
    );

    expect(screen.getByText("$boom$")).toBeInTheDocument();
    expect(document.body).toHaveTextContent("Previo");
  });
});
