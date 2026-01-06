import { describe, it, expect, beforeEach } from 'vitest';
import { useCounterStore } from './counter';

describe('Counter Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCounterStore.setState({ count: 0 });
  });

  it('should have initial count of 0', () => {
    const { count } = useCounterStore.getState();
    expect(count).toBe(0);
  });

  it('should increment count', () => {
    const { increment } = useCounterStore.getState();
    increment();
    expect(useCounterStore.getState().count).toBe(1);
  });

  it('should decrement count', () => {
    useCounterStore.setState({ count: 5 });
    const { decrement } = useCounterStore.getState();
    decrement();
    expect(useCounterStore.getState().count).toBe(4);
  });

  it('should reset count to 0', () => {
    useCounterStore.setState({ count: 10 });
    const { reset } = useCounterStore.getState();
    reset();
    expect(useCounterStore.getState().count).toBe(0);
  });

  it('should set count to specific value', () => {
    const { setCount } = useCounterStore.getState();
    setCount(42);
    expect(useCounterStore.getState().count).toBe(42);
  });
});
