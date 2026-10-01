import React from 'react';
import { Bike, Sparkles, ShieldCheck, Wallet, Clock, HeartHandshake } from 'lucide-react';

export const DeliveryBenefits: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-[#080808] border-t border-[#1c1c1c] relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-80 h-80 bg-[#B7FF00]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#B7FF00] bg-[#141414] px-3.5 py-1 rounded-md border border-[#222]">
            CONFIANZA Y AGILIDAD
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            ¿POR QUÉ ELEGIR <span className="text-[#FFE500]">SUPER COMBOS</span>?
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Llevamos el sabor y la frescura de la verdulería, carnicería y fiambrería de barrio directo a tu heladera.
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-[#0f0f0f] border-2 border-[#222] hover:border-[#FFE500] p-6 rounded-3xl transition-all duration-300 group shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-[#FFE500]/15 border border-[#FFE500]/30 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🛵
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-[#FFE500] transition-colors mb-2 uppercase">
              Motos de Reparto
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Nuestra flota de motos amarillas entrega tu pedido en tiempo récord, cuidando cada paquete con aislamiento térmico.
            </p>
          </div>

          <div className="bg-[#0f0f0f] border-2 border-[#222] hover:border-[#B7FF00] p-6 rounded-3xl transition-all duration-300 group shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-[#B7FF00]/15 border border-[#B7FF00]/30 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🥬
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-[#B7FF00] transition-colors mb-2 uppercase">
              100% Fresco de Campo
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Seleccionamos frutas, verduras y carnes a primera hora cada mañana. Sin intermediarios ni productos guardados.
            </p>
          </div>

          <div className="bg-[#0f0f0f] border-2 border-[#222] hover:border-[#FFE500] p-6 rounded-3xl transition-all duration-300 group shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-[#FFE500]/15 border border-[#FFE500]/30 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              💵
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-[#FFE500] transition-colors mb-2 uppercase">
              Pagos Flexibles
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Aboná en efectivo cuando recibís tu pedido en la puerta o por transferencia bancaria directa sin recargos.
            </p>
          </div>

          <div className="bg-[#0f0f0f] border-2 border-[#222] hover:border-[#B7FF00] p-6 rounded-3xl transition-all duration-300 group shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-[#B7FF00]/15 border border-[#B7FF00]/30 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              💬
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-[#B7FF00] transition-colors mb-2 uppercase">
              Atención por WhatsApp
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Confirmación inmediata de tu pedido y seguimiento en vivo con personas reales que te atienden como en el barrio.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
