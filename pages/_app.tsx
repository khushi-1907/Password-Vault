import type { AppProps } from 'next/app'
import { AuthProvider } from '../context/AuthContext'
import Head from 'next/head'  // ✅ Import Head

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        {/* Tailwind CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
