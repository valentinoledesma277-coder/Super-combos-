import React, { useState } from 'react';
import { CartItem, DeliveryMethod } from '../types';
import { buildCartWhatsAppUrl, createOrder } from '../services/orders';
import { ArrowLeft, Bike, Store, MessageCircle, ShieldCheck, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutViewProps {
  cart: CartItem[];
  deliveryMethod: DeliveryMethod;
  onChangeDeliveryMethod: (m: DeliveryMethod) => void;
  onOrderCompleted: () => void;
  onBackToStore: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  deliveryMethod,
  onChangeDeliveryMethod,
  onOrderCompleted,
  onBackToStore,
}) => {
  const [redirecting, setRedirecting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const freeShippingThreshold = 30000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const deliveryCost = deliveryMethod === 'retiro' ? 0 : isFreeShipping ? 0 : 1500;
  const total = subtotal + deliveryCost;

  const handleSendToWhatsApp = () => {
    if (cart.length === 0) return;

    setRedirecting(true);

    const formattedItems = cart.map(item => ({
      name: item.item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      unit: item.type === 'product' ? (item.item as any).unit : undefined,
      type: item.type,
      items_summary: item.type === 'combo' ? (item.item as any).items_summary : undefined,
    }));

    const whatsappUrl = buildCartWhatsAppUrl(
      formattedItems,
      subtotal,
      deliveryCost,
      total,
      deliveryMethod
    );

    // Confetti celebration
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#25D366', '#FFE500', '#B7FF00'],
      });
    } catch {}

    // Record order in background
    createOrder(
      {
        customer_name: 'Cliente WhatsApp',
        phone: 'WhatsApp Web',
        address: deliveryMethod === 'domicilio' ? 'A coordinar por WhatsApp' : 'Retiro en sucursal',
        neighborhood: deliveryMethod === 'domicilio' ? 'A coordinar' : 'Local Central',
        notes: 'Pedido directo a WhatsApp sin formularios',
        payment_method: 'efectivo',
        delivery_method: deliveryMethod,
        subtotal,
        delivery_cost: deliveryCost,
        total,
      },
      cart.map(i => ({
        product_id: i.id,
        product_name: i.item.name,
        quantity: i.quantity,
        unit_price: i.unit_price,
      }))
    ).catch(err => console.warn('Background order record:', err));

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setRedirecting(false);
      onOrderCompleted();
    }, 600);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
        <div className="bg-[#0e0e0e] border border-[#222] rounded-3xl p-8 max-w-md space-y-4">
          <div className="text-5xl">🛒</div>
          <h2 className="text-xl font-black text-white">Tu carrito está vacío</h2>
          <p className="text-xs text-zinc-400">
            Agregá productos o combos a tu compra para enviar tu pedido por WhatsApp.
          </p>
          <button
            onClick={onBackToStore}
            className="px-5 py-2.5 bg-[#FFE500] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#B7FF00] transition-colors cursor-pointer"
          >
            Volver a la Tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation */}
        <button
          onClick={onBackToStore}
          className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Seguir comprando</span>
        </button>

        {/* Card Container */}
        <div className="bg-[#0d0d0d] border-2 border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          {/* Header */}
          <div className="text-center space-y-2 pb-4 border-b border-[#1f1f1f]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/15 text-[#25D366] text-xs font-black uppercase tracking-wider border border-[#25D366]/30">
              <MessageCircle className="w-3.5 h-3.5 fill-[#25D366]" />
              <span>PEDIDO DIRECTO A WHATSAPP</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              FINALIZAR <span className="text-[#FFE500]">TU COMPRA</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300">
              Sin formularios extensos. Al presionar el botón se abrirá WhatsApp con el mensaje estructurado de tu pedido listo para enviar.
            </p>
          </div>

          {/* Entrega Toggle */}
          <div className="space-y-2">
            <span className="text-xs font-black text-zinc-400 uppercase tracking-wider block">
              Forma de Entrega:
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChangeDeliveryMethod('domicilio')}
                className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                  deliveryMethod === 'domicilio'
                    ? 'border-[#FFE500] bg-[#1a1805] text-[#FFE500]'
                    : 'border-[#262626] bg-[#141414] text-zinc-400 hover:text-white'
                }`}
              >
                <Bike className="w-5 h-5 mb-1" />
                <span className="font-black text-xs uppercase block">A Domicilio</span>
                <span className="text-[10px] text-zinc-400">
                  {deliveryCost === 0 ? '¡Envío Gratis!' : `$${deliveryCost.toLocaleString('es-AR')}`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onChangeDeliveryMethod('retiro')}
                className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                  deliveryMethod === 'retiro'
                    ? 'border-[#FFE500] bg-[#1a1805] text-[#FFE500]'
                    : 'border-[#262626] bg-[#141414] text-zinc-400 hover:text-white'
                }`}
              >
                <Store className="w-5 h-5 mb-1" />
                <span className="font-black text-xs uppercase block">Retiro en Local</span>
                <span className="text-[10px] text-zinc-400">Sin costo de envío</span>
              </button>
            </div>
          </div>

          {/* Products Summary Box */}
          <div className="bg-[#121212] rounded-2xl p-4 border border-[#222] space-y-3">
            <div className="flex justify-between items-center text-xs font-black uppercase text-zinc-400 border-b border-[#222] pb-2">
              <span>Productos en tu pedido ({cart.length})</span>
              <span>Subtotal</span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 text-xs">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.item.image_url}
                      alt={item.item.name}
                      className="w-9 h-9 rounded-lg object-cover bg-zinc-800 shrink-0"
                    />
                    <div className="truncate">
                      <span className="font-bold text-white block truncate">{item.item.name}</span>
                      <span className="text-[11px] text-zinc-400">
                        {item.quantity} x ${item.unit_price.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                  <span className="font-black text-[#FFE500] shrink-0 ml-2">
                    ${(item.quantity * item.unit_price).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#222] pt-3 space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold text-white">${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío ({deliveryMethod === 'domicilio' ? 'A Domicilio' : 'Retiro'}):</span>
                <span className="font-bold text-white">
                  {deliveryCost === 0 ? '¡Gratis!' : `$${deliveryCost.toLocaleString('es-AR')}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-[#222]">
                <span>TOTAL A PAGAR:</span>
                <span className="text-xl text-[#FFE500]">${total.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>

          {/* Big WhatsApp Action Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSendToWhatsApp}
              disabled={redirecting}
              className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-base uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(37,211,102,0.4)] transition-all cursor-pointer active:scale-95"
            >
              {redirecting ? (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>¡ABRIENDO WHATSAPP...!</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-6 h-6 fill-black" />
                  <span>ENVIAR PEDIDO POR WHATSAPP</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 text-center">
              <ShieldCheck className="w-4 h-4 text-[#B7FF00] shrink-0" />
              <span>Atención personalizada e inmediata de nuestro equipo</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
