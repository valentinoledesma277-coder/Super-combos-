import React, { useState, useEffect } from 'react';
import { Product, Combo, Category, CartItem, DeliveryMethod, Profile } from './types';
import { getProducts } from './services/products';
import { getCombos } from './services/combos';
import { getCategories } from './services/categories';
import { checkCurrentAdmin } from './services/auth';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoriesSection } from './components/CategoriesSection';
import { OffersSection } from './components/OffersSection';
import { SuperCombosSection } from './components/SuperCombosSection';
import { CombosShowcase } from './components/CombosShowcase';
import { ProductCatalog } from './components/ProductCatalog';
import { DeliveryBenefits } from './components/DeliveryBenefits';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutView } from './components/CheckoutView';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  // Current view: 'store' | 'checkout' | 'admin-login' | 'admin-dashboard'
  const [view, setView] = useState<'store' | 'checkout' | 'admin-login' | 'admin-dashboard'>('store');
  
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart state with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('super_combos_cart');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('domicilio');

  // Navigation & Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Admin session state
  const [adminUser, setAdminUser] = useState<any>(null);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('super_combos_cart', JSON.stringify(cart));
  }, [cart]);

  // Load store data
  const fetchStoreData = async () => {
    setLoading(true);
    try {
      const [prods, cmbs, cats] = await Promise.all([
        getProducts({ onlyActive: true }),
        getCombos(true),
        getCategories(true),
      ]);
      setProducts(prods);
      setCombos(cmbs);
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
    checkAdminSession();

    // Handle initial URL path if opened directly
    const path = window.location.pathname;
    if (path.startsWith('/admin/login')) {
      setView('admin-login');
    } else if (path.startsWith('/admin')) {
      checkAdminSession().then(isAdmin => {
        setView(isAdmin ? 'admin-dashboard' : 'admin-login');
      });
    } else if (path.startsWith('/checkout')) {
      setView('checkout');
    }
  }, []);

  const checkAdminSession = async (): Promise<boolean> => {
    const { isAdmin, user, profile } = await checkCurrentAdmin();
    if (isAdmin) {
      setAdminUser(user);
      setAdminProfile(profile);
      return true;
    }
    setAdminUser(null);
    setAdminProfile(null);
    return false;
  };

  // Cart operations
  const handleAddToCart = (item: Product | Combo) => {
    const isCombo = 'items_summary' in item || !('stock' in item);
    const id = item.id;
    const unit_price = item.price;

    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i =>
          i.id === id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id,
          type: isCombo ? 'combo' : 'product',
          item,
          quantity: 1,
          unit_price,
        },
      ];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Scroll Helpers
  const scrollToCombos = () => {
    if (view !== 'store') setView('store');
    setTimeout(() => {
      document.getElementById('apartado-combos')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollToProducts = () => {
    if (view !== 'store') setView('store');
    setTimeout(() => {
      document.getElementById('catalogo-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectCategory = (slug: string) => {
    if (view !== 'store') setView('store');
    setSelectedCategory(slug);
    setTimeout(() => {
      if (slug === 'combos') {
        document.getElementById('apartado-combos')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        document.getElementById('catalogo-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // --- ROUTING / VIEW SWITCHER ---
  if (view === 'admin-login') {
    return (
      <AdminLogin
        onSuccess={() => {
          checkAdminSession();
          setView('admin-dashboard');
          window.history.pushState({}, '', '/admin');
        }}
        onBackToStore={() => {
          setView('store');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  if (view === 'admin-dashboard') {
    return (
      <AdminDashboard
        onLogout={() => {
          setAdminUser(null);
          setAdminProfile(null);
          setView('store');
          window.history.pushState({}, '', '/');
        }}
        adminProfile={adminProfile}
        onBackToStore={() => {
          setView('store');
          window.history.pushState({}, '', '/');
          fetchStoreData();
        }}
      />
    );
  }

  if (view === 'checkout') {
    return (
      <CheckoutView
        cart={cart}
        deliveryMethod={deliveryMethod}
        onChangeDeliveryMethod={setDeliveryMethod}
        onOrderCompleted={() => {
          handleClearCart();
          fetchStoreData();
        }}
        onBackToStore={() => {
          setView('store');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // DEFAULT: STOREFRONT VIEW
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#B7FF00] selection:text-black">
      
      {/* 1. Header */}
      <Header
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategory={handleSelectCategory}
        activeCategory={selectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigateHome={() => {
          setSelectedCategory('todos');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={() => {
          checkAdminSession().then(isAdmin => {
            setView(isAdmin ? 'admin-dashboard' : 'admin-login');
            window.history.pushState({}, '', isAdmin ? '/admin' : '/admin/login');
          });
        }}
      />

      <main className="flex-1">
        {/* 2. Hero */}
        <Hero
          onScrollToCombos={scrollToCombos}
          onScrollToProducts={scrollToProducts}
        />

        {/* 3. Categorías de Barrio */}
        <CategoriesSection
          categories={categories}
          onSelectCategory={handleSelectCategory}
          activeCategory={selectedCategory}
        />

        {/* 4. Ofertas del Día con Descuento */}
        <OffersSection
          offers={products.filter((p) => p.is_offer)}
          onAddToCart={handleAddToCart}
        />

        {/* 5. Super Combos Destacados */}
        <SuperCombosSection
          combos={combos.filter((c) => c.featured)}
          onAddToCart={handleAddToCart}
        />

        {/* 6. Apartado Completo de Combos */}
        <CombosShowcase
          combos={combos}
          onAddToCart={handleAddToCart}
          selectedTag={selectedCategory}
          onSelectTag={setSelectedCategory}
        />

        {/* 7. Catálogo Completo de Productos de la Tienda */}
        <ProductCatalog
          products={products}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddToCart={handleAddToCart}
        />

        {/* 8. Beneficios y Envíos */}
        <DeliveryBenefits />
      </main>

      {/* 8. Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenAdmin={() => {
          checkAdminSession().then(isAdmin => {
            setView(isAdmin ? 'admin-dashboard' : 'admin-login');
            window.history.pushState({}, '', isAdmin ? '/admin' : '/admin/login');
          });
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setView('checkout');
          window.history.pushState({}, '', '/checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        deliveryMethod={deliveryMethod}
        onChangeDeliveryMethod={setDeliveryMethod}
      />

    </div>
  );
}
