import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "./app-shell";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock auth session
jest.mock("@/lib/auth/use-auth-session", () => ({
  useAuthSession: () => ({
    wallet: "GTEST123",
    role: "operator",
    loading: false,
  }),
}));

// Mock background component
jest.mock("@/components/app-workspace-background", () => ({
  AppWorkspaceBackground: () => <div data-testid="background" />,
}));

describe("AppShell - Skip Link", () => {
  it("should render skip link with correct text", () => {
    render(
      <AppShell>
        <div>Test content</div>
      </AppShell>
    );

    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("should have skip link with proper z-index to appear above all content", () => {
    render(
      <AppShell>
        <div>Test content</div>
      </AppShell>
    );

    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toHaveClass("z-[9999]");
  });

  it("should be visually hidden by default (positioned off-screen)", () => {
    render(
      <AppShell>
        <div>Test content</div>
      </AppShell>
    );

    const skipLink = screen.getByText("Skip to main content");
    // Check that it has the translate class that moves it off-screen
    expect(skipLink).toHaveClass("-translate-y-32");
  });

  it("should become visible when focused", () => {
    render(
      <AppShell>
        <div>Test content</div>
      </AppShell>
    );

    const skipLink = screen.getByText("Skip to main content");
    
    // Check it has focus-visible styles
    expect(skipLink).toHaveClass("focus:translate-y-0");
  });

  it("should target main content area with correct id", () => {
    render(
      <AppShell>
        <div>Test content</div>
      </AppShell>
    );

    const mainContent = screen.getByRole("main");
    expect(mainContent).toHaveAttribute("id", "main-content");
  });

  it("should have main element with proper ARIA role", () => {
    render(
      <AppShell>
        <div>Test content</div>
      </AppShell>
    );

    const mainContent = screen.getByRole("main");
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveAttribute("role", "main");
  });

  it("should make main content focusable with tabIndex=-1", () => {
    render(
      <AppShell>
        <div>Test content</div>
      </AppShell>
    );

    const mainContent = screen.getByRole("main");
    expect(mainContent).toHaveAttribute("tabindex", "-1");
  });

  it("should navigate to main content when skip link is activated", async () => {
    const user = userEvent.setup();
    
    render(
      <AppShell>
        <div>Test content</div>
      </AppShell>
    );

    const skipLink = screen.getByText("Skip to main content");
    const mainContent = screen.getByRole("main");

    // Click the skip link
    await user.click(skipLink);

    // In a real browser, this would scroll to and focus the main element
    // We can verify the href points to the right id
    expect(skipLink.getAttribute("href")).toBe(`#${mainContent.getAttribute("id")}`);
  });

  it("should work in desktop layout", () => {
    // Desktop layout shows sidebar
    render(
      <AppShell>
        <div>Desktop content</div>
      </AppShell>
    );

    const skipLink = screen.getByText("Skip to main content");
    const mainContent = screen.getByRole("main");

    expect(skipLink).toBeInTheDocument();
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveTextContent("Desktop content");
  });

  it("should work in mobile layout", () => {
    // Mobile layout shows bottom nav
    render(
      <AppShell>
        <div>Mobile content</div>
      </AppShell>
    );

    const skipLink = screen.getByText("Skip to main content");
    const mainContent = screen.getByRole("main");

    expect(skipLink).toBeInTheDocument();
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveTextContent("Mobile content");
  });

  it("should have proper styling for visibility and accessibility", () => {
    render(
      <AppShell>
        <div>Test content</div>
      </AppShell>
    );

    const skipLink = screen.getByText("Skip to main content");

    // Check all required classes are present
    expect(skipLink).toHaveClass("fixed");
    expect(skipLink).toHaveClass("left-4");
    expect(skipLink).toHaveClass("top-4");
    expect(skipLink).toHaveClass("rounded-lg");
    expect(skipLink).toHaveClass("px-4");
    expect(skipLink).toHaveClass("py-2");
    expect(skipLink).toHaveClass("shadow-lg");
  });

  it("should use accent color for visibility", () => {
    render(
      <AppShell>
        <div>Test content</div>
      </AppShell>
    );

    const skipLink = screen.getByText("Skip to main content");
    
    // Check it uses accent color for high visibility
    expect(skipLink).toHaveClass("bg-[hsl(var(--accent))]");
  });

  it("should render children inside main content", () => {
    const testContent = <div data-testid="child-content">Child test content</div>;
    
    render(<AppShell>{testContent}</AppShell>);

    const mainContent = screen.getByRole("main");
    const childContent = screen.getByTestId("child-content");

    expect(mainContent).toContainElement(childContent);
  });

  it("should not render skip link on public routes", () => {
    // Mock pathname to return login page
    const usePathnameMock = jest.requireMock("next/navigation").usePathname;
    usePathnameMock.mockReturnValue("/login");

    render(
      <AppShell>
        <div>Login page</div>
      </AppShell>
    );

    // Skip link should not be present on public routes
    expect(screen.queryByText("Skip to main content")).not.toBeInTheDocument();
  });
});
