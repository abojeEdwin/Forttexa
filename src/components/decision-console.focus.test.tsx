import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DecisionConsole } from "./decision-console";

// Mock dependencies
jest.mock("@/lib/auth/use-auth-session", () => ({
  useAuthSession: () => ({ isOperator: true, loading: false }),
}));

jest.mock("@/lib/scenarios/seed", () => ({
  demoScenarios: [
    {
      id: "test-scenario",
      title: "Test Scenario",
      description: "Test description",
      expectedDecision: "ALLOW",
      action: {
        id: "test-action",
        name: "Test Action",
        domain: "test.com",
        amountXLM: 5,
      },
    },
  ],
}));

describe("DecisionConsole - Focus Management", () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should move focus to step 2 heading when clicking Continue from step 1", async () => {
    const user = userEvent.setup();
    render(<DecisionConsole />);

    // Step 1 should be visible
    const step1Heading = screen.getByRole("heading", { name: /define intent/i });
    expect(step1Heading).toBeInTheDocument();

    // Click Continue button
    const continueButton = screen.getByRole("button", { name: /continue/i });
    await user.click(continueButton);

    // Wait for step 2 to render
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /evaluate/i })).toBeInTheDocument();
    });

    // Check that focus moved to step 2 heading
    const step2Heading = screen.getByRole("heading", { name: /evaluate/i });
    expect(step2Heading).toHaveFocus();
  });

  it("should move focus to step 1 heading when clicking Back from step 2", async () => {
    const user = userEvent.setup();
    render(<DecisionConsole />);

    // Navigate to step 2
    const continueButton = screen.getByRole("button", { name: /continue/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /evaluate/i })).toBeInTheDocument();
    });

    // Click Back button
    const backButton = screen.getByRole("button", { name: /back/i });
    await user.click(backButton);

    // Wait for step 1 to render
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /define intent/i })).toBeInTheDocument();
    });

    // Check that focus moved to step 1 heading
    const step1Heading = screen.getByRole("heading", { name: /define intent/i });
    expect(step1Heading).toHaveFocus();
  });

  it("should NOT move focus during initial page render", () => {
    render(<DecisionConsole />);

    const step1Heading = screen.getByRole("heading", { name: /define intent/i });
    
    // Focus should not be on the heading initially
    expect(step1Heading).not.toHaveFocus();
  });

  it("should make all step headings focusable programmatically with tabIndex=-1", async () => {
    const user = userEvent.setup();
    render(<DecisionConsole />);

    // Check step 1 heading has tabIndex=-1
    const step1Heading = screen.getByRole("heading", { name: /define intent/i });
    expect(step1Heading).toHaveAttribute("tabindex", "-1");

    // Navigate to step 2 and check
    await user.click(screen.getByRole("button", { name: /continue/i }));
    
    await waitFor(() => {
      const step2Heading = screen.getByRole("heading", { name: /evaluate/i });
      expect(step2Heading).toHaveAttribute("tabindex", "-1");
    });
  });

  it("should not move focus when step changes automatically after decision evaluation", async () => {
    const user = userEvent.setup();
    
    // Mock successful decision API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: { decision: "ALLOW" },
        auditEntry: { id: "test-audit-id" },
        usage: { spentXLM: 0.1, toolCalls: 1 },
      }),
    });

    render(<DecisionConsole />);

    // Navigate to step 2
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /evaluate/i })).toBeInTheDocument();
    });

    // Clear the previous focus
    const step2Heading = screen.getByRole("heading", { name: /evaluate/i });
    step2Heading.blur();

    // Click Run evaluation (this will automatically move to step 4 for ALLOW decision)
    const runButton = screen.getByRole("button", { name: /run evaluation/i });
    await user.click(runButton);

    // Wait for step 4 to render (automatic transition)
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /execute payment/i })).toBeInTheDocument();
    });

    // Focus should NOT be on step 4 heading (automatic transition, not user navigation)
    const step4Heading = screen.getByRole("heading", { name: /execute payment/i });
    expect(step4Heading).not.toHaveFocus();
  });
});
