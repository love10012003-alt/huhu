export const metadata = { title: 't.lal.vn - CanhDon PRO', description: 'Canh don san bay PRO - SGN VCA HAN DAD CXR PQC' }
import './globals.css'
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="vi"><body className="bg-[#09090b] text-white antialiased">{children}</body></html>
}
