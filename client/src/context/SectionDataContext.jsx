import { createContext, useContext, useState, useEffect } from 'react'

export const SectionDataCtx = createContext({})

const API = import.meta.env.VITE_API_URL || ''

export function SectionDataProvider({ children }) {
  const [sections, setSections] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/sections`, {
      headers: { 'x-api-secret': import.meta.env.VITE_API_SECRET || '' }
    })
      .then(r => r.ok ? r.json() : {})
      .then(data => setSections(data))
      .catch(() => setSections({}))
  }, [])

  return (
    <SectionDataCtx.Provider value={{ sections, API }}>
      {children}
    </SectionDataCtx.Provider>
  )
}

export function useSectionData(key) {
  const { sections } = useContext(SectionDataCtx)
  // Still loading — show section (fallback to hardcoded)
  if (!sections) return { loading: true, data: null, enabled: true }
  // Key exists in API response → section is enabled
  if (key in sections) return { loading: false, data: sections[key], enabled: true }
  // Key NOT in API response → section is disabled (API only returns enabled ones)
  return { loading: false, data: null, enabled: false }
}

export function useAPI() {
  const { API } = useContext(SectionDataCtx)
  return API
}
