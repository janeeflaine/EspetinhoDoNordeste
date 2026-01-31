
import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { CartDrawer } from './components/CartDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { CartFooter } from './components/CartFooter';
import { ProductModal } from './components/ProductModal';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { AdminLogin } from './components/AdminLogin';
import { Product, CartItem, Category, CategoryItem, Accompaniment } from './types';
import { Plus, Phone, MapPin, Minus, ShieldCheck } from 'lucide-react';
import { supabase } from './supabase';

import { StoreClosedScreen } from './components/StoreClosedScreen';
import { StoreMessage } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'shop' | 'admin' | 'privacy'>('shop');

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Store Status State
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [closedMessage, setClosedMessage] = useState<StoreMessage | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) {
        console.log("User Logged In (Initial Session):", session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        console.log("User Logged In (Auth Change):", session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Store Status & Subscribe
  useEffect(() => {
    fetchStoreStatus();

    // Realtime Subscription
    const channel = supabase
      .channel('public:store_config')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'store_config', filter: 'id=eq.1' },
        (payload) => {
          setIsStoreOpen(payload.new.is_open);
          fetchStoreStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- AUTOMATIC SCHEDULING ENGINE ---
  const [schedules, setSchedules] = useState<any[]>([]);
  const [useSchedule, setUseSchedule] = useState(false);

  useEffect(() => {
    // 1. Fetch Schedules when config loads (if enabled)
    if (useSchedule) {
      fetchSchedules();
    }

    // 2. Poll every minute
    const interval = setInterval(() => {
      if (useSchedule && schedules.length > 0) {
        checkSchedule();
      }
    }, 60000); // 1 min

    // Run once immediately if enabled
    if (useSchedule && schedules.length > 0) checkSchedule();

    return () => clearInterval(interval);
  }, [useSchedule, schedules.length]); // Re-run if enabled changes or schedules load

  const fetchSchedules = async () => {
    const { data } = await supabase.from('store_schedules').select('*');
    if (data) setSchedules(data);
  };

  const checkSchedule = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let activeRule = null;

    for (const slot of schedules) {
      const [startH, startM] = slot.start_time.split(':').map(Number);
      const [endH, endM] = slot.end_time.split(':').map(Number);

      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      // Handle midnight crossing (Start 22:00, End 02:00)
      let isActive = false;
      if (endTotal < startTotal) {
        isActive = currentMinutes >= startTotal || currentMinutes < endTotal;
      } else {
        isActive = currentMinutes >= startTotal && currentMinutes < endTotal;
      }

      if (isActive) {
        activeRule = slot;
        break; // Found priority slot (assumes non-overlapping or first win)
      }
    }

    if (activeRule) {
      console.log("Auto Schedule Active Rule:", activeRule);
      setIsStoreOpen(activeRule.is_open);
      if (activeRule.message_id && !activeRule.is_open) {
        // We need the message body. We might need to fetch it or rely on existing loaded message.
        // For robustness, let's fetch the message if it's different from current.
        fetchMessageById(activeRule.message_id);
      }
    } else {
      // No rule matches = Default Closed? Or Open?
      // Prompt said: "Se não houver slot definido (limbo) -> Assume o estado padrão (Fechado)."
      console.log("Auto Schedule: No active rule (Limbo) -> CLOSED");
      setIsStoreOpen(false);
      // Optional: clear message or set default "Fechado" message
    }
  };

  const fetchMessageById = async (id: string) => {
    const { data } = await supabase.from('store_messages').select('*').eq('id', id).single();
    if (data) setClosedMessage(data);
  };


  const fetchStoreStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('store_config')
        .select(`
                is_open,
                active_message_id,
                use_schedule,
                store_messages (
                    id,
                    title,
                    message
                )
            `)
        .eq('id', 1)
        .single();

      if (data) {
        // If Manual, trust DB is_open
        // If Auto, trust DB is_open (which might be stale if no server-side, but Engine will override locally soon)
        // But for consistency:
        setUseSchedule(data.use_schedule);

        if (!data.use_schedule) {
          setIsStoreOpen(data.is_open);
          // @ts-ignore
          setClosedMessage(data.store_messages);
        } else {
          // If Auto, wait for Engine to kick in, but initially trust keys or fetch schedules
          fetchSchedules();
        }
      }
    } catch (err) {
      console.error("Failed to fetch store status", err);
    } finally {
      setInitialLoading(false);
    }
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [accompaniments, setAccompaniments] = useState<Accompaniment[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<Category | 'Todos'>('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);

  // Flag to track if restricted content has been loaded into memory
  const [isAlcoholLoaded, setIsAlcoholLoaded] = useState(false);

  // Initial Fetch
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('order', { ascending: true });

      if (catError) {
        console.error('Supabase Categories Error:', catError);
        alert(`Erro ao buscar categorias: ${catError.message}`);
        throw catError;
      }

      // Standardize IDs and ensure 'Todos'
      const dbCategories = (catData || []).map(c => ({
        ...c,
        id: c.id // Maintaining original ID but ensuring it exists
      }));

      // Identify Restricted Category (Compliance)
      const bebidasCat = dbCategories.find(c => c.label === 'Bebidas');
      const restrictedCategoryId = bebidasCat?.id;

      const hasTodos = dbCategories.some(c => c.id === 'Todos');
      if (!hasTodos) {
        setCategories([{ id: 'Todos', label: 'Todos', icon: '🍽️', active: true, order: -1 }, ...dbCategories]);
      } else {
        setCategories(dbCategories);
      }

      // Fetch Products (Zero-Exposition Rule)
      // We explicitly exclude restricted category from initial load
      let query = supabase.from('products').select('*');

      if (restrictedCategoryId) {
        query = query.neq('category_id', restrictedCategoryId);
      }

      const { data: prodData, error: prodError } = await query;

      if (prodError) {
        console.error('Supabase Products Error:', prodError);
        alert(`Erro ao buscar produtos: ${prodError.message}`);
        throw prodError;
      }

      // Map DB category_id to camelCase categoryId
      const mappedProducts = (prodData || []).map(p => ({
        ...p,
        categoryId: p.category_id,
      }));

      setProducts(mappedProducts);

      // Fetch Accompaniments
      const { data: accData, error: accError } = await supabase
        .from('accompaniments')
        .select('*');

      if (accError) {
        console.warn('Supabase Accompaniments Error:', accError);
      } else {
        const mappedAccs = (accData || []).map(a => ({
          ...a,
          categoryId: a.category_id
        }));
        setAccompaniments(mappedAccs);
      }

    } catch (error: any) {
      console.error('General Fetch Error:', error);
      // Detailed alert for production debugging
      if (error.message) {
        alert(`Erro de Conexão: ${error.message} - Verifique as variáveis de ambiente no Vercel.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Shop Logic
  const filteredProducts = useMemo(() => {

    // INTERCEPTION LOGIC
    // If store is closed AND user is NOT authenticated => Show Lock Screen
    if (!initialLoading && !isStoreOpen && !isAuthenticated) {
      return (
        <>
          <StoreClosedScreen
            message={closedMessage}
            onAdminLogin={() => setIsLoginModalOpen(true)}
          />
          <AdminLogin
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLogin={(status) => {
              setIsAuthenticated(status);
              if (status) setIsLoginModalOpen(false);
            }}
          />
        </>
      );
    }

    let filtered = products;

    // Filter out 'Bebidas' category from main grid if not confirmed age
    // We need to resolve ID for 'Bebidas'
    const bebidasCat = categories.find(c => c.label === 'Bebidas');

    // Only show available products in shop
    if (currentView === 'shop') {
      filtered = filtered.filter(p => p.available);

      // Filter out products belonging to inactive categories
      const inactiveCategoryIds = categories.filter(c => !c.active).map(c => c.id);
      filtered = filtered.filter(p => !inactiveCategoryIds.includes(p.categoryId));

      // Filter 'Bebidas' if needed
      if (bebidasCat && !isAlcoholLoaded) { // Only filter if not loaded yet
        filtered = filtered.filter(p => p.categoryId !== bebidasCat.id);
      }
    }

    if (activeCategory === 'Todos') return filtered;
    return filtered.filter((p) => p.categoryId === activeCategory);
  }, [activeCategory, products, currentView, categories, isAlcoholLoaded]);

  const addToCart = (product: Product, quantityToAdd: number = 1, selectedAccompaniments: Accompaniment[] = []) => {
    setCart((prev) => {
      // Create a unique hash or identifier for this configuration
      // We can't just use product.id anymore.
      // We will look for an item with the same product.id AND same accompaniments.
      const existingIndex = prev.findIndex((item) => {
        if (item.id !== product.id) return false;
        // Compare accompaniments
        const currentAccs = item.selectedAccompaniments || [];
        if (currentAccs.length !== selectedAccompaniments.length) return false;
        const currentIds = currentAccs.map(a => a.id).sort().join(',');
        const newIds = selectedAccompaniments.map(a => a.id).sort().join(',');
        return currentIds === newIds;
      });

      if (existingIndex > -1) {
        // Update existing item
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantityToAdd;
        return newCart;
      }

      // Add new item
      // Calculate total price for this item unit (base + accompaniments)
      // Note: We don't change product.price in the object, 
      // but the CartItem logic in CartDrawer might rely on product.price.
      // Wait, CartItem extends Product. 
      // The total calculation usually uses item.price. 
      // If we want the displayed price to reflect the sum, we should update 'price' on the cart item 
      // OR handle it in the total calculation everywhere.
      // Safe bet: Update the 'price' of the CartItem to be the unit price with extras.
      const extrasTotal = selectedAccompaniments.reduce((sum, acc) => sum + acc.price, 0);
      const finalUnitPrice = product.price + extrasTotal;

      const newItem: CartItem = {
        ...product,
        // We override price to include extras for easier calculation downstream
        price: finalUnitPrice,
        // We keep original base price reference if needed? Maybe not strictly necessary for this scope.
        quantity: quantityToAdd,
        selectedAccompaniments: selectedAccompaniments
      };

      return [...prev, newItem];
    });
  };
  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.id !== productId);
    });
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Category Selection Logic with Age Gate
  const handleCategorySelect = (categoryId: Category | 'Todos') => {
    const bebidasCat = categories.find(c => c.label === 'Bebidas');
    const isBebidas = bebidasCat && categoryId === bebidasCat.id;

    if (isBebidas) {
      // If already loaded, just switch. If not, ask for permission.
      if (isAlcoholLoaded) {
        setActiveCategory(categoryId);
      } else {
        setIsAgeModalOpen(true);
      }
    } else {
      setActiveCategory(categoryId);
    }
  };

  const handleAgeConfirm = async () => {
    try {
      // Fetch Restricted Products from Supabase
      // Resolve 'Bebidas' ID
      const bebidasCat = categories.find(c => c.label === 'Bebidas');
      if (!bebidasCat) {
        throw new Error("Categoria 'Bebidas' não encontrada.");
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', bebidasCat.id);

      if (error) throw error;

      setProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        // Ensure new products are mapped correctly if needed (e.g. category_id to categoryId)
        // Since we select *, we rely on standardizing the shape if we were mapping in fetchData
        // effectively we need to map them here too to match state shape
        const mappedNew = (data || []).map(p => ({
          ...p,
          categoryId: p.category_id
        }));

        const newProducts = mappedNew.filter(p => !existingIds.has(p.id));
        return [...prev, ...newProducts];
      });

      setIsAlcoholLoaded(true);
      setActiveCategory(bebidasCat.id);
      setIsAgeModalOpen(false);
    } catch (error) {
      console.error("Failed to load restricted content:", error);
      setIsAgeModalOpen(false);
    }
  };

  const handleAgeDeny = () => {
    setIsAgeModalOpen(false);
  };

  const handleToggleAvailability = async (id: string) => {
    if (!isAuthenticated) return;
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newAvailable = !product.available;

    // Update locally
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, available: newAvailable } : p
    ));

    // Update DB
    const { error } = await supabase
      .from('products')
      .update({ available: newAvailable })
      .eq('id', id);

    if (error) {
      console.error('Error updating availability:', error);
      // Revert local state if needed (optional for snappier UI)
      setProducts(prev => prev.map(p =>
        p.id === id ? { ...p, available: !newAvailable } : p
      ));
      alert('Erro ao atualizar disponibilidade.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!isAuthenticated) return;
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        alert('Erro ao excluir produto.');
        return;
      }

      setProducts(prev => prev.filter(p => p.id !== id));
      removeItem(id);
    }
  };

  const handleAddProduct = async (newProductData: any) => {
    if (!isAuthenticated) return;

    // Let DB generate ID or generate it here if needed. 
    // Previous code generated it here. We will stick to that but ensure types correct.
    const newId = crypto.randomUUID();

    const dbProduct = {
      id: newId,
      name: newProductData.name,
      price: newProductData.price,
      // Map categoryId from form to category_id column
      // Ensure empty string becomes null for UUID column
      category_id: newProductData.categoryId || null,
      image: newProductData.image || null,
      icon: newProductData.emoji || '📦',
      description: newProductData.description || '',
      available: true
    };

    const { data, error } = await supabase
      .from('products')
      .insert([dbProduct])
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      alert(`Erro ao adicionar produto: ${error.message}`);
      return;
    }

    if (data && data[0]) {
      // If it's a restricted product and not loaded yet, we don't show it in the store yet
      // unless we are in admin view where we might want to see everything.
      // But for simplicity, let's add it to state.
      setProducts(prev => [...prev, data[0]]);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    if (!isAuthenticated) return;
    console.log('Updating product:', updatedProduct.name); // Debug log

    const { data, error } = await supabase
      .from('products')
      .update({
        name: updatedProduct.name,
        price: updatedProduct.price,
        // Ensure empty string becomes null for UUID column
        category_id: updatedProduct.categoryId || null,
        image: updatedProduct.image || null,
        icon: updatedProduct.icon || '📦',
        description: updatedProduct.description || '',
        available: updatedProduct.available
      })
      .eq('id', updatedProduct.id)
      .select();

    if (error) {
      console.error('Supabase Update Error:', error);
      alert(`Erro ao salvar alterações: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      console.error('No data returned from update');
      alert('Erro desconhecido: O banco de dados não retornou confirmação.');
      return;
    }

    const savedProduct = data[0];
    console.log('Product updated successfully:', savedProduct);

    setProducts(prev => prev.map(p =>
      p.id === savedProduct.id ? savedProduct : p
    ));

    setCart(prev => prev.map(item =>
      item.id === savedProduct.id
        ? { ...savedProduct, quantity: item.quantity }
        : item
    ));
  };

  // --- Admin Logic: Categories ---
  const handleAddCategory = async (data: any) => {
    if (!isAuthenticated) return;
    const newCategory = {
      // id: auto-generated by DB (UUID)
      label: data.label,
      icon: data.icon || '📦',
      active: true,
      order: categories.length
    };

    const { data: dbData, error } = await supabase
      .from('categories')
      .insert([newCategory])
      .select();

    if (error) {
      console.error('Error adding category:', error);
      alert('Erro ao adicionar categoria.');
      return;
    }

    if (dbData && dbData[0]) {
      setCategories(prev => [...prev, dbData[0]]);
    }
  };

  const handleUpdateCategory = async (data: CategoryItem) => {
    if (!isAuthenticated) return;
    const { error } = await supabase
      .from('categories')
      .update({
        label: data.label,
        icon: data.icon,
        active: data.active,
        order: data.order
      })
      .eq('id', data.id);

    if (error) {
      console.error('Error updating category:', error);
      alert('Erro ao atualizar categoria.');
      return;
    }

    setCategories(prev => prev.map(c => c.id === data.id ? data : c));
  };

  const handleDeleteCategory = async (id: string) => {
    if (!isAuthenticated) return;
    if (window.confirm('Excluir categoria? Produtos nesta categoria ficarão órfãos ou invisíveis.')) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        alert('Erro ao excluir categoria.');
        return;
      }

      setCategories(prev => prev.filter(c => c.id !== id));
      if (activeCategory === id) setActiveCategory('Todos');
    }
  };

  const handleToggleCategoryStatus = async (id: string) => {
    if (!isAuthenticated) return;
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    const newActive = !cat.active;

    setCategories(prev => prev.map(c =>
      c.id === id ? { ...c, active: newActive } : c
    ));

    const { error } = await supabase
      .from('categories')
      .update({ active: newActive })
      .eq('id', id);

    if (error) console.error('Error toggling category:', error);

    if (activeCategory === id) setActiveCategory('Todos');
  };

  const handleReorderCategory = async (id: string, direction: 'up' | 'down') => {
    if (!isAuthenticated) return;
    // This is more complex for real ordering, but let's do a simple swap in state and DB
    setCategories(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index === -1) return prev;

      const newCategories = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newCategories.length) return prev;

      // Swap orders
      const tempOrder = newCategories[index].order;
      newCategories[index].order = newCategories[targetIndex].order;
      newCategories[targetIndex].order = tempOrder;

      [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];

      // Update both in DB (ideally in one transaction or use an RPC)
      updateCategoryOrderInDB(newCategories[index]);
      updateCategoryOrderInDB(newCategories[targetIndex]);

      return newCategories;
    });
  };

  const updateCategoryOrderInDB = async (cat: CategoryItem) => {
    await supabase.from('categories').update({ order: cat.order }).eq('id', cat.id);
  };

  // Helper to get quantity of a specific product in cart
  const getProductQuantity = (productId: string) => {
    const item = cart.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  // --- Accompaniment Logic ---
  const handleAddAccompaniment = async (data: any) => {
    if (!isAuthenticated) return;

    const newAcc = {
      name: data.name,
      price: data.price,
      category_id: data.categoryId,
      available: true
    };

    const { data: dbData, error } = await supabase
      .from('accompaniments')
      .insert([newAcc])
      .select();

    if (error) {
      console.error('Error adding accompaniment:', error);
      alert('Erro ao adicionar acompanhamento.');
      return;
    }

    if (dbData && dbData[0]) {
      // Map back to camelCase manually if needed or ensure types align
      const created = dbData[0];
      setAccompaniments(prev => [...prev, {
        id: created.id,
        name: created.name,
        price: created.price,
        categoryId: created.category_id,
        available: created.available
      }]);
    }
  };

  const handleDeleteAccompaniment = async (id: string) => {
    if (!isAuthenticated) return;
    if (window.confirm('Excluir acompanhamento?')) {
      const { error } = await supabase
        .from('accompaniments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting accompaniment:', error);
        return;
      }
      setAccompaniments(prev => prev.filter(a => a.id !== id));
    }
  };

  // Authentication Handlers
  const handleNavigate = (view: 'shop' | 'admin') => {
    if (view === 'admin' && !isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      setCurrentView(view);
    }
  };

  const handleLoginSuccess = () => {
    // Session is handled by onAuthStateChange, just close modal and switch view
    setIsLoginModalOpen(false);
    setCurrentView('admin');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('shop');
  };


  // INTERCEPTION LOGIC
  // If store is closed AND user is NOT authenticated => Show Lock Screen
  if (!initialLoading && !isStoreOpen && !isAuthenticated) {
    return (
      <>
        <StoreClosedScreen
          message={closedMessage}
          onAdminLogin={() => setIsLoginModalOpen(true)}
        />
        <AdminLogin
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={() => {
            setIsLoginModalOpen(false);
            // We don't force 'admin' view here because verifying auth state will re-render
            // But if we want to jump to admin, we can.
            // Default behavior of handleLoginSuccess sets 'admin'. 
            // But if I use handleLoginSuccess it sets view to 'admin'.
            handleLoginSuccess();
          }}
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 animate-pulse">Carregando cardápio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      {currentView === 'shop' ? (
        <>
          <Header />

          <main className="px-4 py-6 max-w-lg mx-auto pb-32">
            {/* Category Navigation */}
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={handleCategorySelect}
            />

            <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-2xl">
                {categories.find(c => c.id === activeCategory)?.icon || '🍽️'}
              </span>
              Cardápio
            </h2>

            {/* Product Grid */}
            <div className="space-y-3">
              {filteredProducts.map((product) => {
                const quantity = getProductQuantity(product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`bg-zinc-900 rounded-2xl p-4 border transition-all duration-300 group cursor-pointer ${quantity > 0 ? 'border-red-600/30' : 'border-zinc-800 hover:border-red-600/50'}`}
                  >
                    <div className="flex items-center gap-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-xl object-cover shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-red-600/10 flex items-center justify-center text-3xl">
                          {product.icon}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#FD8E00] truncate text-base">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-xs text-zinc-500 truncate mb-1">{product.description}</p>
                        )}
                        <p className="text-[#FD8E00] font-bold text-lg">
                          R$ {product.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center">
                        {quantity > 0 ? (
                          <div className="flex items-center bg-zinc-800 rounded-full border border-red-600/30 h-10 overflow-hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromCart(product.id);
                              }}
                              className="w-10 h-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-white text-sm">
                              {quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const hasAccompaniments = accompaniments.some(a => a.categoryId === product.categoryId && a.available);
                                if (hasAccompaniments) {
                                  setSelectedProduct(product);
                                } else {
                                  addToCart(product);
                                }
                              }}
                              className="w-10 h-full flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const hasAccompaniments = accompaniments.some(a => a.categoryId === product.categoryId && a.available);
                              if (hasAccompaniments) {
                                setSelectedProduct(product);
                              } else {
                                addToCart(product);
                              }
                            }}
                            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-600 hover:bg-red-700 text-white transition-transform active:scale-95"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Info */}
            <div className="mt-8 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center gap-3 text-zinc-400 text-sm">
                <Phone className="h-4 w-4" />
                <span>(33) 99948-8193</span>
              </div>
              <div className="flex items-start gap-3 text-zinc-400 text-sm">
                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                <div className="flex flex-col gap-1">
                  <span>Rua Laureano José Ferreita, 65 Distrito do Prata - Lajinha / MG</span>
                  <span className="text-xs opacity-70">Responsável: Jhonny E C Silva - CNPJ: 33.137.007/0001-09</span>
                  <span className="text-[#FD8E00] font-medium">Entregamos em todo o Distrito.</span>
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-800/50">
                <button
                  onClick={() => setCurrentView('privacy')}
                  className="flex items-center gap-2 text-zinc-500 text-xs hover:text-white transition-colors"
                >
                  <ShieldCheck className="h-3 w-3" />
                  Política de Privacidade
                </button>
              </div>
            </div>
          </main>

          {/* Sticky Cart Footer - replaces the floating button */}
          <CartFooter
            items={cart}
            onOpenCart={() => setIsCartOpen(true)}
          />
        </>
      ) : currentView === 'admin' ? (
        <AdminDashboard
          products={products}
          categories={categories}
          accompaniments={accompaniments}
          onToggleAvailability={handleToggleAvailability}
          onDeleteProduct={handleDeleteProduct}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          // Category props
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onToggleCategoryStatus={handleToggleCategoryStatus}
          onReorderCategory={handleReorderCategory}
          // Accompaniment props
          onAddAccompaniment={handleAddAccompaniment}
          onDeleteAccompaniment={handleDeleteAccompaniment}
        />
      ) : (
        <PrivacyPolicy onBack={() => setCurrentView('shop')} />
      )}

      {/* Product Details Modal */}
      <ProductModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        accompaniments={accompaniments}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />

      {/* Age Verification Modal */}
      <AgeVerificationModal
        isOpen={isAgeModalOpen}
        onConfirm={handleAgeConfirm}
        onDeny={handleAgeDeny}
      />

      {/* Admin Login Modal */}
      <AdminLogin
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
