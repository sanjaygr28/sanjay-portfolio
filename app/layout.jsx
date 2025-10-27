import '../styles/globals.css'
export const metadata = { title: 'Sanjay G R — Data Science', description: 'Portfolio' }
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
