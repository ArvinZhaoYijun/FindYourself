export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const limit = Math.max(1, concurrency || 1);
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function runWorker() {
    while (true) {
      const currentIndex = cursor;
      cursor += 1;

      if (currentIndex >= items.length) {
        break;
      }

      results[currentIndex] = await worker(items[currentIndex]!, currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    runWorker()
  );

  await Promise.all(workers);
  return results;
}
