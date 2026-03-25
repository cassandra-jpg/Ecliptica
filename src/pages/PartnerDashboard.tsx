import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function PartnerDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1B2340' }}>
      <header className="border-b p-6 flex justify-between items-center" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
        <div>
          <h1 className="font-cormorant text-4xl" style={{ color: '#FFFFFF' }}>Welcome, {profile?.full_name || 'Partner'}</h1>
          <p className="font-montserrat text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Partner Dashboard</p>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 font-montserrat text-xs tracking-wider px-6 py-3 border transition-all" style={{ color: '#C9A84C', borderColor: '#C9A84C' }}>
          <LogOut size={16} />
          SIGN OUT
        </button>
      </header>
      <main className="p-12 max-w-6xl mx-auto">
        <section className="mb-16">
          <h2 className="font-montserrat text-xs tracking-[0.4em] uppercase mb-6" style={{ color: '#C9A84C' }}>PARTNERSHIP OVERVIEW</h2>
          <div className="border p-8 h-64 flex items-center justify-center" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
            <p className="font-cormorant text-2xl" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Partnership metrics and overview coming soon</p>
          </div>
        </section>
        <section className="mb-16">
          <h2 className="font-montserrat text-xs tracking-[0.4em] uppercase mb-6" style={{ color: '#C9A84C' }}>RELEVANT RESOURCES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="border p-6 h-48 flex items-center justify-center" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
                <p className="font-cormorant text-xl" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Resource {num}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-montserrat text-xs tracking-[0.4em] uppercase mb-6" style={{ color: '#C9A84C' }}>YOUR ACTIVITY</h2>
          <div className="border p-8 h-64 flex items-center justify-center" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
            <p className="font-cormorant text-2xl" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Activity tracking coming soon</p>
          </div>
        </section>
      </main>
    </div>
  );
}
