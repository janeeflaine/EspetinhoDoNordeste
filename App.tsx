
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
import { PRODUCTS, CATEGORIES } from './constants';
import { Product, CartItem, Category, CategoryItem } from './types';
import { Plus, Phone, MapPin, Minus, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'shop' | 'admin' | 'privacy'>('shop');

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Check session storage on mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Initial state contains ONLY safe products. 
  // Alcohol products are NEVER in this initial state to pass crawler checks.
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORIES);

  const [activeCategory, setActiveCategory] = useState<Category | 'Todos'>('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);

  // Flag to track if restricted content has been loaded into memory
  const [isAlcoholLoaded, setIsAlcoholLoaded] = useState(false);

  // Shop Logic
  const filteredProducts = useMemo(() => {
    let filtered = products;
    // Only show available products in shop
    if (currentView === 'shop') {
      filtered = filtered.filter(p => p.available);

      // Filter out products belonging to inactive categories
      const inactiveCategoryIds = categories.filter(c => !c.active).map(c => c.id);
      filtered = filtered.filter(p => !inactiveCategoryIds.includes(p.category));
    }

    // STRICT RULE: Hide 'Bebidas' from 'Todos' view regardless of loaded state
    if (activeCategory === 'Todos') {
      return filtered.filter(p => p.category !== 'Bebidas');
    }

    return filtered.filter((p) => p.category === activeCategory);
  }, [activeCategory, products, currentView, categories]);

  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
        );
      }
      return [...prev, { ...product, quantity: quantityToAdd }];
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
  const handleCategorySelect = (category: Category | 'Todos') => {
    if (category === 'Bebidas') {
      // If already loaded, just switch. If not, ask for permission (which triggers load).
      if (isAlcoholLoaded) {
        setActiveCategory(category);
      } else {
        setIsAgeModalOpen(true);
      }
    } else {
      setActiveCategory(category);
    }
  };

  const handleAgeConfirm = async () => {
    try {
      // DYNAMIC IMPORT: This strictly isolates alcohol data.
      // It is only fetched after user interaction, safe from crawlers.
      const module = await import('./alcoholData');
      const restrictedProducts = module.RESTRICTED_PRODUCTS;

      setProducts(prev => {
        // Avoid duplicates
        const existingIds = new Set(prev.map(p => p.id));
        const newProducts = restrictedProducts.filter(p => !existingIds.has(p.id));
        return [...prev, ...newProducts];
      });

      setIsAlcoholLoaded(true);
      setActiveCategory('Bebidas');
      setIsAgeModalOpen(false);
    } catch (error) {
      console.error("Failed to load restricted content. Blocked by policy or network.", error);
      // If loading fails, we keep the user out.
      setIsAgeModalOpen(false);
    }
  };

  const handleAgeDeny = () => {
    setIsAgeModalOpen(false);
  };

  // --- Admin Logic: Products ---
  const handleToggleAvailability = (id: string) => {
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, available: !p.available } : p
    ));
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      removeItem(id);
    }
  };

  const handleAddProduct = (newProductData: any) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: newProductData.name,
      price: newProductData.price,
      category: newProductData.category,
      image: newProductData.image || undefined,
      icon: newProductData.emoji || '📦',
      available: true,
      description: ''
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p =>
      p.id === updatedProduct.id ? updatedProduct : p
    ));
    setCart(prev => prev.map(item =>
      item.id === updatedProduct.id
        ? { ...updatedProduct, quantity: item.quantity }
        : item
    ));
  };

  // --- Admin Logic: Categories ---
  const handleAddCategory = (data: any) => {
    const newCategory: CategoryItem = {
      id: data.label,
      label: data.label,
      icon: data.icon || '📦',
      active: true
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const handleUpdateCategory = (data: CategoryItem) => {
    setCategories(prev => prev.map(c => c.id === data.id ? data : c));
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Excluir categoria? Produtos nesta categoria ficarão órfãos ou invisíveis.')) {
      setCategories(prev => prev.filter(c => c.id !== id));
      if (activeCategory === id) setActiveCategory('Todos');
    }
  };

  const handleToggleCategoryStatus = (id: string) => {
    setCategories(prev => prev.map(c =>
      c.id === id ? { ...c, active: !c.active } : c
    ));
    if (activeCategory === id) setActiveCategory('Todos');
  };

  const handleReorderCategory = (id: string, direction: 'up' | 'down') => {
    setCategories(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index === -1) return prev;

      const newCategories = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex <= 0 || targetIndex >= newCategories.length) return prev;

      [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
      return newCategories;
    });
  };

  // Helper to get quantity of a specific product in cart
  const getProductQuantity = (productId: string) => {
    const item = cart.find(i => i.id === productId);
    return item ? item.quantity : 0;
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
    setIsAuthenticated(true);
    sessionStorage.setItem('admin_auth', 'true');
    setIsLoginModalOpen(false);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setCurrentView('shop');
  };

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
                    className={`bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-4 border transition-all duration-300 group cursor-pointer ${quantity > 0 ? 'border-red-600/30' : 'border-zinc-800 hover:border-red-600/50'}`}
                  >
                    <div className="flex items-center gap-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-xl object-cover shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600/20 to-amber-500/20 flex items-center justify-center text-3xl">
                          {product.icon}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate text-base">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-xs text-zinc-500 truncate mb-1">{product.description}</p>
                        )}
                        <p className="text-amber-400 font-bold text-lg">
                          R$ {product.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center">
                        {quantity > 0 ? (
                          <div className="flex items-center bg-zinc-800 rounded-full border border-red-600/30 h-10 shadow-lg overflow-hidden">
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
                                addToCart(product);
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
                              addToCart(product);
                            }}
                            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-transform active:scale-95"
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
                  <span className="text-amber-500 font-medium">Entregamos em todo o Distrito.</span>
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
