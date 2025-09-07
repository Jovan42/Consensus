export function ThemeScript() {
  const codeToRunOnClient = `
    (function() {
      try {
        function getThemePreference() {
          if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme');
          }
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        const themePreference = getThemePreference();
        const colorScheme = themePreference === 'system' 
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : themePreference;
        
        // Apply theme immediately to prevent flash and hydration mismatch
        if (colorScheme === 'dark') {
          document.documentElement.className = 'dark';
        } else {
          document.documentElement.className = 'light';
        }
      } catch (e) {
        // Fallback to light theme if there's any error
        document.documentElement.className = 'light';
      }
    })()
  `;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: codeToRunOnClient,
      }}
      suppressHydrationWarning
    />
  );
}
