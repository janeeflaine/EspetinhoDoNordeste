
import React, { useState } from 'react';
import { FolderOpen, Package, Users, Plus, Pencil, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { Product, CategoryItem } from '../types';
import { ProductFormModal } from './ProductFormModal';
import { CategoryFormModal } from './CategoryFormModal';

interface AdminDashboardProps {
  products: Product[];
  categories: CategoryItem[];
  onToggleAvailability: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onAddProduct: (product: any) => void;
  onUpdateProduct: (product: Product) => void;
  // Category Actions
  onAddCategory: (data: any) => void;
  onUpdateCategory: (data: CategoryItem) => void;
  onDeleteCategory: (id: string) => void;
  onToggleCategoryStatus: (id: string) => void;
  onReorderCategory: (id: string, direction: 'up' | 'down') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  onToggleAvailability,
  onDeleteProduct,
  onAddProduct,
  onUpdateProduct,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onToggleCategoryStatus,
  onReorderCategory
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'users'>('categories');

  // Product Modal State
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category Modal State
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // --- Product Handlers ---
  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = (data: any) => {
    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...data });
    } else {
      onAddProduct(data);
    }
  };

  // --- Category Handlers ---
  const handleAddNewCategory = () => {
    setEditingCategory(null);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (category: CategoryItem) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleSaveCategory = (data: any) => {
    if (editingCategory) {
      onUpdateCategory({ ...editingCategory, ...data });
    } else {
      onAddCategory(data);
    }
  };

  // Filter out 'Todos' for management
  const manageableCategories = categories.filter(c => c.id !== 'Todos');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
        <p className="text-zinc-400">Gerencie produtos e usuários do sistema</p>
      </div>

      <div className="space-y-6">
        {/* Tab List */}
        <div className="inline-flex h-9 items-center justify-center rounded-lg p-1 text-zinc-400 bg-zinc-900 border border-zinc-800 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('categories')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 sm:flex-none ${activeTab === 'categories' ? 'bg-red-600 text-white shadow' : 'hover:text-white'
              }`}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Categorias
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 sm:flex-none ${activeTab === 'products' ? 'bg-red-600 text-white shadow' : 'hover:text-white'
              }`}
          >
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 sm:flex-none ${activeTab === 'users' ? 'bg-red-600 text-white shadow' : 'hover:text-white'
              }`}
          >
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </button>
        </div>

        {/* Tab Content: Categories */}
        {activeTab === 'categories' && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow animate-fade-in">
            <div className="space-y-1.5 p-6 flex flex-row items-center justify-between">
              <div className="font-semibold leading-none tracking-tight text-white">Gerenciar Categorias</div>
              <button
                onClick={handleAddNewCategory}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-white shadow h-9 px-4 py-2 bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </button>
            </div>

            <div className="p-6 pt-0">
              <div className="space-y-3">
                {manageableCategories.map((cat, index) => (
                  <div key={cat.id} className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      {/* Info */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <h3 className="text-white font-medium">{cat.label}</h3>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        {/* Ordering */}
                        <button
                          onClick={() => onReorderCategory(cat.id, 'up')}
                          disabled={index === 0}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none hover:bg-zinc-800 h-9 w-9 text-zinc-400 hover:text-white disabled:opacity-30"
                        >
                          <MoveUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onReorderCategory(cat.id, 'down')}
                          disabled={index === manageableCategories.length - 1}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none hover:bg-zinc-800 h-9 w-9 text-zinc-400 hover:text-white disabled:opacity-30"
                        >
                          <MoveDown className="h-4 w-4" />
                        </button>

                        {/* Switch Status */}
                        <div className="flex items-center gap-2 ml-2 mr-2">
                          <span className={`text-sm ${cat.active ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {cat.active ? 'Ativa' : 'Inativa'}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={cat.active}
                            onClick={() => onToggleCategoryStatus(cat.id)}
                            className={`peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${cat.active ? 'bg-green-600' : 'bg-zinc-700'
                              }`}
                          >
                            <span
                              className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${cat.active ? 'translate-x-4' : 'translate-x-0'
                                }`}
                            ></span>
                          </button>
                        </div>

                        {/* Actions */}
                        <button
                          onClick={() => handleEditCategory(cat)}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-zinc-800 h-9 w-9 text-blue-500 hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCategory(cat.id)}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-zinc-800 h-9 w-9 text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Products */}
        {activeTab === 'products' && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow animate-fade-in">
            <div className="space-y-1.5 p-6 flex flex-row items-center justify-between">
              <div className="font-semibold leading-none tracking-tight text-white">Gerenciar Produtos</div>
              <button
                onClick={handleAddNewProduct}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-green-600 hover:bg-green-700 text-white shadow"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </button>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className={`p-4 bg-zinc-900 rounded-lg border border-zinc-800 transition-all hover:border-zinc-700 ${!product.available ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-2xl">
                            {product.icon}
                          </div>
                        )}
                        <div>
                          <h3 className="text-white font-medium">{product.name}</h3>
                          <div className="flex gap-2">
                            <span className="text-amber-400 text-sm font-bold">R$ {product.price.toFixed(2)}</span>
                            <span className="text-zinc-600 text-sm">•</span>
                            <span className="text-zinc-500 text-xs mt-0.5">{product.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-auto">

                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${product.available ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {product.available ? 'Disponível' : 'Indisponível'}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={product.available}
                            onClick={() => onToggleAvailability(product.id)}
                            className={`peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${product.available ? 'bg-green-600' : 'bg-zinc-700'
                              }`}
                          >
                            <span
                              className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${product.available ? 'translate-x-4' : 'translate-x-0'
                                }`}
                            ></span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleEditProduct(product)}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-zinc-800 h-9 w-9 text-blue-500 hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-zinc-800 h-9 w-9 text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-500">
            Funcionalidade de Usuários em desenvolvimento...
          </div>
        )}
      </div>

      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
      />

      <CategoryFormModal
        isOpen={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        onSave={handleSaveCategory}
        categoryToEdit={editingCategory}
      />
    </div>
  );
};
