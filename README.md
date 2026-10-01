# Super Combos | Fresco en tu Casa 🛵🥦🥩

Tienda online completa y funcional para **Super Combos - Fresco en tu Casa**. Desarrollada con React, TypeScript, Tailwind CSS, `@supabase/supabase-js` y `@supabase/ssr`.

---

## 🎨 Identidad Visual y Paleta

Inspirada directamente en el logo oficial:
- **Negro:** `#050505` (Fondo y contrastes)
- **Amarillo:** `#FFE500` (Call-to-actions, marca y precios)
- **Verde Lima:** `#B7FF00` (Frescura, badges y acentos)
- **Blanco:** `#FFFFFF` (Lectura y nitidez)

---

## 🚀 Características Principales

1. **🔥 Super Combos:** Paquetes familiares, parrilleros, de frutas, verduras, pollo y completos con detalle de productos incluidos y cálculo de ahorro.
2. **🥬 Categorías Especializadas:**
   - 🥬 Verdulería
   - 🍎 Frutería
   - 🥩 Carnes
   - 🍗 Pollería
   - 🧀 Fiambrería
   - 🔥 Super Combos
3. **🔍 Buscador & Filtros Dinámicos:** Búsqueda en tiempo real por nombre/descripción, ordenamiento (precio, alfabético, destacados) y filtros de ofertas y stock.
4. **🛒 Carrito y Checkout Completo:**
   - Selección de Envío a Domicilio vs Retiro en Local.
   - Cálculo dinámico de costo de entrega y envío gratuito.
   - Métodos de pago: Efectivo contra entrega, Transferencia bancaria o Mercado Pago/Otro.
   - Confirmación con confetti y enlace directo a **WhatsApp** preformateando el resumen del pedido.
5. **🛡️ Panel de Administración Seguro (`/admin`):**
   - **Autenticación real mediante Supabase Auth** (`supabase.auth.signInWithPassword()`).
   - Sin contraseñas en código, commits o frontend.
   - Validación de perfil con rol `admin` en la tabla `profiles`.
   - Gestión completa de Productos, Super Combos, Categorías, Ofertas y Pedidos.
   - Transiciones de estado de pedido (PENDIENTE, CONFIRMADO, PREPARANDO, EN CAMINO, ENTREGADO, CANCELADO).
   - Subida de imágenes a Supabase Storage bucket `product-images`.

---

## ⚙️ Variables de Entorno

Crear el archivo `.env` o `.env.local`:

```env
# Supabase Project Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lazxzjumhxpetfmfbene.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_5iZSMHPpWl4lu-H5BdTKpg_kZmrbc2T
VITE_SUPABASE_URL=https://lazxzjumhxpetfmfbene.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_5iZSMHPpWl4lu-H5BdTKpg_kZmrbc2T
VITE_SUPABASE_ANON_KEY=sb_publishable_5iZSMHPpWl4lu-H5BdTKpg_kZmrbc2T

# WhatsApp del Comercio (opcional, ej: 5491122334455)
NEXT_PUBLIC_WHATSAPP_NUMBER=
VITE_WHATSAPP_NUMBER=
```

---

## 🗄️ Base de Datos & SQL en Supabase

El archivo `supabase/schema.sql` contiene la definición completa de:
- Tablas: `categories`, `products`, `combos`, `combo_items`, `orders`, `order_items`, `profiles`
- Índices de rendimiento
- Row Level Security (RLS) policies con `auth.uid()`
- Trigger automático de creación de perfil al registrarse en `auth.users`
- Storage bucket `product-images` y sus políticas

### Ejecución:
1. Abrí tu panel de Supabase en [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Seleccioná el proyecto `lazxzjumhxpetfmfbene`.
3. Ingresá en el menú **SQL Editor** -> **New query**.
4. Copiá y pegá el contenido de `supabase/schema.sql` y ejecutá **Run**.

---

## 🔐 Creación de la Cuenta Administradora en Supabase Auth

Por estrictos estándares de seguridad, **no existen contraseñas en el código fuente**. La autenticación la maneja Supabase Auth.

Para crear o configurar tu usuario administrador:

1. En el panel de Supabase, andá a **Authentication** -> **Users** -> **Add user** -> **Create user**.
2. Ingresá el correo electrónico (ej: `admin@supercombos.com`) y una contraseña segura.
3. Copiá el `User UID` generado.
4. En el **SQL Editor** ejecutá:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id = 'PEGAR_AQUI_EL_USER_UID';
   ```
5. ¡Listo! Ahora podés iniciar sesión desde `/admin/login`.

---

## 📦 Comandos de Ejecución

Instalación de dependencias:
```bash
npm install
```

Ejecución en desarrollo:
```bash
npm run dev
```

Compilación para producción:
```bash
npm run build
```
