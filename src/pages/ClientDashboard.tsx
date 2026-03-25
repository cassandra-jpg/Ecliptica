import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function ClientDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5F0' }}>
      <header className="border-b p-6 flex justify-between items-center" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
        <div>
          <h1 className="font-cormorant text-4xl" style={{ color: '#1B2340' }}>
            Welcome, {profile?.full_name || 'Client'}
          </h1>
          <p className="font-montserrat text-xs mt-2" style={{ color: 'rgba(27, 35, 64, 0.6)' }}>
            Client Dashboard
          </p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 font-montserrat text-xs tracking-wider px-6 py-3 border transition-all"
          style={{ color: '#C9A84C', borderColor: '#C9A84C' }}
        >
          <LogOut size={16} />
          SIGN OUT
        </button>
      </header>

      <main className="p-12 max-w-6xl mx-auto">
        <section className="mb-16">
          <h2 className="font-montserrat text-xs tracking-[0.4em] uppercase mb-6" style={{ color: '#C9A84C' }}>
            YOUR PIPELINE
          </h2>
          <div className="border p-8 h-64 flex items-center justify-center" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
            <p className="font-cormorant text-2xl" style={{ color: 'rgba(27, 35, 64, 0.5)' }}>
              Pipeline visualization coming soon
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="font-montserrat text-xs tracking-[0.4em] uppercase mb-6" style={{ color: '#C9A84C' }}>
            YOUR TOOLS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className="border p-6 h-40 flex items-center justify-center"
                style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}
              >
                <p className="font-cormorant text-xl" style={{ color: 'rgba(27, 35, 64, 0.5)' }}>
                  Tool {num}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-montserrat text-xs tracking-[0.4em] uppercase mb-6" style={{ color: '#C9A84C' }}>
            YOUR DOCUMENTS
          </h2>
          <div className="border p-8 h-64 flex items-center justify-center" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
            <p className="font-cormorant text-2xl" style={{ color: 'rgba(27, 35, 64, 0.5)' }}>
              Document management coming soon
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
