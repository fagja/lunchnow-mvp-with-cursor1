import { renderHook, act } from '@testing-library/react-hooks';
import { usePollingWithSWR } from '@/hooks/usePollingWithSWR';
import { useSWRPolling } from '@/hooks/useSWRPolling';

describe('ポーリングフック移行テスト', () => {
  it('新旧両方のフックが同じ動作をすること', async () => {
    const fetcher = jest.fn().mockResolvedValue({ data: 'test' });

    // 旧フックをレンダリング
    const { result: oldResult } = renderHook(() =>
      usePollingWithSWR('/test', fetcher, { interval: 3000 })
    );

    // 新フックをレンダリング
    const { result: newResult } = renderHook(() =>
      useSWRPolling('/test', fetcher, { refreshInterval: 3000 })
    );

    // データ取得結果が同じであることを確認
    await act(async () => {
      await new Promise(r => setTimeout(r, 100));
    });

    expect(oldResult.current.data).toEqual(newResult.current.data);

    // ポーリング制御が同じように動作することを確認
    act(() => {
      oldResult.current.polling.stopPolling();
      newResult.current.polling.stopPolling();
    });

    expect(oldResult.current.polling.isPolling).toBe(false);
    expect(newResult.current.polling.isPolling).toBe(false);
  });
});
