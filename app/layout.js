// app/layout.js

import './globals.css';

export const metadata = {
  title: 'SSB Community Hub',
  description: 'The official community hub for SSB.',
};

export default function RootLayout({ children }) {
  // This script runs instantly to set the theme and prevent the flash
  const themeScript = `
    (function() {
      try {
        const community = localStorage.getItem('selectedCommunity');
        // Clear any existing theme classes first
        document.documentElement.className = '';
        if (community) {
          document.documentElement.classList.add(community + '-theme');
        }
      } catch (e) {}
    })();
  `;

  return (
    // ADDED: suppressHydrationWarning to the html tag
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" 
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
