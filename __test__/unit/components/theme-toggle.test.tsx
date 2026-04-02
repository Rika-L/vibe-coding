import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/theme-toggle';

// Mock next-themes before importing the component
const mockSetTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    setTheme: mockSetTheme,
  })),
}));

// Mock UI components
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown">{children}</div>,
  DropdownMenuTrigger: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div role="menuitem" onClick={onClick} data-testid="menuitem">{children}</div>
  ),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render theme toggle button after mounted', () => {
    const { container } = render(<ThemeToggle />);
    vi.runAllTimers();

    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', '切换主题');
  });

  it('should render sun and moon icons', () => {
    render(<ThemeToggle />);
    vi.runAllTimers();

    // Check for SVG icons (sun and moon)
    const svgs = document.querySelectorAll('svg');
    expect(svgs).toHaveLength(2);
  });

  it('should render theme options in dropdown', () => {
    const { container } = render(<ThemeToggle />);
    vi.runAllTimers();

    // Open dropdown by clicking the trigger
    const button = container.querySelector('button');
    fireEvent.click(button!);

    // Check menu items exist
    const menuItems = screen.getAllByTestId('menuitem');
    expect(menuItems).toHaveLength(3);
    expect(menuItems[0]).toHaveTextContent('浅色');
    expect(menuItems[1]).toHaveTextContent('深色');
    expect(menuItems[2]).toHaveTextContent('系统');
  });

  it('should call setTheme with light when clicking light option', () => {
    const { container } = render(<ThemeToggle />);
    vi.runAllTimers();

    const button = container.querySelector('button');
    fireEvent.click(button!);

    const menuItems = screen.getAllByTestId('menuitem');
    fireEvent.click(menuItems[0]);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should call setTheme with dark when clicking dark option', () => {
    const { container } = render(<ThemeToggle />);
    vi.runAllTimers();

    const button = container.querySelector('button');
    fireEvent.click(button!);

    const menuItems = screen.getAllByTestId('menuitem');
    fireEvent.click(menuItems[1]);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should call setTheme with system when clicking system option', () => {
    const { container } = render(<ThemeToggle />);
    vi.runAllTimers();

    const button = container.querySelector('button');
    fireEvent.click(button!);

    const menuItems = screen.getAllByTestId('menuitem');
    fireEvent.click(menuItems[2]);

    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });
});
