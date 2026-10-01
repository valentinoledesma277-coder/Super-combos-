import { supabase } from '../utils/supabase/client';
import { Order, OrderItem, OrderStatus } from '../types';

const LOCAL_STORAGE_KEY = 'super_combos_orders';

function getLocalOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: Order[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
  }
}

export async function createOrder(
  orderData: Omit<Order, 'id' | 'created_at' | 'status'>,
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>
): Promise<Order> {
  const newOrder: Order = {
    ...orderData,
    id: `ORD-${Date.now().toString().slice(-6)}`,
    status: 'PENDIENTE',
    created_at: new Date().toISOString(),
    items: items.map(i => ({
      ...i,
      subtotal: i.quantity * i.unit_price,
    })),
  };

  try {
    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: orderData.customer_name,
          phone: orderData.phone,
          address: orderData.address,
          neighborhood: orderData.neighborhood,
          notes: orderData.notes || '',
          payment_method: orderData.payment_method,
          delivery_method: orderData.delivery_method,
          subtotal: orderData.subtotal,
          delivery_cost: orderData.delivery_cost,
          total: orderData.total,
          status: 'PENDIENTE',
        },
      ])
      .select()
      .single();

    if (!orderError && orderResult) {
      if (items.length > 0) {
        await supabase.from('order_items').insert(
          items.map(item => ({
            order_id: orderResult.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.quantity * item.unit_price,
          }))
        );
      }
      return {
        ...orderResult,
        items: newOrder.items,
      };
    }
  } catch (err) {
    console.warn('Supabase order insert fallback to local storage:', err);
  }

  const current = getLocalOrders();
  saveLocalOrders([newOrder, ...current]);
  return newOrder;
}

export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return (data as any[]).map(o => ({
        ...o,
        items: o.order_items || [],
      })) as Order[];
    }
  } catch (err) {
    console.warn('Supabase getOrders fallback to local storage:', err);
  }

  return getLocalOrders();
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (!error) return true;
  } catch (err) {
    console.warn('Supabase updateOrderStatus fallback to local storage:', err);
  }

  const current = getLocalOrders();
  const index = current.findIndex(o => o.id === orderId);
  if (index !== -1) {
    current[index].status = status;
    saveLocalOrders(current);
    return true;
  }
  return false;
}

export const STORE_WHATSAPP_NUMBER = '5493757608007';
export const STORE_WHATSAPP_FORMATTED = '+54 9 3757 60-8007';

/**
 * Builds clean WhatsApp URL directly from cart items without requiring customer form inputs.
 * Prominently includes the names of all ordered combos and their contents.
 */
export function buildCartWhatsAppUrl(
  items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    unit?: string;
    type?: 'product' | 'combo';
    items_summary?: string[];
  }>,
  subtotal: number,
  deliveryCost: number,
  total: number,
  deliveryMethod: string = 'domicilio',
  whatsappNumber?: string
): string {
  const phone =
    whatsappNumber ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WHATSAPP_NUMBER) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WHATSAPP_NUMBER) ||
    STORE_WHATSAPP_NUMBER;

  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const combos = items.filter(i => i.type === 'combo');
  const products = items.filter(i => i.type !== 'combo');

  const sections: string[] = [];

  if (combos.length > 0) {
    const combosText = combos
      .map((c, idx) => {
        let line = ` ${idx + 1}. ⭐ *${c.quantity}x ${c.name.toUpperCase()}* - $${(
          c.quantity * c.unit_price
        ).toLocaleString('es-AR')}`;
        if (c.items_summary && c.items_summary.length > 0) {
          line += `\n    └ *Contenido:* ${c.items_summary.join(', ')}`;
        }
        return line;
      })
      .join('\n\n');

    sections.push(`📦 *SUPER COMBOS ENCARGADOS:*\n${combosText}`);
  }

  if (products.length > 0) {
    const prodsText = products
      .map(
        (p, idx) =>
          ` ${idx + 1}. • *${p.quantity}x* ${p.name}${p.unit ? ` (${p.unit})` : ''} - $${(
            p.quantity * p.unit_price
          ).toLocaleString('es-AR')}`
      )
      .join('\n');

    sections.push(`🛒 *PRODUCTOS INDIVIDUALES:*\n${prodsText}`);
  }

  const itemsList = sections.join('\n\n------------------------------\n');

  const deliveryText =
    deliveryMethod === 'retiro'
      ? '🏬 *Retiro en el local* (Gratis)'
      : `🛵 *Envío a domicilio* ${
          deliveryCost > 0
            ? `(+$${deliveryCost.toLocaleString('es-AR')})`
            : '(¡Envío Gratis!)'
        }`;

  const message = `👋 ¡Hola *Super Combos*! Quiero realizar el siguiente pedido desde la web:

${itemsList}

------------------------------
💰 *Subtotal:* $${subtotal.toLocaleString('es-AR')}
🛵 *Entrega:* ${deliveryText}
💵 *TOTAL A PAGAR:* $${total.toLocaleString('es-AR')}
------------------------------

📍 *Datos para la entrega:*
(Te paso la dirección y forma de pago por acá)

¡Muchas gracias! Aguardo confirmación.`;

  const encoded = encodeURIComponent(message);
  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;
}

/**
 * Builds clean WhatsApp URL with structured order summary
 */
export function buildWhatsAppOrderUrl(order: Order, whatsappNumber?: string): string {
  const phone =
    whatsappNumber ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WHATSAPP_NUMBER) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WHATSAPP_NUMBER) ||
    STORE_WHATSAPP_NUMBER;

  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const itemsList = (order.items || [])
    .map(i => `  • ${i.quantity}x ${i.product_name} - $${i.subtotal.toLocaleString('es-AR')}`)
    .join('\n');

  const paymentText =
    order.payment_method === 'efectivo'
      ? 'Efectivo contra entrega'
      : order.payment_method === 'transferencia'
      ? 'Transferencia bancaria'
      : 'Otro';

  const deliveryText =
    order.delivery_method === 'domicilio'
      ? `Envío a domicilio (${order.address}, ${order.neighborhood})`
      : 'Retiro en el local';

  const message = `👋 ¡Hola Super Combos! Acabo de hacer un pedido desde la tienda:

📦 *PEDIDO #${order.id}*
👤 *Cliente:* ${order.customer_name}
📞 *Teléfono:* ${order.phone}

🛒 *PRODUCTOS:*
${itemsList}

💰 *Subtotal:* $${order.subtotal.toLocaleString('es-AR')}
🚚 *Envío:* ${order.delivery_cost > 0 ? `$${order.delivery_cost.toLocaleString('es-AR')}` : '¡GRATIS!'}
💵 *TOTAL:* $${order.total.toLocaleString('es-AR')}

📍 *Entrega:* ${deliveryText}
💳 *Método de pago:* ${paymentText}
${order.notes ? `📝 *Observaciones:* ${order.notes}\n` : ''}
¡Muchas gracias! Aguardo confirmación.`;

  const encoded = encodeURIComponent(message);
  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;
}
