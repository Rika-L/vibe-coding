import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileForm } from '@/components/settings/profile-form';
import { PasswordForm } from '@/components/settings/password-form';

// Mock sonner toast - use vi.fn() inside the mock factory to avoid hoisting issues
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock Dialog components to simplify testing
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    <div data-testid="dialog" data-open={open}>{open ? children : null}</div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}));

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}));

// Mock Input component
vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, type, maxLength }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    maxLength?: number;
  }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      maxLength={maxLength}
    />
  ),
}));

// Mock Loader2 icon
vi.mock('lucide-react', () => ({
  Loader2: () => <span data-testid="loader">Loading...</span>,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import toast after mocking to get the mocked version
import { toast } from 'sonner';

describe('ProfileForm', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    avatar: '🐱',
    createdAt: '2024-01-01',
  };

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    user: mockUser,
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render user profile data', () => {
    render(<ProfileForm {...defaultProps} />);

    expect(screen.getByText('修改资料')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
  });

  it('should render preset avatars', () => {
    render(<ProfileForm {...defaultProps} />);

    expect(screen.getByText('😴')).toBeInTheDocument();
    expect(screen.getByText('🌙')).toBeInTheDocument();
    expect(screen.getByText('⭐')).toBeInTheDocument();
    expect(screen.getByText('🐱')).toBeInTheDocument();
    expect(screen.getByText('🐶')).toBeInTheDocument();
    expect(screen.getByText('🦊')).toBeInTheDocument();
    expect(screen.getByText('🐼')).toBeInTheDocument();
    expect(screen.getByText('🦁')).toBeInTheDocument();
  });

  it('should show character count', () => {
    render(<ProfileForm {...defaultProps} />);

    // Default name is "Test User" which is 9 characters
    expect(screen.getByText('9/50')).toBeInTheDocument();
  });

  it('should update character count when typing', () => {
    render(<ProfileForm {...defaultProps} />);

    const input = screen.getByDisplayValue('Test User');
    fireEvent.change(input, { target: { value: 'New Name' } });

    expect(screen.getByText('8/50')).toBeInTheDocument();
  });

  it('should call onSuccess on successful submit', async () => {
    const updatedUser = { ...mockUser, name: 'New Name', avatar: '🐱' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: updatedUser }),
    });

    render(<ProfileForm {...defaultProps} />);

    const input = screen.getByDisplayValue('Test User');
    fireEvent.change(input, { target: { value: 'New Name' } });

    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Name', avatar: '🐱' }),
      });
      expect(defaultProps.onSuccess).toHaveBeenCalledWith(updatedUser);
    });
  });

  it('should show error when name is empty', async () => {
    render(<ProfileForm {...defaultProps} />);

    const input = screen.getByDisplayValue('Test User');
    fireEvent.change(input, { target: { value: '' } });

    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('请输入名称');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  it('should show error when name exceeds 50 characters', async () => {
    render(<ProfileForm {...defaultProps} />);

    const input = screen.getByDisplayValue('Test User');
    fireEvent.change(input, { target: { value: 'a'.repeat(51) } });

    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('名称不能超过 50 个字符');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  it('should call onOpenChange when clicking cancel', () => {
    render(<ProfileForm {...defaultProps} />);

    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should not render content when closed', () => {
    render(<ProfileForm {...defaultProps} open={false} />);

    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'false');
    expect(screen.queryByText('修改资料')).not.toBeInTheDocument();
  });
});

describe('PasswordForm', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render password form fields', () => {
    render(<PasswordForm {...defaultProps} />);

    expect(screen.getByText('修改密码')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入当前密码')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入新密码（至少6位）')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请再次输入新密码')).toBeInTheDocument();
  });

  it('should show error when fields are empty', async () => {
    render(<PasswordForm {...defaultProps} />);

    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('请填写所有字段');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  it('should show error when new password is less than 6 characters', async () => {
    render(<PasswordForm {...defaultProps} />);

    const currentInput = screen.getByPlaceholderText('请输入当前密码');
    const newInput = screen.getByPlaceholderText('请输入新密码（至少6位）');
    const confirmInput = screen.getByPlaceholderText('请再次输入新密码');

    // Fill in all fields with short password
    fireEvent.change(currentInput, { target: { value: 'current' } });
    fireEvent.change(newInput, { target: { value: 'short' } });
    fireEvent.change(confirmInput, { target: { value: 'short' } });

    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('新密码至少 6 位');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  it('should show error when passwords do not match', async () => {
    render(<PasswordForm {...defaultProps} />);

    const currentInput = screen.getByPlaceholderText('请输入当前密码');
    const newInput = screen.getByPlaceholderText('请输入新密码（至少6位）');
    const confirmInput = screen.getByPlaceholderText('请再次输入新密码');

    // Fill in all fields with mismatched passwords
    fireEvent.change(currentInput, { target: { value: 'current' } });
    fireEvent.change(newInput, { target: { value: 'newpassword' } });
    fireEvent.change(confirmInput, { target: { value: 'different' } });

    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('两次输入的密码不一致');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  it('should call onSuccess on successful password change', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<PasswordForm {...defaultProps} />);

    const currentInput = screen.getByPlaceholderText('请输入当前密码');
    const newInput = screen.getByPlaceholderText('请输入新密码（至少6位）');
    const confirmInput = screen.getByPlaceholderText('请再次输入新密码');

    // Fill in all fields correctly
    fireEvent.change(currentInput, { target: { value: 'currentpass' } });
    fireEvent.change(newInput, { target: { value: 'newpassword' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword' } });

    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: 'currentpass',
          newPassword: 'newpassword',
        }),
      });
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('should call onOpenChange when clicking cancel', () => {
    render(<PasswordForm {...defaultProps} />);

    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});
