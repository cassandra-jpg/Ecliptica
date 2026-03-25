import { useState, useEffect } from 'react';
import { supabase, Article } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewsletterPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadMoreCount, setLoadMoreCount] = useState(4);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => { fetchArticles(); }, []);
  useEffect(() => { filterArticles(); }, [articles, searchQuery, loadMoreCount]);

  const fetchArticles = async () => {
    setLoading(true);
    setFetchError(null);
    const { data, error } = await supabase.from('articles').select('*').eq('published', true).order('created_at', { ascending: false });
    if (error) { setFetchError('Failed to load articles. Please try again later.'); setLoading(false); return; }
    if (data) setArticles(data);
    setLoading(false);
  };

  const filterArticles = () => {
    let filtered = articles;
    if (searchQuery) filtered = articles.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || (a.category && a.category.toLowerCase().includes(searchQuery.toLowerCase())));
    setDisplayedArticles(filtered.slice(0, loadMoreCount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).replace(/\d+/, `${day}${suffix}`);
  };

  const featuredArticle = displayedArticles[0];
  const nextThree = displayedArticles.slice(1, 4);
  const remaining = displayedArticles.slice(4);

  const ArticleCard = ({ article, featured }: { article: Article; featured?: boolean }) => (
    <article
      className={`${featured ? 'p-12 lg:p-16' : 'p-8 flex flex-col min-h-[250px]'} cursor-pointer transition-all hover:shadow-lg`}
      style={{ backgroundColor: 'var(--color-ivory)' }}
      onClick={() => setSelectedArticle(article)}
    >
      <h2 className={`font-cormorant ${featured ? 'text-3xl md:text-4xl lg:text-5xl mb-6 text-center' : 'text-2xl mb-4'} leading-tight`} style={{ color: 'var(--color-navy)', textTransform: featured ? 'uppercase' : 'none' }}>{article.title}</h2>
      <p className={`font-baskerville text-xs ${featured ? 'mb-8 text-center text-sm' : 'mb-4'}`} style={{ color: 'var(--color-text-dark)' }}>{formatDate(article.created_at)}</p>
      {featured && <div className="w-full mb-8" style={{ height: '1px', backgroundColor: 'rgba(27, 35, 64, 0.2)' }} />}
      {article.opening_line && <p className={`font-baskerville ${featured ? 'text-base' : 'text-sm line-clamp-4'} leading-relaxed`} style={{ color: 'var(--color-text-dark)' }}>{article.opening_line}</p>}
      {!featured && <div className="flex-grow" />}
      <p className={`font-montserrat text-xs ${featured ? 'text-center mt-6' : 'mt-4'} tracking-wider`} style={{ color: 'var(--color-gold)' }}>READ MORE</p>
    </article>
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#2B3655' }}>
      <Sidebar />
      <main className="lg:ml-60 w-full">
        <div className="px-8 lg:px-16 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between mb-8 pb-6 border-b" style={{ borderColor: 'var(--color-gold)' }}>
              <h1 className="font-cormorant text-5xl md:text-6xl" style={{ color: 'var(--color-gold)' }}>Newsletter</h1>
              <div className="flex flex-col items-end gap-4">
                <Link to="/members" className="font-montserrat text-xs tracking-[0.2em] uppercase transition-colors hover:opacity-70" style={{ color: 'var(--color-gold)' }}>Become A Member</Link>
                <Link to="/login" className="font-montserrat text-xs tracking-[0.2em] uppercase transition-colors hover:opacity-70" style={{ color: 'var(--color-gold)' }}>Login</Link>
              </div>
            </div>

            <div className="mb-10 relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'rgba(27, 35, 64, 0.4)' }} />
              <input type="text" placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-full py-3 pl-12 pr-6 font-montserrat text-sm focus:outline-none transition-all" style={{ backgroundColor: 'var(--color-ivory)', color: 'var(--color-navy)', border: 'none' }} />
            </div>

            {fetchError ? (
              <div className="text-center py-20">
                <p className="font-cormorant text-2xl mb-4" style={{ color: 'rgba(247, 245, 240, 0.7)' }}>{fetchError}</p>
                <button onClick={fetchArticles} className="font-montserrat text-sm tracking-wider uppercase transition-opacity hover:opacity-70" style={{ color: 'var(--color-gold)' }}>Try Again</button>
              </div>
            ) : loading ? (
              <div className="text-center py-20"><p className="font-cormorant text-2xl" style={{ color: 'rgba(247, 245, 240, 0.5)' }}>Loading articles...</p></div>
            ) : displayedArticles.length === 0 ? (
              <div className="text-center py-20"><p className="font-cormorant text-2xl" style={{ color: 'rgba(247, 245, 240, 0.5)' }}>No articles found.</p></div>
            ) : (
              <>
                {featuredArticle && <div className="mb-8"><ArticleCard article={featuredArticle} featured /></div>}
                {nextThree.length > 0 && <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">{nextThree.map((a) => <ArticleCard key={a.id} article={a} />)}</div>}
                {remaining.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">{remaining.map((a) => <ArticleCard key={a.id} article={a} />)}</div>}
                {!searchQuery && articles.length > loadMoreCount && (
                  <div className="text-center mt-16 mb-8">
                    <button onClick={() => setLoadMoreCount(loadMoreCount + 4)} className="font-montserrat text-base tracking-wide uppercase transition-all duration-300" style={{ color: 'var(--color-gold)', backgroundColor: 'transparent' }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}>More</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} onClick={() => setSelectedArticle(null)}>
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 lg:p-16" style={{ backgroundColor: 'var(--color-ivory)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedArticle(null)} className="absolute top-4 right-4 p-2 transition-opacity hover:opacity-70" style={{ color: 'var(--color-navy)' }}><X size={24} /></button>
            <h2 className="font-cormorant text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight" style={{ color: 'var(--color-navy)', textTransform: 'uppercase' }}>{selectedArticle.title}</h2>
            <p className="font-baskerville text-sm mb-8" style={{ color: 'var(--color-text-dark)' }}>{formatDate(selectedArticle.created_at)}</p>
            {selectedArticle.category && <p className="font-montserrat text-xs tracking-widest uppercase mb-8" style={{ color: 'var(--color-gold)' }}>{selectedArticle.category}</p>}
            <div className="w-full mb-8" style={{ height: '1px', backgroundColor: 'rgba(27, 35, 64, 0.2)' }} />
            {selectedArticle.image_url && (
              <div className="mb-8 w-full">
                <img src={selectedArticle.image_url} alt={selectedArticle.title} className="w-full h-auto" style={{ aspectRatio: '16/9', objectFit: 'cover', borderRadius: '4px' }} />
              </div>
            )}
            <div className="font-baskerville text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text-dark)' }}>{selectedArticle.full_content}</div>
          </div>
        </div>
      )}
    </div>
  );
}
