import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LazyLottie from './LazyLottie';

// Mock the lottie-react runtime with a simple component. This mirrors the real
// interop shape just enough to exercise pickLottieComponent — the logic that
// fixed the React #306 "lazy element must resolve to a class or function" crash.
const MockLottie = ({ animationData }) => (
  <div data-testid="lottie" data-has-animation={String(!!animationData)} />
);
// Mirror lottie-react's real named exports so pickLottieComponent can safely
// probe them (vitest mocks throw on access to undefined named exports).
vi.mock('lottie-react', () => ({
  default: MockLottie,
  LottiePlayer: MockLottie,
  useLottie: () => ({}),
  useLottieInteractivity: () => ({}),
}));

describe('LazyLottie', () => {
  it('renders a placeholder immediately without throwing', () => {
    const load = () => Promise.resolve({ default: { v: '5', layers: [] } });
    const { container } = render(<LazyLottie load={load} minHeight={200} />);
    // Placeholder div is present before the async data/runtime resolve.
    expect(container.querySelector('div[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('renders the resolved Lottie component once data and runtime load', async () => {
    const load = () => Promise.resolve({ default: { v: '5', layers: [] } });
    render(<LazyLottie load={load} />);
    const el = await screen.findByTestId('lottie');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-has-animation', 'true');
  });

  it('stays on the placeholder if the animation fails to load', async () => {
    const load = () => Promise.reject(new Error('network'));
    const { container } = render(<LazyLottie load={load} />);
    // Decorative: a load failure must not crash, just keep the placeholder.
    await new Promise((r) => setTimeout(r, 10));
    expect(container.querySelector('div[aria-hidden="true"]')).toBeInTheDocument();
    expect(screen.queryByTestId('lottie')).not.toBeInTheDocument();
  });
});
