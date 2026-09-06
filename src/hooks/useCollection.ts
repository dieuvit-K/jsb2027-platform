import { useEffect, useState } from 'react'

/** Hook réactif sur une collection locale : recharge à chaque mutation connue.
 *  Version simple : lit au montage et expose un refresh().
 */
export function useCollection<T extends { id: string }>(
  loader: () => Promise<T[]>,
  deps: unknown[] = [],
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      const data = await loader()
      setItems(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { items, loading, error, refresh }
}
