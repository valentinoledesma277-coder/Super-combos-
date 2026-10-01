import React, { useState, useEffect } from 'react';
import { Product, Combo, Category, Order, OrderStatus, Profile, ComboItem } from '../types';
import { getProducts, createProduct, updateProduct, deleteProduct, seedProductsToSupabase } from '../services/products';
import { getCombos, createCombo, updateCombo, deleteCombo, seedCombosToSupabase } from '../services/combos';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categories';
import { getOrders, updateOrderStatus } from '../services/orders';
import { signOutAdmin } from '../services/auth';
import { uploadProductImage } from '../services/storage';
import {
  LayoutDashboard,
  Package,
  Flame,
  Layers,
  Tag,
  ClipboardList,
  Database,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  CheckCircle2,
  X,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Star,
  CheckCheck,
  Percent,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  adminProfile?: Profile | null;
  onBackToStore: () => void;
}

type AdminTab = 'dashboard' | 'products' | 'combos' | 'categories' | 'offers' | 'orders' | 'database';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  details?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  adminProfile,
  onBackToStore,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Database Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast System State
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string, details?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, details }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Offers Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Product | null>(null);
  const [offerSearchTerm, setOfferSearchTerm] = useState('');
  const [selectedProductToOfferId, setSelectedProductToOfferId] = useState<string>('');

  // Delete Confirmation Modal State (replaces blocked window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    type: 'product' | 'combo' | 'category';
  } | null>(null);
  const [isDeletingTarget, setIsDeletingTarget] = useState(false);

  // Modal saving loading states
  const [isSavingProductModal, setIsSavingProductModal] = useState(false);
  const [isSavingOfferModal, setIsSavingOfferModal] = useState(false);
  const [isSavingComboModal, setIsSavingComboModal] = useState(false);
  const [isSavingCategoryModal, setIsSavingCategoryModal] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  // Copy SQL state
  const [copiedSql, setCopiedSql] = useState(false);

  // In-line column editing states
  const [editingCell, setEditingCell] = useState<{
    productId: string;
    field: 'name' | 'price' | 'previous_price' | 'stock' | 'category_id' | 'unit';
  } | null>(null);
  const [cellDraftValue, setCellDraftValue] = useState<string>('');
  const [savingCellId, setSavingCellId] = useState<string | null>(null);
  const [savedSuccessCellId, setSavedSuccessCellId] = useState<string | null>(null);

  // Combo structured items state for the combo modal
  const [comboItemsDraft, setComboItemsDraft] = useState<ComboItem[]>([]);
  const [selectedProductIdForCombo, setSelectedProductIdForCombo] = useState<string>('');
  const [selectedQtyForCombo, setSelectedQtyForCombo] = useState<number>(1);
  const [selectedUnitForCombo, setSelectedUnitForCombo] = useState<string>('kg');

  // Load all data from Supabase
  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cmbs, cats, ords] = await Promise.all([
        getProducts({ onlyActive: false }),
        getCombos(false),
        getCategories(false),
        getOrders(),
      ]);
      setProducts(prods);
      setCombos(cmbs);
      setCategories(cats);
      setOrders(ords);
    } catch (err: any) {
      console.error('Error loading Supabase data:', err);
      addToast('error', 'Error al sincronizar con Supabase', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSignOut = async () => {
    await signOutAdmin();
    onLogout();
  };

  // KPIs
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const totalOffers = products.filter((p) => p.is_offer).length;
  const totalCombos = combos.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'PENDIENTE').length;
  const lowStockProducts = products.filter((p) => p.stock <= 10).length;

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'all' || p.category_id === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // -------------------------------------------------------------
  // IN-LINE COLUMN EDITING HANDLERS
  // -------------------------------------------------------------
  const startEditingCell = (
    product: Product,
    field: 'name' | 'price' | 'previous_price' | 'stock' | 'category_id' | 'unit'
  ) => {
    setEditingCell({ productId: product.id, field });
    if (field === 'price') setCellDraftValue(String(product.price));
    else if (field === 'previous_price') setCellDraftValue(String(product.previous_price || ''));
    else if (field === 'stock') setCellDraftValue(String(product.stock));
    else if (field === 'name') setCellDraftValue(product.name);
    else if (field === 'category_id') setCellDraftValue(product.category_id);
    else if (field === 'unit') setCellDraftValue(product.unit || 'kg');
  };

  const cancelEditingCell = () => {
    setEditingCell(null);
    setCellDraftValue('');
  };

  const saveEditingCell = async (
    productId: string,
    field: 'name' | 'price' | 'previous_price' | 'stock' | 'category_id' | 'unit'
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // 1. Validation
    let updates: Partial<Product> = {};
    if (field === 'price') {
      const num = Number(cellDraftValue);
      if (isNaN(num) || num < 0) {
        addToast('error', 'Precio inválido', 'El precio debe ser un número mayor o igual a 0.');
        return;
      }
      if (num === product.price) {
        cancelEditingCell();
        return;
      }
      updates = { price: num };
    } else if (field === 'previous_price') {
      const num = cellDraftValue.trim() === '' ? null : Number(cellDraftValue);
      if (num !== null && (isNaN(num) || num < 0)) {
        addToast('error', 'Precio anterior inválido', 'Debe ser un número válido o estar vacío.');
        return;
      }
      updates = { previous_price: num };
    } else if (field === 'stock') {
      const num = parseInt(cellDraftValue, 10);
      if (isNaN(num) || num < 0) {
        addToast('error', 'Stock inválido', 'El stock debe ser un número entero mayor o igual a 0.');
        return;
      }
      if (num === product.stock) {
        cancelEditingCell();
        return;
      }
      updates = { stock: num };
    } else if (field === 'name') {
      const trimmed = cellDraftValue.trim();
      if (!trimmed) {
        addToast('error', 'Nombre requerido', 'El producto debe tener un nombre.');
        return;
      }
      if (trimmed === product.name) {
        cancelEditingCell();
        return;
      }
      updates = { name: trimmed };
    } else if (field === 'category_id') {
      if (cellDraftValue === product.category_id) {
        cancelEditingCell();
        return;
      }
      updates = { category_id: cellDraftValue };
    } else if (field === 'unit') {
      const trimmed = cellDraftValue.trim() || 'kg';
      if (trimmed === product.unit) {
        cancelEditingCell();
        return;
      }
      updates = { unit: trimmed };
    }

    const cellKey = `${productId}-${field}`;
    setSavingCellId(cellKey);

    try {
      // 2. Send to Supabase and wait for confirmation
      const updatedProduct = await updateProduct(productId, updates);

      // 3. Update interface with real confirmed data
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, ...updatedProduct } : p))
      );

      // 4. Visual confirmation
      setSavedSuccessCellId(cellKey);
      setTimeout(() => setSavedSuccessCellId(null), 2500);

      const fieldLabels: Record<string, string> = {
        name: 'Nombre',
        price: 'Precio',
        previous_price: 'Precio anterior',
        stock: 'Stock',
        category_id: 'Categoría',
        unit: 'Unidad de venta',
      };
      addToast(
        'success',
        `✓ ${fieldLabels[field]} guardado en Supabase`,
        `${product.name}: ahora guardado como ${cellDraftValue}`
      );
      cancelEditingCell();
    } catch (err: any) {
      // Revert & show error
      console.error('In-line update failed:', err);
      addToast(
        'error',
        'Error al guardar en Supabase',
        err.message || 'No se pudo aplicar el cambio en la base de datos.'
      );
    } finally {
      setSavingCellId(null);
    }
  };

  // Direct toggle for Boolean fields (Oferta, Destacado, Activo)
  const handleToggleBooleanField = async (
    product: Product,
    field: 'active' | 'is_offer' | 'featured'
  ) => {
    const newValue = !product[field];
    const cellKey = `${product.id}-${field}`;
    setSavingCellId(cellKey);

    const previousValue = product[field];

    try {
      const updated = await updateProduct(product.id, { [field]: newValue });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, ...updated } : p))
      );

      setSavedSuccessCellId(cellKey);
      setTimeout(() => setSavedSuccessCellId(null), 2000);

      const fieldLabels = {
        active: newValue ? 'Producto Activado' : 'Producto Pausado',
        is_offer: newValue ? 'Marcado en Oferta' : 'Oferta desactivada',
        featured: newValue ? 'Marcado como Destacado' : 'Destacado desactivado',
      };
      addToast('success', `✓ ${fieldLabels[field]} en Supabase`, product.name);
    } catch (err: any) {
      console.error('Toggle error:', err);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, [field]: previousValue } : p))
      );
      addToast('error', 'Error al modificar en Supabase', err.message);
    } finally {
      setSavingCellId(null);
    }
  };

  // -------------------------------------------------------------
  // FULL PRODUCT MODAL ACTIONS
  // -------------------------------------------------------------
  const handleSaveProductModal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const price = Number(formData.get('price'));
    if (isNaN(price) || price < 0) {
      addToast('error', 'Precio inválido', 'El precio debe ser un número mayor o igual a 0.');
      return;
    }

    const payload = {
      name: (formData.get('name') as string).trim(),
      slug: (formData.get('name') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_id: formData.get('category_id') as string,
      description: (formData.get('description') as string) || '',
      price: price,
      previous_price: formData.get('previous_price') ? Number(formData.get('previous_price')) : null,
      stock: Number(formData.get('stock') || 0),
      image_url:
        (formData.get('image_url') as string) ||
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
      active: formData.get('active') === 'on',
      featured: formData.get('featured') === 'on',
      is_offer: formData.get('is_offer') === 'on',
      unit: (formData.get('unit') as string) || 'kg',
    };

    setIsSavingProductModal(true);
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...updated } : p))
        );
        addToast('success', '✓ Producto modificado con éxito en Supabase', payload.name);
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
        addToast('success', '✓ Producto creado exitosamente en Supabase', payload.name);
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error('Error saving product in Supabase:', err);
      addToast('error', 'Error al guardar producto en Supabase', err.message);
    } finally {
      setIsSavingProductModal(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setDeleteTarget({
      id,
      name: target?.name || 'este producto',
      type: 'product',
    });
  };

  // -------------------------------------------------------------
  // COMBO MANAGEMENT ACTIONS & STRUCTURED ITEMS
  // -------------------------------------------------------------
  const openComboModal = (combo: Combo | null) => {
    setEditingCombo(combo);
    if (combo && combo.items) {
      setComboItemsDraft([...combo.items]);
    } else {
      setComboItemsDraft([]);
    }
    if (products.length > 0) {
      setSelectedProductIdForCombo(products[0].id);
      setSelectedUnitForCombo(products[0].unit || 'kg');
    }
    setIsComboModalOpen(true);
  };

  const handleAddProductToComboDraft = () => {
    if (!selectedProductIdForCombo) return;
    const prod = products.find((p) => p.id === selectedProductIdForCombo);
    if (!prod) return;

    const existingIndex = comboItemsDraft.findIndex(
      (item) => item.product_id === selectedProductIdForCombo
    );

    if (existingIndex >= 0) {
      const updated = [...comboItemsDraft];
      updated[existingIndex].quantity += selectedQtyForCombo;
      setComboItemsDraft(updated);
    } else {
      setComboItemsDraft([
        ...comboItemsDraft,
        {
          product_id: prod.id,
          product_name: prod.name,
          product_image: prod.image_url,
          quantity: selectedQtyForCombo,
          unit: selectedUnitForCombo || prod.unit || 'kg',
        },
      ]);
    }
  };

  const handleRemoveProductFromComboDraft = (index: number) => {
    setComboItemsDraft((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveComboModal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const price = Number(formData.get('price'));
    if (isNaN(price) || price < 0) {
      addToast('error', 'Precio inválido', 'El precio del combo debe ser mayor o igual a 0.');
      return;
    }

    const items_summary = comboItemsDraft.map(
      (item) => `${item.quantity} ${item.unit || 'unid'} ${item.product_name}`
    );

    const payload = {
      name: (formData.get('name') as string).trim(),
      description: (formData.get('description') as string) || '',
      price: price,
      previous_price: formData.get('previous_price') ? Number(formData.get('previous_price')) : null,
      image_url:
        (formData.get('image_url') as string) ||
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
      active: formData.get('active') === 'on',
      featured: formData.get('featured') === 'on',
      category: (formData.get('category') as string) || 'Super Combos',
      items: comboItemsDraft,
      items_summary,
    };

    setIsSavingComboModal(true);
    try {
      if (editingCombo) {
        const updated = await updateCombo(editingCombo.id, payload);
        setCombos((prev) =>
          prev.map((c) => (c.id === editingCombo.id ? { ...c, ...updated } : c))
        );
        addToast('success', '✓ Super Combo modificado en Supabase', payload.name);
      } else {
        const created = await createCombo(payload);
        setCombos((prev) => [created, ...prev]);
        addToast('success', '✓ Super Combo creado en Supabase', payload.name);
      }

      setIsComboModalOpen(false);
      setEditingCombo(null);
    } catch (err: any) {
      console.error('Error saving combo:', err);
      addToast('error', 'Error al guardar Combo en Supabase', err.message);
    } finally {
      setIsSavingComboModal(false);
    }
  };

  const handleDeleteCombo = (id: string) => {
    const target = combos.find((c) => c.id === id);
    setDeleteTarget({
      id,
      name: target?.name || 'este combo',
      type: 'combo',
    });
  };

  const handleToggleComboActive = async (combo: Combo) => {
    try {
      const updated = await updateCombo(combo.id, { active: !combo.active });
      setCombos((prev) =>
        prev.map((c) => (c.id === combo.id ? { ...c, ...updated } : c))
      );
      addToast('success', `✓ Combo ${!combo.active ? 'activado' : 'pausado'} en Supabase`, combo.name);
    } catch (err: any) {
      addToast('error', 'Error al cambiar estado del combo', err.message);
    }
  };

  const handleToggleComboFeatured = async (combo: Combo) => {
    try {
      const updated = await updateCombo(combo.id, { featured: !combo.featured });
      setCombos((prev) =>
        prev.map((c) => (c.id === combo.id ? { ...c, ...updated } : c))
      );
      addToast(
        'success',
        `✓ Combo ${!combo.featured ? 'destacado en la página de inicio' : 'desmarcado de destacados'} en Supabase`,
        combo.name
      );
    } catch (err: any) {
      addToast('error', 'Error al cambiar destacado del combo', err.message);
    }
  };

  // -------------------------------------------------------------
  // DEDICATED OFFERS MANAGEMENT ACTIONS
  // -------------------------------------------------------------
  const openOfferModal = (offer: Product | null) => {
    setEditingOffer(offer);
    if (!offer) {
      const nonOffers = products.filter((p) => !p.is_offer);
      if (nonOffers.length > 0) {
        setSelectedProductToOfferId(nonOffers[0].id);
      } else if (products.length > 0) {
        setSelectedProductToOfferId(products[0].id);
      }
    }
    setIsOfferModalOpen(true);
  };

  const handleSaveOfferModal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const price = Number(formData.get('price'));
    const rawPrevPrice = formData.get('previous_price');
    const previous_price = rawPrevPrice ? Number(rawPrevPrice) : null;

    if (isNaN(price) || price < 0) {
      addToast('error', 'Precio de oferta inválido', 'Debe ser un número mayor o igual a 0.');
      return;
    }

    setIsSavingOfferModal(true);
    try {
      if (editingOffer) {
        // Modifying existing offer
        const updated = await updateProduct(editingOffer.id, {
          price,
          previous_price: previous_price && previous_price > 0 ? previous_price : null,
          name: (formData.get('name') as string)?.trim() || editingOffer.name,
          stock: Number(formData.get('stock') ?? editingOffer.stock),
          is_offer: true,
          active: formData.get('active') === 'on',
        });

        setProducts((prev) =>
          prev.map((p) => (p.id === editingOffer.id ? { ...p, ...updated } : p))
        );
        addToast('success', '✓ Oferta actualizada en Supabase', updated.name);
      } else {
        const mode = formData.get('offer_mode');
        if (mode === 'existing') {
          const targetProd = products.find((p) => p.id === selectedProductToOfferId);
          if (!targetProd) {
            addToast('error', 'Seleccioná un producto del catálogo');
            return;
          }

          const prevPriceToSet = previous_price && previous_price > 0 ? previous_price : targetProd.price;

          const updated = await updateProduct(targetProd.id, {
            price,
            previous_price: prevPriceToSet,
            is_offer: true,
            active: true,
          });

          setProducts((prev) =>
            prev.map((p) => (p.id === targetProd.id ? { ...p, ...updated } : p))
          );
          addToast('success', '✓ Producto convertido en Oferta en Supabase', targetProd.name);
        } else {
          const name = (formData.get('name') as string).trim();
          const category_id = (formData.get('category_id') as string) || categories[0]?.id;
          const unit = (formData.get('unit') as string) || 'kg';
          const image_url =
            (formData.get('image_url') as string) ||
            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600';

          const created = await createProduct({
            name,
            category_id,
            price,
            previous_price: previous_price && previous_price > 0 ? previous_price : null,
            stock: Number(formData.get('stock') || 50),
            unit,
            image_url,
            is_offer: true,
            active: true,
            featured: false,
            description: (formData.get('description') as string) || '',
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          });

          setProducts((prev) => [created, ...prev]);
          addToast('success', '✓ Nueva oferta creada y guardada en Supabase', created.name);
        }
      }

      setIsOfferModalOpen(false);
      setEditingOffer(null);
    } catch (err: any) {
      console.error('Error saving offer:', err);
      addToast('error', 'Error al guardar oferta en Supabase', err.message);
    } finally {
      setIsSavingOfferModal(false);
    }
  };

  const handleReSyncDatabase = async () => {
    try {
      addToast('info', 'Sincronizando con Supabase...', 'Verificando catálogo y tablas');
      await seedProductsToSupabase();
      await seedCombosToSupabase();
      await loadData();
      addToast('success', '✓ Catálogo y Supabase completamente sincronizados');
    } catch (err: any) {
      addToast('error', 'Error al sincronizar con Supabase', err.message);
    }
  };

  // -------------------------------------------------------------
  // CATEGORY ACTIONS
  // -------------------------------------------------------------
  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: (formData.get('name') as string).trim(),
      slug:
        (formData.get('slug') as string) ||
        (formData.get('name') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formData.get('description') as string,
      image_url: formData.get('image_url') as string,
      active: formData.get('active') === 'on',
    };

    setIsSavingCategoryModal(true);
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, payload);
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? { ...c, ...updated } : c))
        );
        addToast('success', '✓ Categoría actualizada en Supabase', payload.name);
      } else {
        const created = await createCategory(payload);
        setCategories((prev) => [...prev, created]);
        addToast('success', '✓ Categoría creada en Supabase', payload.name);
      }

      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      addToast('error', 'Error al guardar categoría en Supabase', err.message);
    } finally {
      setIsSavingCategoryModal(false);
    }
  };

  const handleDeleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    setDeleteTarget({
      id,
      name: target?.name || 'esta categoría',
      type: 'category',
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeletingTarget(true);
    try {
      if (deleteTarget.type === 'product') {
        await deleteProduct(deleteTarget.id);
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        addToast('success', '✓ Producto eliminado de Supabase', deleteTarget.name);
      } else if (deleteTarget.type === 'combo') {
        await deleteCombo(deleteTarget.id);
        setCombos((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        addToast('success', '✓ Super Combo eliminado de Supabase', deleteTarget.name);
      } else if (deleteTarget.type === 'category') {
        await deleteCategory(deleteTarget.id);
        setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        addToast('success', '✓ Categoría eliminada de Supabase', deleteTarget.name);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Delete error in Supabase:', err);
      addToast('error', 'Error al eliminar en Supabase', err.message);
    } finally {
      setIsDeletingTarget(false);
    }
  };

  // -------------------------------------------------------------
  // ORDER ACTIONS
  // -------------------------------------------------------------
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      addToast('success', '✓ Estado de pedido actualizado en Supabase', `Nuevo estado: ${newStatus}`);
    } catch (err: any) {
      addToast('error', 'Error al actualizar pedido en Supabase', err.message);
    }
  };

  // -------------------------------------------------------------
  // STORAGE IMAGE UPLOADER
  // -------------------------------------------------------------
  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetInputId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const publicUrl = await uploadProductImage(file);
      const inputEl = document.getElementById(targetInputId) as HTMLInputElement;
      if (inputEl) {
        inputEl.value = publicUrl;
      }
      addToast('success', '✓ Imagen subida con éxito a Supabase Storage');
    } catch (err: any) {
      console.error('Storage error:', err);
      addToast('error', 'Error al subir imagen a Supabase Storage', err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col md:flex-row relative">
      {/* TOAST NOTIFICATION CONTAINER */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-start gap-3 backdrop-blur-md transition-all animate-in slide-in-from-top-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-zinc-900/95 border-emerald-500/80 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : toast.type === 'error'
                ? 'bg-zinc-900/95 border-red-500/80 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : 'bg-zinc-900/95 border-[#FFE500]/80 text-zinc-100 shadow-[0_0_20px_rgba(255,229,0,0.15)]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Database className="w-5 h-5 text-[#FFE500] shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="font-black text-xs uppercase tracking-wide">{toast.message}</p>
              {toast.details && <p className="text-[11px] text-zinc-400 mt-0.5 break-words">{toast.details}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-white p-1 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-[#1a1a1a] p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-black p-0.5 border border-[#FFE500] shrink-0">
              <img src="/logo/logo.png" alt="Super Combos" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="min-w-0">
              <span className="font-black text-sm text-white tracking-tight uppercase block truncate">Super Combos</span>
              <span className="text-[10px] text-[#B7FF00] font-bold block uppercase tracking-wider">
                Admin Panel • Supabase
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#FFE500] text-black shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Resumen</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#FFE500] text-black shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Productos</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-zinc-800 text-zinc-300">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('combos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'combos'
                  ? 'bg-[#FFE500] text-black shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Flame className="w-4 h-4" />
                <span>Super Combos</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-zinc-800 text-zinc-300">
                {combos.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-[#FFE500] text-black shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>Categorías</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-zinc-800 text-zinc-300">
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('offers')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'offers'
                  ? 'bg-[#FFE500] text-black shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4" />
                <span>Ofertas del Día</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-orange-950 text-orange-300">
                {totalOffers}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#FFE500] text-black shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4" />
                <span>Pedidos</span>
              </div>
              {pendingOrders > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {pendingOrders}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'database'
                  ? 'bg-[#FFE500] text-black shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              <Database className="w-4 h-4 text-[#B7FF00]" />
              <span>Supabase SQL & RLS</span>
            </button>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-[#1c1c1c] space-y-2">
          <button
            onClick={onBackToStore}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#141414] hover:bg-[#1e1e1e] text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#FFE500]" />
            <span>Ver Tienda Online</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#202020] mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B7FF00] shadow-[0_0_8px_#B7FF00]" />
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                {activeTab === 'dashboard' && 'Panel de Control General'}
                {activeTab === 'products' && 'Gestión y Edición de Productos'}
                {activeTab === 'combos' && 'Gestión de Super Combos'}
                {activeTab === 'categories' && 'Gestión de Categorías'}
                {activeTab === 'offers' && 'Ofertas Destacadas del Día'}
                {activeTab === 'orders' && 'Gestión de Pedidos'}
                {activeTab === 'database' && 'Configuración de Supabase'}
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Sesión activa de administrador: <strong className="text-[#FFE500]">{adminProfile?.name || 'Admin'}</strong> • Datos persistentes en PostgreSQL
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141414] hover:bg-[#202020] border border-[#2a2a2a] text-xs font-bold text-zinc-300 hover:text-white cursor-pointer active:scale-95 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#B7FF00] ${loading ? 'animate-spin' : ''}`} />
              <span>Sincronizar Supabase</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0f0f0f] border border-[#222] p-5 rounded-2xl">
                <span className="text-xs font-bold text-zinc-400 uppercase">Productos Activos</span>
                <div className="text-3xl font-black text-white mt-1">
                  {activeProducts} <span className="text-xs text-zinc-500 font-normal">/ {totalProducts}</span>
                </div>
              </div>

              <div className="bg-[#0f0f0f] border border-[#222] p-5 rounded-2xl">
                <span className="text-xs font-bold text-zinc-400 uppercase">Super Combos</span>
                <div className="text-3xl font-black text-[#FFE500] mt-1">{totalCombos}</div>
              </div>

              <div className="bg-[#0f0f0f] border border-[#222] p-5 rounded-2xl">
                <span className="text-xs font-bold text-zinc-400 uppercase">Pedidos Registrados</span>
                <div className="text-3xl font-black text-[#B7FF00] mt-1">{totalOrders}</div>
              </div>

              <div className="bg-[#0f0f0f] border border-[#222] p-5 rounded-2xl">
                <span className="text-xs font-bold text-zinc-400 uppercase">En Oferta</span>
                <div className="text-3xl font-black text-orange-400 mt-1">{totalOffers}</div>
              </div>
            </div>

            {/* Quick Actions & Stock Alert */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0f0f0f] border border-[#222] p-6 rounded-3xl space-y-4">
                <h3 className="font-black text-base text-white uppercase tracking-wider">
                  Acciones Rápidas
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsProductModalOpen(true);
                    }}
                    className="p-4 rounded-2xl bg-[#141414] hover:bg-[#1c1c1c] border border-[#2a2a2a] text-left cursor-pointer transition-all"
                  >
                    <Package className="w-5 h-5 text-[#FFE500] mb-2" />
                    <span className="text-xs font-black uppercase text-white block">Nuevo Producto</span>
                    <span className="text-[11px] text-zinc-400">Agregar al inventario de Supabase</span>
                  </button>

                  <button
                    onClick={() => openComboModal(null)}
                    className="p-4 rounded-2xl bg-[#141414] hover:bg-[#1c1c1c] border border-[#2a2a2a] text-left cursor-pointer transition-all"
                  >
                    <Flame className="w-5 h-5 text-[#B7FF00] mb-2" />
                    <span className="text-xs font-black uppercase text-white block">Nuevo Super Combo</span>
                    <span className="text-[11px] text-zinc-400">Armar combo con productos</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('products')}
                    className="p-4 rounded-2xl bg-[#141414] hover:bg-[#1c1c1c] border border-[#2a2a2a] text-left cursor-pointer transition-all"
                  >
                    <Edit2 className="w-5 h-5 text-[#FFE500] mb-2" />
                    <span className="text-xs font-black uppercase text-white block">Editar Precios y Stock</span>
                    <span className="text-[11px] text-zinc-400">Modificación rápida en columnas</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('database')}
                    className="p-4 rounded-2xl bg-[#141414] hover:bg-[#1c1c1c] border border-[#2a2a2a] text-left cursor-pointer transition-all"
                  >
                    <Database className="w-5 h-5 text-[#B7FF00] mb-2" />
                    <span className="text-xs font-black uppercase text-white block">Supabase SQL</span>
                    <span className="text-[11px] text-zinc-400">Ver tablas y políticas RLS</span>
                  </button>
                </div>
              </div>

              {/* Low Stock Watchlist */}
              <div className="bg-[#0f0f0f] border border-[#222] p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
                    <span>Control de Stock Bajo</span>
                  </h3>
                  <span className="text-xs font-bold text-zinc-400">{lowStockProducts} productos</span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {products
                    .filter((p) => p.stock <= 10)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-[#242424] text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded-lg object-cover bg-zinc-800" />
                          <div>
                            <span className="font-bold text-white block">{p.name}</span>
                            <span className="text-[11px] text-zinc-400">${p.price.toLocaleString('es-AR')}</span>
                          </div>
                        </div>
                        <span className={`font-black px-2 py-0.5 rounded ${p.stock <= 0 ? 'bg-red-950 text-red-300' : 'bg-orange-950 text-orange-300'}`}>
                          {p.stock <= 0 ? 'Sin stock' : `${p.stock} ${p.unit || 'unid'}`}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRODUCTS TABLE WITH IN-LINE COLUMN EDITING */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="w-full bg-[#141414] border border-[#2c2c2c] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFE500]"
                  />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-[#141414] border border-[#2c2c2c] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFE500]"
                >
                  <option value="all">Todas las Categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2.5 bg-[#FFE500] hover:bg-[#B7FF00] text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Producto</span>
              </button>
            </div>

            {/* In-Line Editing Instruction Banner */}
            <div className="px-4 py-3 bg-[#111] border border-[#262626] rounded-2xl flex items-center justify-between text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-[#B7FF00]" />
                <span>
                  <strong>Edición directa habilitada:</strong> Hacé clic en cualquier <em>Nombre</em>, <em>Precio</em>, <em>Stock</em>, <em>Categoría</em> o <em>Unidad</em> para editarlo en el acto. Cada cambio se guarda de forma real e inmediata en Supabase.
                </span>
              </div>
            </div>

            {/* Products Data Table */}
            <div className="bg-[#0e0e0e] border border-[#222] rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151515] text-zinc-400 uppercase tracking-wider text-[11px] border-b border-[#222]">
                    <tr>
                      <th className="py-3.5 px-4">Producto</th>
                      <th className="py-3.5 px-4">Categoría</th>
                      <th className="py-3.5 px-4">Precio ($)</th>
                      <th className="py-3.5 px-4">Stock & Unidad</th>
                      <th className="py-3.5 px-4 text-center">Oferta</th>
                      <th className="py-3.5 px-4 text-center">Destacado</th>
                      <th className="py-3.5 px-4 text-center">Estado</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f1f]">
                    {filteredProducts.map((p) => {
                      const isEditingName = editingCell?.productId === p.id && editingCell?.field === 'name';
                      const isEditingPrice = editingCell?.productId === p.id && editingCell?.field === 'price';
                      const isEditingStock = editingCell?.productId === p.id && editingCell?.field === 'stock';
                      const isEditingCat = editingCell?.productId === p.id && editingCell?.field === 'category_id';

                      const isSavingPrice = savingCellId === `${p.id}-price`;
                      const isSavingStock = savingCellId === `${p.id}-stock`;
                      const isSavingName = savingCellId === `${p.id}-name`;
                      const isSavingCat = savingCellId === `${p.id}-category_id`;
                      const isSavingOffer = savingCellId === `${p.id}-is_offer`;
                      const isSavingActive = savingCellId === `${p.id}-active`;
                      const isSavingFeatured = savingCellId === `${p.id}-featured`;

                      const wasPriceSaved = savedSuccessCellId === `${p.id}-price`;
                      const wasStockSaved = savedSuccessCellId === `${p.id}-stock`;
                      const wasNameSaved = savedSuccessCellId === `${p.id}-name`;
                      const wasCatSaved = savedSuccessCellId === `${p.id}-category_id`;

                      return (
                        <tr key={p.id} className="hover:bg-[#131313] transition-colors group">
                          {/* PRODUCT NAME & IMAGE */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className="w-10 h-10 rounded-lg object-cover bg-zinc-800 shrink-0 border border-[#242424]"
                              />
                              <div className="min-w-0 flex-1">
                                {isEditingName ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={cellDraftValue}
                                      onChange={(e) => setCellDraftValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEditingCell(p.id, 'name');
                                        if (e.key === 'Escape') cancelEditingCell();
                                      }}
                                      autoFocus
                                      className="bg-black border border-[#FFE500] rounded px-2 py-1 text-white text-xs font-bold w-full focus:outline-none"
                                    />
                                    <button
                                      onClick={() => saveEditingCell(p.id, 'name')}
                                      className="p-1 bg-[#FFE500] text-black rounded hover:bg-[#B7FF00] cursor-pointer"
                                      title="Guardar en Supabase"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={cancelEditingCell}
                                      className="p-1 bg-[#222] text-zinc-400 rounded hover:text-white cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => startEditingCell(p, 'name')}
                                    className={`cursor-pointer rounded p-1 -m-1 transition-all ${
                                      wasNameSaved
                                        ? 'bg-emerald-950/60 ring-1 ring-emerald-500 text-emerald-200'
                                        : 'hover:bg-[#1c1c1c] text-white'
                                    }`}
                                    title="Clic para editar nombre en Supabase"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold truncate">{p.name}</span>
                                      {isSavingName && <Loader2 className="w-3 h-3 text-[#FFE500] animate-spin" />}
                                      <Edit2 className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-[11px] text-zinc-400 block truncate max-w-xs">{p.description}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* CATEGORY (IN-LINE SELECT) */}
                          <td className="py-3 px-4">
                            {isEditingCat ? (
                              <div className="flex items-center gap-1">
                                <select
                                  value={cellDraftValue}
                                  onChange={(e) => {
                                    setCellDraftValue(e.target.value);
                                  }}
                                  className="bg-black border border-[#FFE500] rounded px-2 py-1 text-white text-xs focus:outline-none"
                                  autoFocus
                                >
                                  {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => saveEditingCell(p.id, 'category_id')}
                                  className="p-1 bg-[#FFE500] text-black rounded hover:bg-[#B7FF00] cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={cancelEditingCell}
                                  className="p-1 bg-[#222] text-zinc-400 rounded hover:text-white cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => startEditingCell(p, 'category_id')}
                                className={`cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded text-zinc-300 font-medium ${
                                  wasCatSaved
                                    ? 'bg-emerald-950/60 ring-1 ring-emerald-500'
                                    : 'hover:bg-[#1a1a1a]'
                                }`}
                                title="Clic para cambiar categoría"
                              >
                                <span>{p.category_name || categories.find((c) => c.id === p.category_id)?.name || 'General'}</span>
                                {isSavingCat && <Loader2 className="w-3 h-3 text-[#FFE500] animate-spin" />}
                                <Edit2 className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100" />
                              </div>
                            )}
                          </td>

                          {/* PRICE ($) (IN-LINE EDITABLE) */}
                          <td className="py-3 px-4">
                            {isEditingPrice ? (
                              <div className="flex items-center gap-1">
                                <span className="text-[#FFE500] font-black">$</span>
                                <input
                                  type="number"
                                  min={0}
                                  step="any"
                                  value={cellDraftValue}
                                  onChange={(e) => setCellDraftValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditingCell(p.id, 'price');
                                    if (e.key === 'Escape') cancelEditingCell();
                                  }}
                                  autoFocus
                                  className="w-24 bg-black border border-[#FFE500] rounded px-2 py-1 text-white text-xs font-black focus:outline-none"
                                />
                                <button
                                  onClick={() => saveEditingCell(p.id, 'price')}
                                  className="p-1 bg-[#FFE500] text-black rounded hover:bg-[#B7FF00] cursor-pointer"
                                  title="Guardar precio"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={cancelEditingCell}
                                  className="p-1 bg-[#222] text-zinc-400 rounded hover:text-white cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => startEditingCell(p, 'price')}
                                className={`cursor-pointer inline-flex flex-col px-2 py-1 rounded transition-all ${
                                  wasPriceSaved
                                    ? 'bg-emerald-950/60 ring-2 ring-emerald-500'
                                    : 'hover:bg-[#1a1a1a]'
                                }`}
                                title="Clic para editar precio"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-[#FFE500] text-sm">
                                    ${p.price.toLocaleString('es-AR')}
                                  </span>
                                  {isSavingPrice && <Loader2 className="w-3 h-3 text-[#FFE500] animate-spin" />}
                                  <Edit2 className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100" />
                                </div>
                                {p.previous_price && (
                                  <span className="text-[10px] text-zinc-500 line-through">
                                    ${p.previous_price.toLocaleString('es-AR')}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* STOCK & UNIT (IN-LINE EDITABLE) */}
                          <td className="py-3 px-4">
                            {isEditingStock ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  value={cellDraftValue}
                                  onChange={(e) => setCellDraftValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditingCell(p.id, 'stock');
                                    if (e.key === 'Escape') cancelEditingCell();
                                  }}
                                  autoFocus
                                  className="w-16 bg-black border border-[#FFE500] rounded px-2 py-1 text-white text-xs font-bold focus:outline-none"
                                />
                                <button
                                  onClick={() => saveEditingCell(p.id, 'stock')}
                                  className="p-1 bg-[#FFE500] text-black rounded hover:bg-[#B7FF00] cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={cancelEditingCell}
                                  className="p-1 bg-[#222] text-zinc-400 rounded hover:text-white cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => startEditingCell(p, 'stock')}
                                className={`cursor-pointer inline-flex items-center gap-1.5 px-2 py-1 rounded transition-all ${
                                  wasStockSaved
                                    ? 'bg-emerald-950/60 ring-2 ring-emerald-500'
                                    : 'hover:bg-[#1a1a1a]'
                                }`}
                                title="Clic para editar stock"
                              >
                                <span className={`font-bold ${p.stock <= 10 ? 'text-orange-400' : 'text-zinc-300'}`}>
                                  {p.stock}
                                </span>
                                <span className="text-zinc-500 font-mono text-[10px]">{p.unit || 'kg'}</span>
                                {isSavingStock && <Loader2 className="w-3 h-3 text-[#FFE500] animate-spin" />}
                                <Edit2 className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100" />
                              </div>
                            )}
                          </td>

                          {/* OFERTA TOGGLE */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleBooleanField(p, 'is_offer')}
                              disabled={isSavingOffer}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer uppercase transition-all ${
                                p.is_offer
                                  ? 'bg-[#FFE500] text-black shadow-[0_0_10px_rgba(255,229,0,0.4)]'
                                  : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                              }`}
                              title="Clic para cambiar oferta"
                            >
                              {isSavingOffer ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : p.is_offer ? 'OFERTA 🔥' : 'NO'}
                            </button>
                          </td>

                          {/* DESTACADO TOGGLE */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleBooleanField(p, 'featured')}
                              disabled={isSavingFeatured}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                p.featured
                                  ? 'text-[#B7FF00] bg-[#B7FF00]/20'
                                  : 'text-zinc-600 hover:text-zinc-400 bg-zinc-900'
                              }`}
                              title="Clic para destacar en home"
                            >
                              {isSavingFeatured ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Star className={`w-4 h-4 ${p.featured ? 'fill-[#B7FF00]' : ''}`} />
                              )}
                            </button>
                          </td>

                          {/* ESTADO ACTIVO/PAUSADO */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleBooleanField(p, 'active')}
                              disabled={isSavingActive}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer uppercase transition-all ${
                                p.active
                                  ? 'bg-[#B7FF00]/20 text-[#B7FF00] border border-[#B7FF00]/40'
                                  : 'bg-zinc-800 text-zinc-500'
                              }`}
                              title="Clic para pausar o activar"
                            >
                              {isSavingActive ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : p.active ? 'Activo' : 'Pausado'}
                            </button>
                          </td>

                          {/* ACCIONES */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#181818] hover:bg-[#252525] text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#2a2a2a] hover:border-[#FFE500]"
                                title="Modificar datos del producto"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-[#FFE500]" />
                                <span>Modificar</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-950/30 hover:bg-red-900/60 text-red-400 hover:text-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-900/40"
                                title="Eliminar este producto de Supabase"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: COMBOS WITH STRUCTURED PRODUCTS */}
        {/* ========================================================= */}
        {activeTab === 'combos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black uppercase text-white tracking-tight">Super Combos</h2>
                <p className="text-xs text-zinc-400">
                  Combos estrella guardados en Supabase (tablas <code>combos</code> y <code>combo_items</code> vinculadas con productos).
                </p>
              </div>

              <button
                onClick={() => openComboModal(null)}
                className="px-4 py-2.5 bg-[#FFE500] hover:bg-[#B7FF00] text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Super Combo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {combos.map((combo) => (
                <div
                  key={combo.id}
                  className="bg-[#0f0f0f] border border-[#222] rounded-3xl overflow-hidden p-5 flex flex-col justify-between space-y-4 hover:border-[#333] transition-all shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={combo.image_url}
                        alt={combo.name}
                        className="w-full h-44 object-cover rounded-2xl bg-zinc-800 border border-[#222]"
                      />
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleComboFeatured(combo)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-1 ${
                            combo.featured
                              ? 'bg-[#FFE500] text-black shadow-[0_0_10px_rgba(255,229,0,0.4)]'
                              : 'bg-zinc-900/90 text-zinc-400 border border-zinc-700 hover:text-white'
                          }`}
                          title="Alternar combo destacado en portada"
                        >
                          <Star className={`w-3 h-3 ${combo.featured ? 'fill-black' : ''}`} />
                          <span>{combo.featured ? 'Destacado' : 'Normal'}</span>
                        </button>
                        <button
                          onClick={() => handleToggleComboActive(combo)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-md ${
                            combo.active
                              ? 'bg-[#B7FF00] text-black'
                              : 'bg-zinc-900/90 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {combo.active ? 'Activo' : 'Pausado'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-black text-lg text-white leading-snug">{combo.name}</h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{combo.description}</p>
                    </div>

                    {/* Structured Items List */}
                    <div className="bg-[#151515] p-3 rounded-2xl border border-[#242424] text-xs text-zinc-300 space-y-1.5">
                      <span className="font-bold text-[#B7FF00] uppercase text-[10px] tracking-wider block">
                        Contenido del Combo:
                      </span>
                      {combo.items && combo.items.length > 0 ? (
                        <div className="space-y-1">
                          {combo.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px]">
                              <span className="text-zinc-300 truncate">• {item.product_name || 'Producto'}</span>
                              <span className="font-bold text-[#FFE500] shrink-0">
                                {item.quantity} {item.unit || 'kg'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : combo.items_summary && combo.items_summary.length > 0 ? (
                        <div className="space-y-1">
                          {combo.items_summary.map((summary, idx) => (
                            <div key={idx} className="text-[11px] text-zinc-300 truncate">
                              • {summary}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic">Sin productos asociados</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#222] flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-[#FFE500]">
                        ${combo.price.toLocaleString('es-AR')}
                      </span>
                      {combo.previous_price && (
                        <span className="text-xs text-zinc-500 line-through block">
                          ${combo.previous_price.toLocaleString('es-AR')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openComboModal(combo)}
                        className="p-2 text-zinc-300 hover:text-white bg-[#1c1c1c] hover:bg-[#252525] rounded-xl cursor-pointer transition-colors"
                        title="Editar combo y productos"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCombo(combo.id)}
                        className="p-2 text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 rounded-xl cursor-pointer transition-colors"
                        title="Eliminar combo de Supabase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CATEGORIES */}
        {/* ========================================================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase text-white">Categorías</h2>
                <p className="text-xs text-zinc-400">
                  Verdulería, Carnes, Pollería, Fiambrería, etc. Almacenadas en la tabla <code>categories</code>.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                className="px-4 py-2.5 bg-[#FFE500] hover:bg-[#B7FF00] text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Categoría</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#0f0f0f] border border-[#222] rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} className="w-12 h-12 rounded-xl object-cover bg-zinc-800" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-black text-sm text-white">{c.name}</h4>
                      <span className="text-[11px] text-zinc-500 font-mono">slug: {c.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(c);
                        setIsCategoryModalOpen(true);
                      }}
                      className="p-2 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-2 text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: OFFERS (COMPLETELY EDITABLE & MANAGEABLE) */}
        {/* ========================================================= */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#FFE500] fill-[#FFE500]" />
                  <span>Ofertas del Día y Promociones</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Total libertad para modificar precios de oferta, precio anterior tachado, crear nuevas ofertas y eliminarlas. Se sincronizan en tiempo real con Supabase.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => openOfferModal(null)}
                  className="px-4 py-2.5 bg-[#FFE500] hover:bg-[#B7FF00] text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear o Destacar Oferta</span>
                </button>
              </div>
            </div>

            {/* Filter / Search within offers */}
            <div className="flex items-center gap-4 bg-[#0e0e0e] border border-[#222] p-3 rounded-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar en ofertas activas..."
                  value={offerSearchTerm}
                  onChange={(e) => setOfferSearchTerm(e.target.value)}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFE500]"
                />
              </div>
              <div className="text-xs font-bold text-zinc-400 shrink-0">
                <strong className="text-[#FFE500]">{products.filter((p) => p.is_offer).length}</strong> ofertas activas en tienda
              </div>
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products
                .filter((p) => p.is_offer)
                .filter(
                  (p) =>
                    offerSearchTerm === '' ||
                    p.name.toLowerCase().includes(offerSearchTerm.toLowerCase()) ||
                    p.description.toLowerCase().includes(offerSearchTerm.toLowerCase())
                )
                .map((p) => {
                  const discountPct =
                    p.previous_price && p.previous_price > p.price
                      ? Math.round(((p.previous_price - p.price) / p.previous_price) * 100)
                      : null;

                  return (
                    <div
                      key={p.id}
                      className="bg-[#0f0f0f] border border-[#222] rounded-3xl p-4 flex flex-col justify-between space-y-4 hover:border-[#383838] transition-all shadow-xl group"
                    >
                      <div className="space-y-3">
                        {/* Image & Discount Badge */}
                        <div className="relative">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-40 object-cover rounded-2xl bg-zinc-800 border border-[#222]"
                          />
                          {discountPct && (
                            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1">
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span>{discountPct}% OFF</span>
                            </div>
                          )}
                          <span
                            className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow ${
                              p.active ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {p.active ? 'Activo' : 'Pausado'}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                            <span className="font-bold text-[#B7FF00] uppercase">
                              {p.category_name || 'Producto'}
                            </span>
                            <span className="font-mono text-zinc-500">Por {p.unit || 'kg'}</span>
                          </div>
                          <h4 className="font-black text-base text-white leading-snug">{p.name}</h4>
                          {p.description && (
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{p.description}</p>
                          )}
                        </div>

                        {/* Price & Savings Display */}
                        <div className="bg-[#151515] p-3 rounded-2xl border border-[#242424] space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] font-black text-[#FFE500] uppercase tracking-wider">
                              Precio de Oferta:
                            </span>
                            <span className="text-xl font-black text-[#FFE500]">
                              ${p.price.toLocaleString('es-AR')}
                            </span>
                          </div>
                          {p.previous_price && (
                            <div className="flex items-center justify-between text-xs text-zinc-500">
                              <span>Precio regular anterior:</span>
                              <span className="line-through font-mono font-bold">
                                ${p.previous_price.toLocaleString('es-AR')}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-[#222]">
                            <span>Stock disponible:</span>
                            <span className="font-bold text-white">{p.stock} {p.unit || 'kg'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Modify, Toggle, Delete */}
                      <div className="space-y-2 pt-2 border-t border-[#222]">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => openOfferModal(p)}
                            className="py-2 px-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            title="Modificar precio de oferta o datos en Supabase"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#FFE500]" />
                            <span>Modificar</span>
                          </button>
                          <button
                            onClick={() => handleToggleBooleanField(p, 'is_offer')}
                            className="py-2 px-3 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                            title="Quitar etiqueta de oferta (vuelve a precio común)"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Quitar Oferta</span>
                          </button>
                        </div>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="w-full py-1.5 bg-red-950/20 hover:bg-red-950/50 text-red-400 hover:text-red-300 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Eliminar este producto permanentemente de Supabase"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Eliminar de la Base de Datos</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {products.filter((p) => p.is_offer).length === 0 && (
              <div className="text-center py-16 bg-[#0f0f0f] border border-[#222] rounded-3xl p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-3xl">
                  🔥
                </div>
                <h3 className="text-lg font-black text-white uppercase">No hay ofertas activas en este momento</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Podés convertir cualquier producto existente en oferta con precio promocional o agregar una nueva oferta desde el botón superior.
                </p>
                <button
                  onClick={() => openOfferModal(null)}
                  className="px-6 py-2.5 bg-[#FFE500] hover:bg-[#B7FF00] text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg"
                >
                  + Agregar Primera Oferta
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: ORDERS */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black uppercase text-white">Pedidos Registrados</h2>
              <p className="text-xs text-zinc-400">Historial completo guardado en Supabase</p>
            </div>

            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-[#0f0f0f] border border-[#222] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-zinc-500">#{o.id.slice(0, 8)}</span>
                      <span className="font-black text-sm text-white">{o.customer_name}</span>
                      <span className="text-xs text-zinc-400">({o.phone})</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      📍 {o.address} {o.neighborhood ? `- ${o.neighborhood}` : ''}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Método: {o.delivery_method} • Pago: {o.payment_method} • Fecha:{' '}
                      {o.created_at ? new Date(o.created_at).toLocaleString('es-AR') : '-'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-lg font-black text-[#FFE500]">
                        ${o.total.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                      className="bg-[#151515] border border-[#2a2a2a] rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#FFE500]"
                    >
                      <option value="PENDIENTE">PENDIENTE</option>
                      <option value="CONFIRMADO">CONFIRMADO</option>
                      <option value="PREPARANDO">PREPARANDO</option>
                      <option value="EN CAMINO">EN CAMINO</option>
                      <option value="ENTREGADO">ENTREGADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: SUPABASE DATABASE & SQL CONFIGURATION */}
        {/* ========================================================= */}
        {activeTab === 'database' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-[#0f0f0f] border border-[#222] p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2">
                <Database className="w-6 h-6 text-[#B7FF00]" />
                <h2 className="text-xl font-black uppercase text-white">Configuración del Proyecto Supabase</h2>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Este sistema está conectado directamente al proyecto Supabase oficial del cliente. Cada acción de creación, edición rápida por columna o eliminación interactúa directamente con tus tablas de PostgreSQL protegidas con RLS.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-3 bg-[#161616] rounded-xl border border-[#2a2a2a]">
                  <span className="text-zinc-500 font-bold block uppercase text-[10px]">Supabase URL</span>
                  <span className="font-mono text-[#FFE500] font-bold">https://lazxzjumhxpetfmfbene.supabase.co</span>
                </div>
                <div className="p-3 bg-[#161616] rounded-xl border border-[#2a2a2a]">
                  <span className="text-zinc-500 font-bold block uppercase text-[10px]">Storage Buckets</span>
                  <span className="font-mono text-[#B7FF00] font-bold">product-images / products (Públicos)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleReSyncDatabase}
                  className="px-4 py-2.5 bg-[#FFE500] hover:bg-[#B7FF00] text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow transition-all active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sincronizar y Restaurar Catálogo Base con Supabase</span>
                </button>
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-[#222] p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-white uppercase">Schema SQL Completo y Actualizado</h3>
                  <p className="text-xs text-zinc-400">Incluye soporte de IDs tipo TEXT, combo_items, RLS y triggers de perfiles</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `-- SUPABASE SCHEMA SUPER COMBOS\n-- Consultar archivo /supabase/schema.sql en el repositorio`
                    );
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="px-4 py-2 bg-[#FFE500] text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? '¡Copiado!' : 'Copiar Referencia'}</span>
                </button>
              </div>

              <div className="p-4 bg-black rounded-2xl border border-[#222] font-mono text-[11px] text-zinc-300 max-h-80 overflow-y-auto space-y-2">
                <p className="text-[#B7FF00] font-bold">-- Tablas gestionadas en PostgreSQL:</p>
                <p className="text-zinc-400">1. public.categories (id TEXT, name, slug, description, image_url, active)</p>
                <p className="text-zinc-400">2. public.products (id TEXT, category_id, name, slug, description, price, previous_price, stock, unit, subcategory, active, featured, is_offer)</p>
                <p className="text-zinc-400">3. public.combos (id TEXT, name, description, price, previous_price, image_url, items_summary, active, featured)</p>
                <p className="text-zinc-400">4. public.combo_items (id TEXT, combo_id, product_id, quantity, unit)</p>
                <p className="text-zinc-400">5. public.orders y public.order_items</p>
                <p className="text-zinc-400">6. public.profiles (id UUID, name, role)</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* PRODUCT CREATE/EDIT FULL MODAL */}
      {/* ========================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border-2 border-[#FFE500] rounded-3xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#222]">
              <h3 className="font-black text-lg text-white uppercase">
                {editingProduct ? 'Editar Producto en Supabase' : 'Crear Nuevo Producto en Supabase'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form key={editingProduct ? editingProduct.id : 'new-product'} onSubmit={handleSaveProductModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">Nombre del Producto *</label>
                <input
                  name="name"
                  defaultValue={editingProduct?.name || ''}
                  required
                  placeholder="Ej: Tomate Redondo Seleccionado"
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">Categoría *</label>
                  <select
                    name="category_id"
                    defaultValue={editingProduct?.category_id || categories[0]?.id}
                    required
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">Unidad de Venta</label>
                  <input
                    name="unit"
                    defaultValue={editingProduct?.unit || 'kg'}
                    placeholder="kg, unidad, bandeja..."
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              </div>

              {/* Category selector */}

              <div>
                <label className="block font-bold text-zinc-300 mb-1">Descripción</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description || ''}
                  rows={2}
                  placeholder="Detalles sobre frescura, origen o variedad..."
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">Precio ($) *</label>
                  <input
                    name="price"
                    type="number"
                    defaultValue={editingProduct?.price || ''}
                    required
                    min={0}
                    step="any"
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">Precio Anterior ($)</label>
                  <input
                    name="previous_price"
                    type="number"
                    defaultValue={editingProduct?.previous_price || ''}
                    min={0}
                    step="any"
                    placeholder="Para tachar..."
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">Stock Disponible *</label>
                  <input
                    name="stock"
                    type="number"
                    defaultValue={editingProduct?.stock ?? 50}
                    required
                    min={0}
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              </div>

              {/* Image Input with Supabase Storage File Uploader */}
              <div className="space-y-1.5">
                <label className="block font-bold text-zinc-300">Imagen (URL o Subir a Supabase Storage)</label>
                <div className="flex gap-2">
                  <input
                    id="modal-product-image-url"
                    name="image_url"
                    defaultValue={editingProduct?.image_url || ''}
                    placeholder="https://..."
                    className="flex-1 bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                  />
                  <label className="px-3 py-2 bg-[#222] hover:bg-[#333] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1 shrink-0">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 text-[#B7FF00] animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#B7FF00]" />
                    )}
                    <span>{uploadingImage ? 'Subiendo...' : 'Subir archivo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, 'modal-product-image-url')}
                    />
                  </label>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 font-bold text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={editingProduct ? editingProduct.active : true}
                    className="rounded text-[#FFE500] focus:ring-0"
                  />
                  <span>Producto Activo</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_offer"
                    defaultChecked={editingProduct ? editingProduct.is_offer : false}
                    className="rounded text-[#FFE500] focus:ring-0"
                  />
                  <span>🔥 En Oferta</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editingProduct ? editingProduct.featured : false}
                    className="rounded text-[#B7FF00] focus:ring-0"
                  />
                  <span>⭐ Destacado</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-[#1a1a1a] text-zinc-400 hover:text-white rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProductModal}
                  className="px-6 py-2 bg-[#FFE500] hover:bg-[#B7FF00] text-black font-black uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isSavingProductModal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando en Supabase...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Guardar Cambios' : 'Crear Producto'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* COMBO CREATE/EDIT MODAL WITH STRUCTURED PRODUCTS BUILDER */}
      {/* ========================================================= */}
      {isComboModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border-2 border-[#FFE500] rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#222]">
              <h3 className="font-black text-lg text-white uppercase">
                {editingCombo ? 'Editar Super Combo' : 'Crear Nuevo Super Combo'}
              </h3>
              <button
                onClick={() => setIsComboModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form key={editingCombo ? editingCombo.id : 'new-combo'} onSubmit={handleSaveComboModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">Nombre del Combo *</label>
                <input
                  name="name"
                  defaultValue={editingCombo?.name || ''}
                  required
                  placeholder="Ej: SUPER COMBO ASADO CRIOLLO"
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">Descripción</label>
                <textarea
                  name="description"
                  defaultValue={editingCombo?.description || ''}
                  rows={2}
                  placeholder="Detalles sobre para cuántas personas rinde..."
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">Precio Actual ($) *</label>
                  <input
                    name="price"
                    type="number"
                    defaultValue={editingCombo?.price || ''}
                    required
                    min={0}
                    step="any"
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">Precio Anterior ($)</label>
                  <input
                    name="previous_price"
                    type="number"
                    defaultValue={editingCombo?.previous_price || ''}
                    min={0}
                    step="any"
                    placeholder="Para tachar..."
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              </div>

              {/* STRUCTURED PRODUCT ITEMS BUILDER */}
              <div className="p-4 bg-[#141414] border border-[#242424] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#FFE500] uppercase text-[11px]">
                    Productos que componen este Combo (Relación Estructurada)
                  </label>
                  <span className="text-[11px] text-zinc-400">{comboItemsDraft.length} productos agregados</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedProductIdForCombo}
                    onChange={(e) => {
                      setSelectedProductIdForCombo(e.target.value);
                      const prod = products.find((p) => p.id === e.target.value);
                      if (prod) setSelectedUnitForCombo(prod.unit || 'kg');
                    }}
                    className="flex-1 min-w-[180px] bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.price} / {p.unit || 'kg'})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={selectedQtyForCombo}
                    onChange={(e) => setSelectedQtyForCombo(Number(e.target.value))}
                    className="w-16 bg-[#1a1a1a] border border-[#333] rounded-xl px-2 py-2 text-white text-xs text-center focus:outline-none focus:border-[#FFE500]"
                    placeholder="Cant."
                  />

                  <input
                    type="text"
                    value={selectedUnitForCombo}
                    onChange={(e) => setSelectedUnitForCombo(e.target.value)}
                    className="w-16 bg-[#1a1a1a] border border-[#333] rounded-xl px-2 py-2 text-white text-xs text-center focus:outline-none focus:border-[#FFE500]"
                    placeholder="kg/unid"
                  />

                  <button
                    type="button"
                    onClick={handleAddProductToComboDraft}
                    className="px-3 py-2 bg-[#FFE500] hover:bg-[#B7FF00] text-black font-black rounded-xl cursor-pointer transition-all"
                  >
                    + Agregar
                  </button>
                </div>

                {/* Items in Combo table */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {comboItemsDraft.length === 0 ? (
                    <p className="text-zinc-500 italic text-[11px]">
                      No has agregado productos a este combo todavía. Seleccioná arriba y hacé clic en "+ Agregar".
                    </p>
                  ) : (
                    comboItemsDraft.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#1c1c1c] border border-[#282828] text-xs"
                      >
                        <span className="font-bold text-white truncate">{item.product_name}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono text-[#B7FF00] font-bold">
                            {item.quantity} {item.unit || 'kg'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProductFromComboDraft(index)}
                            className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Image Input */}
              <div className="space-y-1.5">
                <label className="block font-bold text-zinc-300">Imagen del Combo</label>
                <div className="flex gap-2">
                  <input
                    id="modal-combo-image-url"
                    name="image_url"
                    defaultValue={editingCombo?.image_url || ''}
                    placeholder="https://..."
                    className="flex-1 bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                  />
                  <label className="px-3 py-2 bg-[#222] hover:bg-[#333] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1 shrink-0">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 text-[#B7FF00] animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#B7FF00]" />
                    )}
                    <span>Subir archivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, 'modal-combo-image-url')}
                    />
                  </label>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 font-bold text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={editingCombo ? editingCombo.active : true}
                    className="rounded text-[#FFE500] focus:ring-0"
                  />
                  <span>Combo Activo</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editingCombo ? editingCombo.featured : true}
                    className="rounded text-[#B7FF00] focus:ring-0"
                  />
                  <span>⭐ Destacado en Home</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setIsComboModalOpen(false)}
                  className="px-4 py-2 bg-[#1a1a1a] text-zinc-400 hover:text-white rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingComboModal}
                  className="px-6 py-2 bg-[#FFE500] hover:bg-[#B7FF00] text-black font-black uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isSavingComboModal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando Combo...</span>
                    </>
                  ) : (
                    <span>{editingCombo ? 'Guardar Cambios' : 'Crear Super Combo'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CATEGORY CREATE/EDIT MODAL */}
      {/* ========================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border-2 border-[#FFE500] rounded-3xl max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[#222]">
              <h3 className="font-black text-lg text-white uppercase">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form key={editingCategory ? editingCategory.id : 'new-category'} onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">Nombre *</label>
                <input
                  name="name"
                  defaultValue={editingCategory?.name || ''}
                  required
                  placeholder="Ej: Fiambrería"
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">Slug</label>
                <input
                  name="slug"
                  defaultValue={editingCategory?.slug || ''}
                  placeholder="fiambreria"
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">Descripción</label>
                <textarea
                  name="description"
                  defaultValue={editingCategory?.description || ''}
                  rows={2}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">Imagen de Fondo (URL)</label>
                <input
                  name="image_url"
                  defaultValue={editingCategory?.image_url || ''}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <label className="flex items-center gap-2 font-bold text-zinc-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={editingCategory ? editingCategory.active : true}
                  className="rounded text-[#FFE500] focus:ring-0"
                />
                <span>Categoría Activa</span>
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-[#1a1a1a] text-zinc-400 hover:text-white rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategoryModal}
                  className="px-6 py-2 bg-[#FFE500] hover:bg-[#B7FF00] text-black font-black uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isSavingCategoryModal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Categoría</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* DEDICATED OFFER MODAL (MODIFY OR CREATE OFFER) */}
      {/* ========================================================= */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border-2 border-[#FFE500] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#222]">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#FFE500] fill-[#FFE500]" />
                <h3 className="font-black text-lg text-white uppercase">
                  {editingOffer ? 'Modificar Oferta' : 'Configurar Nueva Oferta'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsOfferModalOpen(false);
                  setEditingOffer(null);
                }}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form key={editingOffer ? editingOffer.id : 'new-offer'} onSubmit={handleSaveOfferModal} className="space-y-4 text-xs">
              {!editingOffer && (
                <div className="p-3 bg-[#141414] rounded-2xl border border-[#242424] space-y-3">
                  <label className="block font-bold text-[#FFE500] uppercase text-[11px]">
                    Seleccionar Producto del Catálogo para poner en Oferta
                  </label>
                  <input type="hidden" name="offer_mode" value="existing" />
                  <select
                    value={selectedProductToOfferId}
                    onChange={(e) => setSelectedProductToOfferId(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — Precio habitual: ${p.price} / {p.unit || 'kg'} {p.is_offer ? '(Ya en oferta)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editingOffer && (
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">Nombre del Producto</label>
                  <input
                    name="name"
                    defaultValue={editingOffer.name}
                    required
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#FFE500] mb-1">
                    Precio de Oferta ($) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    defaultValue={editingOffer ? editingOffer.price : ''}
                    placeholder="Ej: 1450"
                    required
                    min={0}
                    step="any"
                    className="w-full bg-[#161616] border-2 border-[#FFE500]/60 focus:border-[#FFE500] rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">
                    Precio Anterior Tachado ($)
                  </label>
                  <input
                    name="previous_price"
                    type="number"
                    defaultValue={
                      editingOffer
                        ? editingOffer.previous_price || ''
                        : products.find((p) => p.id === selectedProductToOfferId)?.price || ''
                    }
                    placeholder="Ej: 1900 (para mostrar el descuento)"
                    min={0}
                    step="any"
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              </div>

              {editingOffer && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-300 mb-1">Stock Disponible</label>
                    <input
                      name="stock"
                      type="number"
                      defaultValue={editingOffer.stock}
                      min={0}
                      className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFE500]"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 font-bold text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name="active"
                        defaultChecked={editingOffer.active}
                        className="rounded text-[#FFE500] focus:ring-0"
                      />
                      <span>Oferta Activa en Web</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => {
                    setIsOfferModalOpen(false);
                    setEditingOffer(null);
                  }}
                  className="px-4 py-2 bg-[#1a1a1a] text-zinc-400 hover:text-white rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingOfferModal}
                  className="px-6 py-2 bg-[#FFE500] hover:bg-[#B7FF00] text-black font-black uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isSavingOfferModal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando Oferta...</span>
                    </>
                  ) : (
                    <span>Guardar Oferta en Supabase</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GLOBAL CONFIRM DELETE MODAL (NEVER BLOCKED BY BROWSER IFRAME) */}
      {/* ========================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0e0e0e] border-2 border-red-500 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">
                  ¿Eliminar {deleteTarget.type === 'product' ? 'Producto' : deleteTarget.type === 'combo' ? 'Super Combo' : 'Categoría'}?
                </h3>
                <p className="text-xs text-zinc-400">
                  Esta acción borrará el registro de Supabase permanentemente.
                </p>
              </div>
            </div>

            <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-2xl text-xs text-zinc-300">
              Vas a eliminar: <strong className="text-white font-bold block mt-0.5 text-sm">{deleteTarget.name}</strong>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#222]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeletingTarget}
                className="px-4 py-2.5 bg-[#181818] hover:bg-[#222] text-zinc-300 hover:text-white rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingTarget}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeletingTarget ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, Eliminar de Supabase</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
