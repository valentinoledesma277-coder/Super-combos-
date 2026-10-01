import React, { useState } from 'react';
import { CartItem, DeliveryMethod } from '../types';
import { X, Trash2, Plus, Minus, Bike, Store, MessageCircle, Check, ArrowRight } from 'lucide-react';
import { buildCartWhatsAppUrl, createOrder } from '../services/orders';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedToCheckout?: () => void;
  deliveryMethod: DeliveryMethod;
  onChangeDeliveryMethod: (method: DeliveryMethod) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  deliveryMethod,
  onChangeDeliveryMethod,
}) => {
  const [redirecting, setRedirecting] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  
  // Shipping rule: $1500 standard delivery, free for orders above $30.000, $0 for pickup
  const freeShippingThreshold = 30000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const deliveryCost = deliveryMethod === 'retiro' ? 0 : isFreeShipping ? 0 : 1500;
  const total = subtotal + deliveryCost;

  const handleCheckoutToWhatsApp = () => {
    if (cart.length === 0) return;

    setRedirecting(true);

    // Format items for WhatsApp message with combo metadata
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
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#25D366', '#FFE500', '#B7FF00'],
      });
    } catch {}

    // Record order in background for Admin panel without blocking user
    createOrder(
      {
        customer_name: 'Cliente WhatsApp',
        phone: 'WhatsApp Web',
        address: deliveryMethod === 'domicilio' ? 'A coordinar por WhatsApp' : 'Retiro en sucursal',
        neighborhood: deliveryMethod === 'domicilio' ? 'A coordinar' : 'Local Central',
        notes: 'Pedido directo por WhatsApp sin formulario previo',
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

    // Redirect directly to WhatsApp with pre-composed message
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setRedirecting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0a0a0a] border-l border-[#222] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-[#1f1f1f] flex items-center justify-between bg-[#0e0e0e]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#FFE500] text-black flex items-center justify-center font-black">
                🛒
              </div>
              <div>
                <h3 className="font-black text-lg text-white uppercase tracking-tight">Tu Carrito</h3>
                <p className="text-xs text-zinc-400">
                  {cart.length === 0 ? 'Vacío' : `${cart.length} item(s) seleccionados`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-[#1c1c1c] transition-colors cursor-pointer"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="text-6xl animate-bounce">🥬</div>
                <h4 className="text-lg font-black text-white">Tu carrito está vacío</h4>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Agregá frutas, verduras, carnes o nuestros Super Combos para comenzar tu pedido.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#FFE500] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#B7FF00] transition-colors cursor-pointer"
                >
                  Explorar la Tienda
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
                  <span>Productos agregados</span>
                  <button
                    onClick={onClearCart}
                    className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vaciar</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#121212] border border-[#222] rounded-2xl p-3 flex items-center gap-3"
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.item.image_url}
                        alt={item.item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-zinc-800"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-extrabold text-sm text-white truncate">
                          {item.item.name}
                        </h5>
                        <div className="text-xs text-[#FFE500] font-black mt-0.5">
                          ${item.unit_price.toLocaleString('es-AR')}
                          {item.type === 'product' && (item.item as any).unit && (
                            <span className="text-[10px] text-zinc-400 font-normal ml-1">
                              /{(item.item as any).unit}
                            </span>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                              aria-label="Restar uno"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black text-white px-2 min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                              aria-label="Sumar uno"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-white block">
                              ${(item.quantity * item.unit_price).toLocaleString('es-AR')}
                            </span>
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-[10px] text-red-400 hover:text-red-300 font-bold cursor-pointer"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Method Toggle in Cart */}
                <div className="bg-[#141414] border border-[#222] rounded-2xl p-3.5 space-y-2 mt-4">
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-wider block">
                    Forma de entrega:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onChangeDeliveryMethod('domicilio')}
                      className={`p-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        deliveryMethod === 'domicilio'
                          ? 'border-[#FFE500] bg-[#22200a] text-[#FFE500]'
                          : 'border-[#262626] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      <span>A Domicilio</span>
                    </button>
                    <button
                      onClick={() => onChangeDeliveryMethod('retiro')}
                      className={`p-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        deliveryMethod === 'retiro'
                          ? 'border-[#FFE500] bg-[#22200a] text-[#FFE500]'
                          : 'border-[#262626] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>Retiro Local</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Direct WhatsApp Action */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#1f1f1f] bg-[#0e0e0e] space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">${subtotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span className="flex items-center gap-1">
                    <span>Envío</span>
                    {deliveryMethod === 'domicilio' && isFreeShipping && (
                      <span className="text-[10px] bg-[#B7FF00]/15 text-[#B7FF00] font-black px-1.5 py-0.5 rounded">
                        ¡GRATIS!
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-white">
                    {deliveryCost === 0 ? 'Gratis' : `$${deliveryCost.toLocaleString('es-AR')}`}
                  </span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-[#222] font-black">
                  <span className="text-white">TOTAL</span>
                  <span className="text-xl text-[#FFE500]">${total.toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* DIRECT WHATSAPP PURCHASE BUTTON - NO FORMS REQUIRED */}
              <button
                onClick={handleCheckoutToWhatsApp}
                disabled={redirecting}
                className="w-full py-4 px-4 bg-[#25D366] hover:bg-[#20ba59] disabled:bg-zinc-700 text-black font-black text-sm sm:text-base uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(37,211,102,0.4)] transition-all cursor-pointer active:scale-95"
              >
                {redirecting ? (
                  <>
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>¡ABRIENDO WHATSAPP...!</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-6 h-6 fill-black" />
                    <span>PEDIR POR WHATSAPP</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-zinc-400 text-center font-medium">
                ⚡ <strong className="text-zinc-300">Sin formularios ni registros.</strong> Tu pedido se abre directamente en WhatsApp con la lista de productos y el total listo para enviar.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
