import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Article } from '../lib/supabase';
import { LogOut, Plus, CreditCard as Edit2, Trash2 } from 'lucide-react';

type Section = 'dashboard' | 'member-tools' | 'content-engine' | 'newsletter';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  const [articles, setArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    opening_line: '',
    full_content: '',
    publisher: '',
    published: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeSection === 'newsletter') {
      fetchArticles();
    }
  }, [activeSection]);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const articleData = {
        title: formData.title,
        category: formData.category || null,
        opening_line: formData.opening_line || null,
        full_content: formData.full_content || null,
        publisher: formData.publisher === '' ? null : formData.publisher,
        published: formData.published,
      };

      if (editingArticle) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingArticle.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([articleData]);

        if (error) throw error;
      }

      setFormData({
        title: '',
        category: '',
        opening_line: '',
        full_content: '',
        publisher: '',
        published: false,
      });
      setEditingArticle(null);
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      category: article.category || '',
      opening_line: article.opening_line || '',
      full_content: article.full_content || '',
      publisher: article.publisher || '',
      published: article.published,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchArticles();
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#1B2340' }}>
      <aside className="w-60 border-r" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
          <h2 className="font-cormorant text-2xl" style={{ color: '#FFFFFF' }}>
            Admin
          </h2>
          <p className="font-montserrat text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            {profile?.email}
          </p>
        </div>

        <nav className="p-6">
          <button
            onClick={() => setActiveSection('dashboard')}
            className="w-full text-left py-3 px-4 mb-2 font-cormorant text-lg transition-all"
            style={{
              color: activeSection === 'dashboard' ? '#C9A84C' : 'rgba(255, 255, 255, 0.7)',
              backgroundColor: activeSection === 'dashboard' ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
            }}
          >
            DASHBOARD
          </button>
          <button
            onClick={() => setActiveSection('member-tools')}
            className="w-full text-left py-3 px-4 mb-2 font-cormorant text-lg transition-all"
            style={{
              color: activeSection === 'member-tools' ? '#C9A84C' : 'rgba(255, 255, 255, 0.7)',
              backgroundColor: activeSection === 'member-tools' ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
            }}
          >
            MEMBER TOOLS
          </button>
          <button
            onClick={() => setActiveSection('content-engine')}
            className="w-full text-left py-3 px-4 mb-2 font-cormorant text-lg transition-all"
            style={{
              color: activeSection === 'content-engine' ? '#C9A84C' : 'rgba(255, 255, 255, 0.7)',
              backgroundColor: activeSection === 'content-engine' ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
            }}
          >
            CONTENT ENGINE
          </button>
          <button
            onClick={() => setActiveSection('newsletter')}
            className="w-full text-left py-3 px-4 mb-2 font-cormorant text-lg transition-all"
            style={{
              color: activeSection === 'newsletter' ? '#C9A84C' : 'rgba(255, 255, 255, 0.7)',
              backgroundColor: activeSection === 'newsletter' ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
            }}
          >
            NEWSLETTER
          </button>
        </nav>

        <div className="absolute bottom-0 p-6 w-60">
          <button
            onClick={signOut}
            className="flex items-center gap-2 font-montserrat text-xs tracking-wider"
            style={{ color: '#C9A84C' }}
          >
            <LogOut size={16} />
            SIGN OUT
          </button>
        </div>
      </aside>

      <main className="flex-1 p-12">
        {activeSection === 'dashboard' && (
          <div>
            <h1 className="font-cormorant text-5xl mb-12" style={{ color: '#FFFFFF' }}>
              Dashboard
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div
                  key={num}
                  className="border p-8 flex items-center justify-center h-48"
                  style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}
                >
                  <p className="font-cormorant text-2xl" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Tool {String(num).padStart(2, '0')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'member-tools' && (
          <div className="flex items-center justify-center h-96">
            <p className="font-cormorant text-3xl text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              COMING SOON. MEMBER-FACING TOOLS IN DEVELOPMENT.
            </p>
          </div>
        )}

        {activeSection === 'content-engine' && (
          <div className="flex items-center justify-center h-96">
            <p className="font-cormorant text-3xl text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              CONTENT ENGINE IN DEVELOPMENT.
            </p>
          </div>
        )}

        {activeSection === 'newsletter' && (
          <div>
            <h1 className="font-cormorant text-5xl mb-12" style={{ color: '#FFFFFF' }}>
              Newsletter
            </h1>

            <form onSubmit={handleSubmit} className="mb-12 border p-8" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
              <h3 className="font-cormorant text-2xl mb-6" style={{ color: '#C9A84C' }}>
                {editingArticle ? 'Edit Article' : 'Create Article'}
              </h3>

              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-transparent border-b py-3 font-baskerville text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF' }}
                  required
                />

                <input
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-transparent border-b py-3 font-baskerville text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF' }}
                />

                <input
                  type="text"
                  placeholder="Opening Line"
                  value={formData.opening_line}
                  onChange={(e) => setFormData({ ...formData, opening_line: e.target.value })}
                  className="w-full bg-transparent border-b py-3 font-baskerville text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF' }}
                />

                <textarea
                  placeholder="Full Content"
                  value={formData.full_content}
                  onChange={(e) => setFormData({ ...formData, full_content: e.target.value })}
                  rows={8}
                  className="w-full bg-transparent border py-3 px-4 font-baskerville text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF' }}
                />

                <select
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  className="w-full bg-transparent border-b py-3 font-baskerville text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF', backgroundColor: '#1B2340' }}
                >
                  <option value="">No Publisher</option>
                  <option value="Ecliptica LLC">Ecliptica LLC</option>
                  <option value="James Stephan-Usypchuk">James Stephan-Usypchuk</option>
                  <option value="Cassandra Steele">Cassandra Steele</option>
                </select>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: '#C9A84C' }}
                  />
                  <span className="font-montserrat text-xs" style={{ color: '#FFFFFF' }}>
                    Publish immediately
                  </span>
                </label>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-12 py-4 font-montserrat text-xs tracking-[0.25em] uppercase transition-all"
                    style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
                  >
                    {loading ? 'Saving...' : editingArticle ? 'Update' : 'Create'}
                  </button>
                  {editingArticle && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingArticle(null);
                        setFormData({
                          title: '',
                          category: '',
                          opening_line: '',
                          full_content: '',
                          publisher: '',
                          published: false,
                        });
                      }}
                      className="px-12 py-4 font-montserrat text-xs tracking-[0.25em] uppercase border transition-all"
                      style={{ borderColor: '#C9A84C', color: '#C9A84C' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>

            <div className="border" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
              <div className="grid grid-cols-6 gap-4 p-4 border-b" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
                <p className="font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>TITLE</p>
                <p className="font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>CATEGORY</p>
                <p className="font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>DATE</p>
                <p className="font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>PUBLISHER</p>
                <p className="font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>STATUS</p>
                <p className="font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>ACTIONS</p>
              </div>
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="grid grid-cols-6 gap-4 p-4 border-b"
                  style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}
                >
                  <p className="font-baskerville text-sm" style={{ color: '#FFFFFF' }}>{article.title}</p>
                  <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{article.category || '-'}</p>
                  <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {new Date(article.created_at).toLocaleDateString()}
                  </p>
                  <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{article.publisher || 'None'}</p>
                  <p className="font-montserrat text-xs" style={{ color: article.published ? '#10B981' : 'rgba(255, 255, 255, 0.5)' }}>
                    {article.published ? 'Published' : 'Draft'}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(article)} style={{ color: '#C9A84C' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(article.id)} style={{ color: '#DC2626' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
