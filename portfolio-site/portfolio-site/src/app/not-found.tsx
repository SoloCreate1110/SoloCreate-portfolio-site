import Link from 'next/link';
import { Header, Footer } from '@/components';

export default function NotFound() {
  return (
    <>
      <Header />
      
      <main className="container-custom py-24">
        <div className="text-center">
          <h1 
            className="text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none mb-8"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            404
          </h1>
          
          <div className="border-4 border-black p-8 max-w-xl mx-auto shadow-[8px_8px_0_0_#000] bg-amber-400">
            <h2 className="text-2xl font-bold uppercase mb-4">
              Page Not Found
            </h2>
            <p className="text-lg mb-8">
              お探しのページは見つかりませんでした。<br />
              URLが正しいかご確認ください。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="btn-brutal">
                ホームに戻る
              </Link>
              <Link href="/works" className="btn-brutal">
                作品一覧を見る
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
