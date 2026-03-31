import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Article } from '../lib/supabase';
import { LogOut, Plus, CreditCard as Edit2, Trash2, Image, Upload, Download, Search, ChevronDown, ChevronUp, X } from 'lucide-react';

type Section = 'dashboard' | 'member-tools' | 'content-engine' | 'newsletter' | 'lead-submissions';

interface LeadSubmission {
  id: string;
  created_at: string;
  form_type: string;
  source_page: string;
  source_section: string | null;
  name: string | null;
  email: string | null;
  business_name: string | null;
  role: string | null;
  company_size: string | null;
  revenue_range: string | null;
  industry: string | null;
  primary_goal: string | null;
  timeline: string | null;
  linkedin_url: string | null;
  scheduling_url: string | null;
  message: string | null;
  phone: string | null;
  metadata: Record<string, unknown> | null;
  status: string;
}

interface LeadFilters {
  formType: string;
  status: string;
  industry: string;
  revenueRange: string;
  timeline: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

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
    created_at: '',
  });
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [leads, setLeads] = useState<LeadSubmission[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [leadFilters, setLeadFilters] = useState<LeadFilters>({
    formType: '',
    status: '',
    industry: '',
    revenueRange: '',
    timeline: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });

  useEffect(() => {
    if (activeSection === 'newsletter') {
      fetchArticles();
    } else if (activeSection === 'lead-submissions') {
      fetchLeads();
    }
  }, [activeSection]);

  const fetchArticles = async () => {
    setFetchError(null);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setFetchError('Failed to load articles. Please try again.');
      return;
    }
    if (data) {
      setArticles(data);
    }
  };

  const fetchLeads = async () => {
    setLeadsLoading(true);
    setLeadsError(null);

    let query = supabase
      .from('lead_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadFilters.formType) {
      query = query.eq('form_type', leadFilters.formType);
    }
    if (leadFilters.status) {
      query = query.eq('status', leadFilters.status);
    }
    if (leadFilters.industry) {
      query = query.ilike('industry', `%${leadFilters.industry}%`);
    }
    if (leadFilters.revenueRange) {
      query = query.eq('revenue_range', leadFilters.revenueRange);
    }
    if (leadFilters.timeline) {
      query = query.eq('timeline', leadFilters.timeline);
    }
    if (leadFilters.dateFrom) {
      query = query.gte('created_at', leadFilters.dateFrom);
    }
    if (leadFilters.dateTo) {
      query = query.lte('created_at', `${leadFilters.dateTo}T23:59:59`);
    }
    if (leadFilters.search) {
      query = query.or(`name.ilike.%${leadFilters.search}%,email.ilike.%${leadFilters.search}%,business_name.ilike.%${leadFilters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      setLeadsError('Failed to load leads. Please try again.');
      setLeadsLoading(false);
      return;
    }

    setLeads(data || []);
    setLeadsLoading(false);
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    const { error } = await supabase
      .from('lead_submissions')
      .update({ status: newStatus })
      .eq('id', leadId);

    if (error) {
      console.error('Failed to update status:', error);
      return;
    }

    setLeads(leads.map(lead =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));
  };

  const exportLeadsToCSV = () => {
    const headers = [
      'Created At',
      'Form Type',
      'Source Page',
      'Name',
      'Email',
      'Business Name',
      'Role',
      'Company Size',
      'Revenue Range',
      'Industry',
      'Primary Goal',
      'Timeline',
      'LinkedIn URL',
      'Scheduling URL',
      'Message',
      'Status',
    ];

    const csvRows = [headers.join(',')];

    leads.forEach(lead => {
      const row = [
        lead.created_at,
        lead.form_type,
        lead.source_page,
        lead.name || '',
        lead.email || '',
        lead.business_name || '',
        lead.role || '',
        lead.company_size || '',
        lead.revenue_range || '',
        lead.industry || '',
        lead.primary_goal || '',
        lead.timeline || '',
        lead.linkedin_url || '',
        lead.scheduling_url || '',
        (lead.message || '').replace(/"/g, '""').replace(/\n/g, ' '),
        lead.status,
      ].map(val => `"${val}"`);
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lead_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setLeadFilters({
      formType: '',
      status: '',
      industry: '',
      revenueRange: '',
      timeline: '',
      dateFrom: '',
      dateTo: '',
      search: '',
    });
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      setUploadedImage(file);
    }
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

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
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-article-image`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, category }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to generate image');
      }

      const { imageUrl } = responseData;

      const { error } = await supabase
        .from('articles')
        .update({ image_url: imageUrl })
        .eq('id', articleId);

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
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }

      const articleData: any = {
        title: formData.title,
        category: formData.category || null,
        opening_line: formData.opening_line || null,
        full_content: formData.full_content || null,
        publisher: formData.publisher === '' ? null : formData.publisher,
        published: formData.published,
      };

      if (imageUrl) {
        articleData.image_url = imageUrl;
      }

      if (formData.created_at) {
        articleData.created_at = new Date(formData.created_at).toISOString();
      }

      let articleId: string;
      const titleForImage = formData.title;
      const categoryForImage = formData.category || undefined;
      const shouldGenerateImage = !uploadedImage && !editingArticle?.image_url;

      if (editingArticle) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingArticle.id);

        if (error) throw error;
        articleId = editingArticle.id;
      } else {
        const { data, error } = await supabase
          .from('articles')
          .insert([articleData])
          .select()
          .single();

        if (error) throw error;
        articleId = data.id;
      }

      setFormData({
        title: '',
        category: '',
        opening_line: '',
        full_content: '',
        publisher: '',
        published: false,
        created_at: '',
      });
      setEditingArticle(null);
      setUploadedImage(null);
      fetchArticles();

      if (shouldGenerateImage) {
        await generateArticleImage(articleId, titleForImage, categoryForImage);
      }
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
    setFormData({
      title: article.title,
      category: article.category || '',
      opening_line: article.opening_line || '',
      full_content: article.full_content || '',
      publisher: article.publisher || '',
      published: article.published,
      created_at: dateValue,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      setFetchError('Failed to delete article. Please try again.');
      return;
    }
    fetchArticles();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#3B82F6';
      case 'contacted': return '#F59E0B';
      case 'qualified': return '#10B981';
      case 'converted': return '#8B5CF6';
      case 'archived': return '#6B7280';
      default: return '#C9A84C';
    }
  };

  const getFormTypeLabel = (type: string) => {
    switch (type) {
      case 'demo_request': return 'Demo Request';
      case 'build_request': return 'Build Request';
      case 'contact': return 'Contact';
      case 'newsletter': return 'Newsletter';
      default: return type;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#1B2340' }}>
      <aside className="w-60 border-r flex-shrink-0" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
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
            onClick={() => setActiveSection('lead-submissions')}
            className="w-full text-left py-3 px-4 mb-2 font-cormorant text-lg transition-all"
            style={{
              color: activeSection === 'lead-submissions' ? '#C9A84C' : 'rgba(255, 255, 255, 0.7)',
              backgroundColor: activeSection === 'lead-submissions' ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
            }}
          >
            LEAD SUBMISSIONS
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

      <main className="flex-1 p-12 overflow-auto">
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

        {activeSection === 'lead-submissions' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-cormorant text-5xl" style={{ color: '#FFFFFF' }}>
                Lead Submissions
              </h1>
              <button
                onClick={exportLeadsToCSV}
                disabled={leads.length === 0}
                className="flex items-center gap-2 px-6 py-3 font-montserrat text-xs tracking-wider transition-all hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
              >
                <Download size={16} />
                EXPORT CSV
              </button>
            </div>

            <div className="border p-6 mb-8" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-cormorant text-xl" style={{ color: '#C9A84C' }}>Filters</h3>
                <button
                  onClick={clearFilters}
                  className="font-montserrat text-xs tracking-wider"
                  style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                  <input
                    type="text"
                    placeholder="Search name, email, business..."
                    value={leadFilters.search}
                    onChange={(e) => setLeadFilters({ ...leadFilters, search: e.target.value })}
                    className="w-full bg-transparent border py-2 pl-10 pr-3 font-baskerville text-sm focus:outline-none"
                    style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF' }}
                  />
                </div>

                <select
                  value={leadFilters.formType}
                  onChange={(e) => setLeadFilters({ ...leadFilters, formType: e.target.value })}
                  className="bg-transparent border py-2 px-3 font-baskerville text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF', backgroundColor: '#1B2340' }}
                >
                  <option value="">All Form Types</option>
                  <option value="demo_request">Demo Request</option>
                  <option value="build_request">Build Request</option>
                  <option value="contact">Contact</option>
                  <option value="newsletter">Newsletter</option>
                </select>

                <select
                  value={leadFilters.status}
                  onChange={(e) => setLeadFilters({ ...leadFilters, status: e.target.value })}
                  className="bg-transparent border py-2 px-3 font-baskerville text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF', backgroundColor: '#1B2340' }}
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="archived">Archived</option>
                </select>

                <select
                  value={leadFilters.revenueRange}
                  onChange={(e) => setLeadFilters({ ...leadFilters, revenueRange: e.target.value })}
                  className="bg-transparent border py-2 px-3 font-baskerville text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF', backgroundColor: '#1B2340' }}
                >
                  <option value="">All Revenue Ranges</option>
                  <option value="Under $1M">Under $1M</option>
                  <option value="$1M–$5M">$1M–$5M</option>
                  <option value="$5M–$10M">$5M–$10M</option>
                  <option value="$10M+">$10M+</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select
                  value={leadFilters.timeline}
                  onChange={(e) => setLeadFilters({ ...leadFilters, timeline: e.target.value })}
                  className="bg-transparent border py-2 px-3 font-baskerville text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF', backgroundColor: '#1B2340' }}
                >
                  <option value="">All Timelines</option>
                  <option value="Immediately">Immediately</option>
                  <option value="30–60 days">30–60 days</option>
                  <option value="Exploring">Exploring</option>
                </select>

                <input
                  type="text"
                  placeholder="Industry"
                  value={leadFilters.industry}
                  onChange={(e) => setLeadFilters({ ...leadFilters, industry: e.target.value })}
                  className="bg-transparent border py-2 px-3 font-baskerville text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF' }}
                />

                <input
                  type="date"
                  value={leadFilters.dateFrom}
                  onChange={(e) => setLeadFilters({ ...leadFilters, dateFrom: e.target.value })}
                  className="bg-transparent border py-2 px-3 font-baskerville text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF', backgroundColor: '#1B2340' }}
                  placeholder="From Date"
                />

                <input
                  type="date"
                  value={leadFilters.dateTo}
                  onChange={(e) => setLeadFilters({ ...leadFilters, dateTo: e.target.value })}
                  className="bg-transparent border py-2 px-3 font-baskerville text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF', backgroundColor: '#1B2340' }}
                  placeholder="To Date"
                />
              </div>

              <button
                onClick={fetchLeads}
                className="mt-4 px-8 py-2 font-montserrat text-xs tracking-wider transition-all hover:opacity-80"
                style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
              >
                APPLY FILTERS
              </button>
            </div>

            {leadsError && (
              <div className="mb-8 p-4 border" style={{ borderColor: '#DC2626', backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
                <p className="font-montserrat text-sm" style={{ color: '#DC2626' }}>{leadsError}</p>
              </div>
            )}

            {leadsLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="font-baskerville text-lg" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="flex items-center justify-center h-64 border" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
                <p className="font-baskerville text-lg" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No leads found</p>
              </div>
            ) : (
              <div className="border" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
                <div className="grid grid-cols-7 gap-4 p-4 border-b" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
                  <p className="font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>DATE</p>
                  <p className="font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>TYPE</p>
                  <p className="font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>NAME</p>
                  <p className="font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>BUSINESS</p>
                  <p className="font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>EMAIL</p>
                  <p className="font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>STATUS</p>
                  <p className="font-montserrat text-xs tracking-wider" style={{ color: '#C9A84C' }}>ACTIONS</p>
                </div>

                {leads.map((lead) => (
                  <div key={lead.id}>
                    <div
                      className="grid grid-cols-7 gap-4 p-4 border-b cursor-pointer hover:bg-white hover:bg-opacity-5 transition-all"
                      style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}
                      onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                    >
                      <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {new Date(lead.created_at).toLocaleDateString()}
                      </p>
                      <p className="font-baskerville text-sm" style={{ color: '#FFFFFF' }}>
                        {getFormTypeLabel(lead.form_type)}
                      </p>
                      <p className="font-baskerville text-sm truncate" style={{ color: '#FFFFFF' }}>
                        {lead.name || '-'}
                      </p>
                      <p className="font-baskerville text-sm truncate" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {lead.business_name || '-'}
                      </p>
                      <p className="font-baskerville text-sm truncate" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {lead.email || '-'}
                      </p>
                      <div>
                        <span
                          className="inline-block px-2 py-1 font-montserrat text-xs uppercase"
                          style={{ backgroundColor: `${getStatusColor(lead.status)}20`, color: getStatusColor(lead.status) }}
                        >
                          {lead.status}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {expandedLead === lead.id ? (
                          <ChevronUp size={16} style={{ color: '#C9A84C' }} />
                        ) : (
                          <ChevronDown size={16} style={{ color: '#C9A84C' }} />
                        )}
                      </div>
                    </div>

                    {expandedLead === lead.id && (
                      <div className="p-6 border-b" style={{ borderColor: 'rgba(201, 168, 76, 0.3)', backgroundColor: 'rgba(201, 168, 76, 0.05)' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div>
                            <p className="font-montserrat text-xs tracking-wider mb-1" style={{ color: '#C9A84C' }}>CONTACT INFO</p>
                            <p className="font-baskerville text-sm" style={{ color: '#FFFFFF' }}>{lead.name || '-'}</p>
                            <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{lead.email || '-'}</p>
                            <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{lead.phone || '-'}</p>
                          </div>
                          <div>
                            <p className="font-montserrat text-xs tracking-wider mb-1" style={{ color: '#C9A84C' }}>BUSINESS</p>
                            <p className="font-baskerville text-sm" style={{ color: '#FFFFFF' }}>{lead.business_name || '-'}</p>
                            <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{lead.role || '-'}</p>
                            <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{lead.industry || '-'}</p>
                          </div>
                          <div>
                            <p className="font-montserrat text-xs tracking-wider mb-1" style={{ color: '#C9A84C' }}>COMPANY DETAILS</p>
                            <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Size: {lead.company_size || '-'}</p>
                            <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Revenue: {lead.revenue_range || '-'}</p>
                            <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Timeline: {lead.timeline || '-'}</p>
                          </div>
                          <div>
                            <p className="font-montserrat text-xs tracking-wider mb-1" style={{ color: '#C9A84C' }}>GOAL</p>
                            <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{lead.primary_goal || '-'}</p>
                          </div>
                          <div>
                            <p className="font-montserrat text-xs tracking-wider mb-1" style={{ color: '#C9A84C' }}>LINKS</p>
                            {lead.linkedin_url && (
                              <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="block font-baskerville text-sm underline" style={{ color: '#C9A84C' }}>LinkedIn</a>
                            )}
                            {lead.scheduling_url && (
                              <a href={lead.scheduling_url} target="_blank" rel="noopener noreferrer" className="block font-baskerville text-sm underline" style={{ color: '#C9A84C' }}>Scheduling Link</a>
                            )}
                            {!lead.linkedin_url && !lead.scheduling_url && (
                              <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>No links provided</p>
                            )}
                          </div>
                          <div>
                            <p className="font-montserrat text-xs tracking-wider mb-1" style={{ color: '#C9A84C' }}>SOURCE</p>
                            <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{lead.source_page}</p>
                            <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{lead.source_section || '-'}</p>
                          </div>
                        </div>

                        {lead.message && (
                          <div className="mt-6">
                            <p className="font-montserrat text-xs tracking-wider mb-2" style={{ color: '#C9A84C' }}>MESSAGE</p>
                            <p className="font-baskerville text-sm whitespace-pre-wrap" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{lead.message}</p>
                          </div>
                        )}

                        {lead.metadata && Object.keys(lead.metadata).length > 0 && (
                          <div className="mt-6">
                            <p className="font-montserrat text-xs tracking-wider mb-2" style={{ color: '#C9A84C' }}>METADATA</p>
                            <p className="font-baskerville text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              {JSON.stringify(lead.metadata, null, 2)}
                            </p>
                          </div>
                        )}

                        <div className="mt-6 flex gap-2">
                          <p className="font-montserrat text-xs tracking-wider mr-2" style={{ color: '#C9A84C' }}>UPDATE STATUS:</p>
                          {['new', 'contacted', 'qualified', 'converted', 'archived'].map((status) => (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLeadStatus(lead.id, status);
                              }}
                              className="px-3 py-1 font-montserrat text-xs uppercase transition-all hover:opacity-80"
                              style={{
                                backgroundColor: lead.status === status ? getStatusColor(status) : 'transparent',
                                color: lead.status === status ? '#FFFFFF' : getStatusColor(status),
                                border: `1px solid ${getStatusColor(status)}`,
                              }}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="mt-4 font-montserrat text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Showing {leads.length} lead{leads.length !== 1 ? 's' : ''}
            </p>
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

            {fetchError && (
              <div className="mb-8 p-4 border" style={{ borderColor: '#DC2626', backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
                <p className="font-montserrat text-sm" style={{ color: '#DC2626' }}>{fetchError}</p>
              </div>
            )}

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

                <div>
                  <label className="block font-montserrat text-xs mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Article Image {!uploadedImage && '(Upload custom image or AI will generate one)'}
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-6 py-3 border cursor-pointer transition-all hover:bg-opacity-10 hover:bg-white"
                      style={{ borderColor: '#C9A84C', color: '#C9A84C' }}>
                      <Upload size={16} />
                      <span className="font-montserrat text-xs tracking-wider">
                        {uploadedImage ? 'Change Image' : 'Upload Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    {uploadedImage && (
                      <div className="flex items-center gap-2">
                        <span className="font-baskerville text-sm" style={{ color: '#FFFFFF' }}>
                          {uploadedImage.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setUploadedImage(null)}
                          className="font-montserrat text-xs"
                          style={{ color: '#DC2626' }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-montserrat text-xs mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Publish Date & Time {!formData.created_at && '(Leave empty for current date/time)'}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.created_at}
                    onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                    className="w-full bg-transparent border-b py-3 font-baskerville text-sm focus:outline-none"
                    style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#FFFFFF', backgroundColor: '#1B2340' }}
                  />
                </div>

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
                    disabled={loading || generatingImage || uploadingImage}
                    className="px-12 py-4 font-montserrat text-xs tracking-[0.25em] uppercase transition-all"
                    style={{ backgroundColor: '#C9A84C', color: '#FFFFFF', opacity: (loading || generatingImage || uploadingImage) ? 0.7 : 1 }}
                  >
                    {uploadingImage ? 'Uploading...' : generatingImage ? 'Generating Image...' : loading ? 'Saving...' : editingArticle ? 'Update' : 'Create'}
                  </button>
                  {editingArticle && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingArticle(null);
                        setUploadedImage(null);
                        setFormData({
                          title: '',
                          category: '',
                          opening_line: '',
                          full_content: '',
                          publisher: '',
                          published: false,
                          created_at: '',
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
                    <button
                      onClick={() => generateArticleImage(article.id, article.title, article.category || undefined)}
                      style={{ color: article.image_url ? '#10B981' : '#C9A84C' }}
                      disabled={generatingImage}
                      title={article.image_url ? 'Regenerate image' : 'Generate image'}
                    >
                      <Image size={16} />
                    </button>
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
