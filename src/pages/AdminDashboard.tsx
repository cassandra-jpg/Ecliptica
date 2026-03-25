import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Article } from '../lib/supabase';
import { LogOut, Plus, CreditCard as Edit2, Trash2, Image, Upload } from 'lucide-react';

type Section = 'dashboard' | 'member-tools' | 'content-engine' | 'newsletter';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({ title: '', category: '', opening_line: '', full_content: '', publisher: '', published: false, created_at: '' });
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => { if (activeSection === 'newsletter') fetchArticles(); }, [activeSection]);

  const fetchArticles = async () => {
    setFetchError(null);
    const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (error) { setFetchError('Failed to load articles. Please try again.'); return; }
    if (data) setArticles(data);
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be less than 5MB'); return; }
    setUploadedImage(file);
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('article-images').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('article-images').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      return null;
    }
  };

  const generateArticleImage = async (articleId: string, title: string, category?: string) => {
    setGeneratingImage(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-article-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category }),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Failed to generate image');
      const { imageUrl } = responseData;
      const { error } = await supabase.from('articles').update({ image_url: imageUrl }).eq('id', articleId);
      if (error) throw error;
      fetchArticles();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl: string | null = null;
      if (uploadedImage) {
        setUploadingImage(true);
        imageUrl = await uploadImageToStorage(uploadedImage);
        setUploadingImage(false);
        if (!imageUrl) { setLoading(false); return; }
      }
      const articleData: any = {
        title: formData.title,
        category: formData.category || null,
        opening_line: formData.opening_line || null,
        full_content: formData.full_content || null,
        publisher: formData.publisher === '' ? null : formData.publisher,
        published: formData.published,
      };
      if (imageUrl) articleData.image_url = imageUrl;
      if (formData.created_at) articleData.created_at = new Date(formData.created_at).toISOString();

      let articleId: string;
      const titleForImage = formData.title;
      const categoryForImage = formData.category || undefined;
      const shouldGenerateImage = !uploadedImage && !editingArticle?.image_url;

      if (editingArticle) {
        const { error } = await supabase.from('articles').update(articleData).eq('id', editingArticle.id);
        if (error) throw error;
        articleId = editingArticle.id;
      } else {
        const { data, error } = await supabase.from('articles').insert([articleData]).select().single();
        if (error) throw error;
        articleId = data.id;
      }

      setFormData({ title: '', category: '', opening_line: '', full_content: '', publisher: '', published: false, created_at: '' });
      setEditingArticle(null);
      setUploadedImage(null);
      fetchArticles();

      if (shouldGenerateImage) await generateArticleImage(articleId, titleForImage, categoryForImage);
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setUploadedImage(null);
    const dateValue = article.created_at ? new Date(article.created_at).toISOString().slice(0, 16) : '';
    setFormData({ title: article.title, category: article.category || '', opening_line: article.opening_line || '', full_content: article.full_content || '', publisher: article.publisher || '', published: article.published, created_at: dateValue });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) { setFetchError('Failed to delete article. Please try again.'); return; }
    fetchArticles();
  };

  const navItems: { key: Section; label: string }[] = [
    { key: 'dashboard', label: 'DASHBOARD' },
    { key: 'member-tools', label: 'MEMBER TOOLS' },
    { key: 'content-engine', label: 'CONTENT ENGINE' },
    { key: 'newsletter', label: 'NEWSLETTER' },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#1B2340' }}>
      <aside className="w-60 border-r" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
          <h2 className="font-cormorant text-2xl" style={{ color: '#FFFFFF' }}>Admin</h2>
          <p className="font-montserrat text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{profile?.email}</p>
        </div>
        <nav className="p-6">
          {navItems.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveSection(key)} className="w-full text-left py-3 px-4 mb-2 font-cormorant text-lg transition-all" style={{ color: activeSection === key ? '#C9A84C' : 'rgba(255, 255, 255, 0.7)', backgroundColor: activeSection === key ? 'rgba(201, 168, 76, 0.1)' : 'transparent' }}>{label}</button>
          ))}
        </nav>
        <div className="absolute bottom-0 p-6 w-60">
          <button onClick={signOut} className="flex items-center gap-2 font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>
            <LogOut size={16} />
            SIGN OUT
          </button>
        </div>
      </aside>

      <main className="flex-1 p-12">
        {activeSection === 'dashboard' && (
          <div>
            <h1 className="font-cormorant text-5xl mb-12" style={{ color: '#FFFFFF' }}>Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="border p-8 flex items-center justify-center h-48" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
                  <p className="font-cormorant text-2xl" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Tool {String(num).padStart(2, '0')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'member-tools' && (
          <div className="flex items-center justify-center h-96">
            <p className="font-cormorant text-3xl text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>COMING SOON. MEMBER-FACING TOOLS IN DEVELOPMENT.</p>
          </div>
        )}

        {activeSection === 'content-engine' && (
          <div className="flex items-center justify-center h-96">
            <p className="font-cormorant text-3xl text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>CONTENT ENGINE IN DEVELOPMENT.</p>
          </div>
        )}

        {activeSection === 'newsletter' && (
          <div>
            <h1 className="font-cormorant text-5xl mb-12" style={{ color: '#FFFFFF' }}>Newsletter</h1>
            {fetchError && (
              <div className="mb-8 p-4 border" style={{ borderColor: '#DC2626', backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
                <p className="font-montserrat text-sm" style={{ color: '#DC2626' }}>{fetchError}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="mb-12 border p-8" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
              <h3 className="font-cormorant text-2xl mb-6" style={{ color: '#C9A84C' }}>{editingArticle ? 'Edit Article' : 'Create Article'}</h3>
              <div className="space-y-6">
                <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-transparent border-b py-3 font-baskerville text-sm focus:outline-none" style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF' }} required />
                <input type="text" placeholder="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-transparent border-b py-3 font-baskerville text-sm focus:outline-none" style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF' }} />
                <div>
                  <label className="block font-montserrat text-xs mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Article Image {!uploadedImage && '(Upload custom image or AI will generate one)'}</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-6 py-3 border cursor-pointer transition-all hover:bg-opacity-10 hover:bg-white" style={{ borderColor: '#C9A84C', color: '#C9A84C' }}>
                      <Upload size={16} />
                      <span className="font-montserrat text-xs tracking-wider">{uploadedImage ? 'Change Image' : 'Upload Image'}</span>
                      <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                    </label>
                    {uploadedImage && (
                      <div className="flex items-center gap-2">
                        <span className="font-baskerville text-sm" style={{ color: '#FFFFFF' }}>{uploadedImage.name}</span>
                        <button type="button" onClick={() => setUploadedImage(null)} className="font-montserrat text-xs" style={{ color: '#DC2626' }}>Remove</button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block font-montserrat text-xs mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Publish Date & Time {!formData.created_at && '(Leave empty for current date/time)'}</label>
                  <input type="datetime-local" value={formData.created_at} onChange={(e) => setFormData({ ...formData, created_at: e.target.value })} className="w-full bg-transparent border-b py-3 font-baskerville text-sm focus:outline-none" style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF', backgroundColor: '#1B2340' }} />
                </div>
                <input type="text" placeholder="Opening Line" value={formData.opening_line} onChange={(e) => setFormData({ ...formData, opening_line: e.target.value })} className="w-full bg-transparent border-b py-3 font-baskerville text-sm focus:outline-none" style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF' }} />
                <textarea placeholder="Full Content" value={formData.full_content} onChange={(e) => setFormData({ ...formData, full_content: e.target.value })} rows={8} className="w-full bg-transparent border py-3 px-4 font-baskerville text-sm focus:outline-none" style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF' }} />
                <select value={formData.publisher} onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} className="w-full bg-transparent border-b py-3 font-baskerville text-sm focus:outline-none" style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF', backgroundColor: '#1B2340' }}>
                  <option value="">No Publisher</option>
                  <option value="Ecliptica LLC">Ecliptica LLC</option>
                  <option value="James Stephan-Usypchuk">James Stephan-Usypchuk</option>
                  <option value="Cassandra Steele">Cassandra Steele</option>
                </select>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={formData.published} onChange={(e) => setFormData({ ...formData, published: e.target.checked })} className="w-4 h-4" style={{ accentColor: '#C9A84C' }} />
                  <span className="font-montserrat text-xs" style={{ color: '#FFFFFF' }}>Publish immediately</span>
                </label>
                <div className="flex gap-4">
                  <button type="submit" disabled={loading || generatingImage || uploadingImage} className="px-12 py-4 font-montserrat text-xs tracking-[0.25em] uppercase transition-all" style={{ backgroundColor: '#C9A84C', color: '#FFFFFF', opacity: (loading || generatingImage || uploadingImage) ? 0.7 : 1 }}>
                    {uploadingImage ? 'Uploading...' : generatingImage ? 'Generating Image...' : loading ? 'Saving...' : editingArticle ? 'Update' : 'Create'}
                  </button>
                  {editingArticle && (
                    <button type="button" onClick={() => { setEditingArticle(null); setUploadedImage(null); setFormData({ title: '', category: '', opening_line: '', full_content: '', publisher: '', published: false, created_at: '' }); }} className="px-12 py-4 font-montserrat text-xs tracking-[0.25em] uppercase border transition-all" style={{ borderColor: '#C9A84C', color: '#C9A84C' }}>Cancel</button>
                  )}
                </div>
              </div>
            </form>

            <div className="border" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
              <div className="grid grid-cols-6 gap-4 p-4 border-b" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
                {['TITLE', 'CATEGORY', 'DATE', 'PUBLISHER', 'STATUS', 'ACTIONS'].map((h) => (
                  <p key={h} className="font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>{h}</p>
                ))}
              </div>
              {articles.map((article) => (
                <div key={article.id} className="grid grid-cols-6 gap-4 p-4 border-b" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
                  <p className="font-baskerville text-sm" style={{ color: '#FFFFFF' }}>{article.title}</p>
                  <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{article.category || '-'}</p>
                  <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{new Date(article.created_at).toLocaleDateString()}</p>
                  <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{article.publisher || 'None'}</p>
                  <p className="font-montserrat text-xs" style={{ color: article.published ? '#10B981' : 'rgba(255, 255, 255, 0.5)' }}>{article.published ? 'Published' : 'Draft'}</p>
                  <div className="flex gap-2">
                    <button onClick={() => generateArticleImage(article.id, article.title, article.category || undefined)} style={{ color: article.image_url ? '#10B981' : '#C9A84C' }} disabled={generatingImage} title={article.image_url ? 'Regenerate image' : 'Generate image'}><Image size={16} /></button>
                    <button onClick={() => handleEdit(article)} style={{ color: '#C9A84C' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(article.id)} style={{ color: '#DC2626' }}><Trash2 size={16} /></button>
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
