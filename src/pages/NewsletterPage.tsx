import { useState, useEffect } from 'react';
import { supabase, Article } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewsletterPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadMoreCount, setLoadMoreCount] = useState(4);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, loadMoreCount]);

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
    setLoading(false);
  };

  const filterArticles = () => {
    let filtered = articles;

    if (searchQuery) {
      filtered = articles.filter((article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.category && article.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setDisplayedArticles(filtered.slice(0, loadMoreCount));
  };

  const handleLoadMore = () => {
    setLoadMoreCount(loadMoreCount + 4);
  };

  const featuredArticle = displayedArticles[0];
  const nextThree = displayedArticles.slice(1, 4);
  const remaining = displayedArticles.slice(4);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).replace(/\d+/, `${day}${suffix}`);
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#2B3655' }}>
      <Sidebar />
      <main className="lg:ml-60 w-full">
        <div className="px-8 lg:px-16 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between mb-8 pb-6 border-b" style={{ borderColor: 'var(--color-gold)' }}>
              <h1 className="font-cormorant text-5xl md:text-6xl" style={{ color: 'var(--color-gold)' }}>
                Newsletter
              </h1>
              <div className="flex flex-col items-end gap-4">
                <Link
                  to="/members"
                  className="font-montserrat text-xs tracking-[0.2em] uppercase transition-colors hover:opacity-70"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Become A Member
                </Link>
                <Link
                  to="/login"
                  className="font-montserrat text-xs tracking-[0.2em] uppercase transition-colors hover:opacity-70"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Login
                </Link>
              </div>
            </div>

            <div className="mb-10 relative max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={18}
                style={{ color: 'rgba(27, 35, 64, 0.4)' }}
              />
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full py-3 pl-12 pr-6 font-montserrat text-sm focus:outline-none transition-all"
                style={{
                  backgroundColor: 'var(--color-ivory)',
                  color: 'var(--color-navy)',
                  border: 'none'
                }}
              />
            </div>

            {loading ? (
              <div className="text-center py-20">
                <p className="font-cormorant text-2xl" style={{ color: 'rgba(247, 245, 240, 0.5)' }}>
                  Loading articles...
                </p>
              </div>
            ) : displayedArticles.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-cormorant text-2xl" style={{ color: 'rgba(247, 245, 240, 0.5)' }}>
                  No articles found.
                </p>
              </div>
            ) : (
              <>
                {featuredArticle && (
                  <article
                    className="mb-8 p-12 lg:p-16"
                    style={{ backgroundColor: 'var(--color-ivory)' }}
                  >
                    <h2 className="font-cormorant text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight text-center" style={{ color: 'var(--color-navy)', textTransform: 'uppercase' }}>
                      {featuredArticle.title}
                    </h2>
                    <p className="font-baskerville text-sm mb-8 text-center" style={{ color: 'var(--color-text-dark)' }}>
                      {formatDate(featuredArticle.created_at)}
                    </p>
                    <div
                      className="w-full mb-8"
                      style={{
                        height: '1px',
                        backgroundColor: 'rgba(27, 35, 64, 0.2)'
                      }}
                    />
                    {featuredArticle.opening_line && (
                      <p className="font-baskerville text-base leading-relaxed" style={{ color: 'var(--color-text-dark)' }}>
                        {featuredArticle.opening_line}
                      </p>
                    )}
                  </article>
                )}

                {nextThree.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {nextThree.map((article) => (
                      <article
                        key={article.id}
                        className="p-8 flex flex-col min-h-[250px]"
                        style={{ backgroundColor: 'var(--color-ivory)' }}
                      >
                        <div className="flex-grow" />
                      </article>
                    ))}
                  </div>
                )}

                {remaining.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {remaining.map((article) => (
                      <article
                        key={article.id}
                        className="p-8 flex flex-col min-h-[250px]"
                        style={{ backgroundColor: 'var(--color-ivory)' }}
                      >
                        <div className="flex-grow" />
                      </article>
                    ))}
                  </div>
                )}

                {!searchQuery && articles.length > loadMoreCount && (
                  <div className="text-center mt-16 mb-8">
                    <button
                      onClick={handleLoadMore}
                      className="font-montserrat text-base tracking-wide uppercase transition-all duration-300"
                      style={{
                        color: 'var(--color-gold)',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
