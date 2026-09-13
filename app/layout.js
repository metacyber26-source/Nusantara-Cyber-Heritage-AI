export const metadata = {
  title: 'Nusantara Cyber-Heritage AI',
  description: 'Platform Preservasi & NFT Kebudayaan Nusantara',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0f172a', color: '#f8fafc' }}>
        {children}
      </body>
    </html>
  );
}
