import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Truck, 
  Users, 
  BarChart3, 
  ShieldCheck,
  Database,
  Code2,
  RefreshCw
} from 'lucide-react';

const ModuleCard = ({ number, title, description, Icon }) => (
  <div className="border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-300 bg-white group">
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-[#047857] p-2 text-white">
        <Icon size={18} />
      </div>
      <span className="text-[10px] font-black text-[#047857] tracking-widest uppercase">Module {number}</span>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
  </div>
);

const SpecCard = ({ title, description, Icon }) => (
  <div className="border border-gray-200 p-8 bg-white">
    <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed mb-6">{description}</p>
    {/* Optional link or more info could go here */}
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-[#047857] selection:text-white">
      {/* Top Header Label */}
      <div className="p-8 pb-0">
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-500">System Overview</span>
      </div>

      {/* Hero Section */}
      <section className="px-8 pt-32 pb-48 flex flex-col items-center text-center">
        <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight leading-[1.1]">
          Full-Stack Inventory<br />Control
        </h1>
        <p className="max-w-2xl text-lg text-gray-500 leading-relaxed mb-12">
          A comprehensive system for tracking product lifecycles, warehouse logistics, and real-time stock analytics. Engineered for precision and operational speed.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => navigate('/register')}
            className="bg-[#047857] text-white px-10 py-4 text-xs font-black tracking-widest uppercase hover:bg-[#059669] transition-all duration-300"
          >
            Initialize System
          </button>

          <button className="px-10 py-4 text-xs font-black tracking-widest uppercase hover:bg-gray-50 transition-all duration-300">
            Read Documentation
          </button>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="bg-gray-50/50 border-t border-b border-gray-100 py-24 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <ModuleCard 
            number="01" 
            title="Inventory & Products" 
            description="SKU management, barcode integration, and real-time tracking across distributed networks."
            Icon={Package}
          />
          <ModuleCard 
            number="02" 
            title="Purchase & Sales" 
            description="Order processing, automated invoicing, and transaction ledger synchronization."
            Icon={ShoppingCart}
          />
          <ModuleCard 
            number="03" 
            title="Warehouse Logistics" 
            description="Multi-location bin mapping, shelf management, and optimized picking routes."
            Icon={Truck}
          />
          <ModuleCard 
            number="04" 
            title="Supplier Portal" 
            description="Vendor profiles, procurement history, and automated restock signaling."
            Icon={Users}
          />
          <ModuleCard 
            number="05" 
            title="Analytics Core" 
            description="High-density data visualization, stock aging reports, and predictive velocity metrics."
            Icon={BarChart3}
          />
          <ModuleCard 
            number="06" 
            title="Admin Control" 
            description="Granular role-based access, system audit logs, and security protocol management."
            Icon={ShieldCheck}
          />
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-32 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black text-[#047857] tracking-[0.2em] uppercase mb-4 block">Technical Specifications</span>
            <h2 className="text-4xl font-bold text-gray-900">Core System Samples</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3">
            <SpecCard 
              title="Database Architecture" 
              description="A highly optimized, robust relational schema ensuring transactional integrity. Designed for massive scalability, rapid query execution, and seamless data normalization."
              Icon={Database}
            />
            <SpecCard 
              title="API Documentation" 
              description="Comprehensive RESTful endpoints enabling secure, standardized third-party integrations. Built with developer-friendly request/response contracts and clear authentication flows."
              Icon={Code2}
            />
            <SpecCard 
              title="Real-time Syncing" 
              description="Bi-directional WebSocket pipelines and intelligent polling mechanisms delivering live operational dashboard updates with microsecond latency."
              Icon={RefreshCw}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-16 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black tracking-tighter">IMS_Project</span>
          <div className="flex gap-6">
            <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Project Documentation</button>
            <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Technical Stack</button>
          </div>
        </div>
        <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
          © 2026 IMS_Core Systems. Operator_V1.0.0
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
