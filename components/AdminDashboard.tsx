
import React, { useState } from 'react';
import { FolderOpen, Package, Users, Plus, Pencil, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { Product, CategoryItem, Accompaniment } from '../types';
import { Utensils } from 'lucide-react';
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
  // Accompaniment Props
  accompaniments: Accompaniment[];
  onAddAccompaniment: (data: any) => void;
  onDeleteAccompaniment: (id: string) => void;
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
  onReorderCategory,
  accompaniments,
  onAddAccompaniment,
  onDeleteAccompaniment
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'users' | 'accompaniments'>('categories');

  // New Accompaniment State
  const [newAccName, setNewAccName] = useState('');
  const [newAccPrice, setNewAccPrice] = useState('');
  const [newAccCategory, setNewAccCategory] = useState('');

  const handleCreateAccompaniment = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAccompaniment({
      name: newAccName,
      price: Number(newAccPrice),
      categoryId: newAccCategory
    });
    setNewAccName('');
    setNewAccPrice('');
    setNewAccCategory('');
  };

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
          <button
            onClick={() => setActiveTab('accompaniments')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 sm:flex-none ${activeTab === 'accompaniments' ? 'bg-red-600 text-white shadow' : 'hover:text-white'
              }`}
          >
            <Utensils className="h-4 w-4 mr-2" />
            Acompanhamentos
          </button>
        </div>

        {/* Tab Content: Accompaniments */}
        {activeTab === 'accompaniments' && (
          <div className="space-y-6 animate-fade-in">

            {/* Add New Accompaniment */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow">
              <h2 className="text-white font-bold mb-4">Adicionar Novo Acompanhamento</h2>
              <form onSubmit={handleCreateAccompaniment} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Nome</label>
                  <input
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-red-600 outline-none"
                    placeholder="Ex: Farofa, Bacon Extra"
                    value={newAccName}
                    onChange={e => setNewAccName(e.target.value)}
                    required
                  />
                </div>
                <div className="w-full md:w-32">
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Preço (R$)</label>
                  <input
                    type="number" step="0.01"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-red-600 outline-none"
                    placeholder="0.00"
                    value={newAccPrice}
                    onChange={e => setNewAccPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="w-full md:w-48">
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Categoria</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-red-600 outline-none"
                    value={newAccCategory}
                    onChange={e => setNewAccCategory(e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    {manageableCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors"
                >
                  Adicionar
                </button>
              </form>
            </div>

            {/* List */}
            <div className="space-y-3">
              <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider">Acompanhamentos Cadastrados</h3>
              {accompaniments.length === 0 ? (
                <div className="text-zinc-500 italic">Nenhum acompanhamento cadastrado.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accompaniments.map(acc => {
                    const categoryName = categories.find(c => c.id === acc.categoryId)?.label || 'Desconhecida';
                    return (
                      <div key={acc.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                        <div>
                          <h4 className="text-white font-bold">{acc.name}</h4>
                          <div className="text-xs text-zinc-500 mt-1 flex gap-2">
                            <span>{categoryName}</span>
                            <span className="text-zinc-700">•</span>
                            <span className={acc.price > 0 ? 'text-amber-500' : 'text-green-500'}>
                              {acc.price > 0 ? `+ R$ ${acc.price.toFixed(2)}` : 'Grátis'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteAccompaniment(acc.id)}
                          className="text-zinc-600 hover:text-red-500 p-2 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

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
                            <span className="text-zinc-500 text-xs mt-0.5">
                              {categories.find(c => c.id === product.categoryId)?.label || 'Deseconhecida'}
                            </span>
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
