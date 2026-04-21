// ─── Theme Context (REMOVED: Light Mode Only) ───────────────────────────────
export const ThemeProvider = ({ children }) => <>{children}</>
export const useTheme = () => ({ isLight: true, toggleTheme: () => {} })
export const ThemeToggle = () => null
