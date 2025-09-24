// app/layout.js

import './globals.css';

export const metadata = {
  title: 'SSB Community Hub',
  description: 'The official community hub for SSB.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" 
        />
      </head>
      <body>
        {/* This main tag is a good practice for main content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
