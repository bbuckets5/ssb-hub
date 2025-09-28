// app/layout.js

import './globals.css';

export const metadata = {
  title: 'SSB Community Hub',
  description: 'The official community hub for SSB.',
};

export default function RootLayout({ children }) {
  const themeScript = `
    (function() {
      try {
        const community = localStorage.getItem('selectedCommunity');
        document.documentElement.className = '';
        if (community) {
          document.documentElement.classList.add(community + '-theme');
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* --- MODIFIED: Updated to the latest stable Font Awesome version --- */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" 
          integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
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
