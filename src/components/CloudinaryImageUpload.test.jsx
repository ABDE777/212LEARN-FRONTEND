import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CloudinaryImageUpload from './CloudinaryImageUpload';

// The component posts to the backend for a signature; mock it so validation
// paths never hit the network.
vi.mock('../services/api', () => ({ default: vi.fn() }));

const selectFile = (container, file) => {
  const input = container.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });
};

describe('CloudinaryImageUpload', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the dropzone placeholder', () => {
    render(<CloudinaryImageUpload onChange={() => {}} placeholder="Déposez ici" />);
    expect(screen.getByText('Déposez ici')).toBeInTheDocument();
  });

  it('rejects an unsupported file type without calling onChange', async () => {
    const onChange = vi.fn();
    const { container } = render(<CloudinaryImageUpload onChange={onChange} />);
    selectFile(container, new File(['x'], 'notes.txt', { type: 'text/plain' }));
    expect(await screen.findByText(/Format non supporté/i)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('rejects a file larger than the max size', async () => {
    const onChange = vi.fn();
    const { container } = render(<CloudinaryImageUpload onChange={onChange} maxSizeMB={1} />);
    // 2 MB "image" — over the 1 MB limit.
    const big = new File([new Uint8Array(2 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    selectFile(container, big);
    expect(await screen.findByText(/Fichier trop grand/i)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not crash when onChange is omitted (defensive guard)', async () => {
    // Regression guard: a caller passing the wrong prop name must not throw
    // "t is not a function". Removing (which calls onChange) must be safe.
    const { container } = render(<CloudinaryImageUpload />);
    // Reject an invalid file first (no network), then ensure no throw occurred.
    selectFile(container, new File(['x'], 'notes.txt', { type: 'text/plain' }));
    await waitFor(() => expect(screen.getByText(/Format non supporté/i)).toBeInTheDocument());
  });
});
