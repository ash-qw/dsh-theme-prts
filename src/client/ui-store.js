import { DEFAULT_PREFERENCES } from './preferences.js'
import { EMPTY_STATUS } from './status-projection.js'

export function createPrtsUiStore(defineStore, initial = {}) {
  const initialPreferences = initial.preferences ?? DEFAULT_PREFERENCES
  const initialStatus = initial.status ?? EMPTY_STATUS
  const initialRevision = initial.revision ?? -1
  return defineStore({
    init: () => ({
      preferences: { ...initialPreferences },
      status: { ...initialStatus },
      revision: initialRevision,
    }),
    actions: {
      sync(draft, preferences, status, revision) {
        if (revision <= draft.revision) return
        draft.preferences = { ...preferences }
        draft.status = { ...status }
        draft.revision = revision
      },
    },
  })
}
