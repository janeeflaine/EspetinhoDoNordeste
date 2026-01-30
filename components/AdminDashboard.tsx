import React, { useState, useEffect } from 'react';
import { FolderOpen, Package, Users, Plus, Pencil, Trash2, MoveUp, MoveDown, Utensils, Store as StoreIcon, MessageSquare } from 'lucide-react';
import { Product, CategoryItem, Accompaniment, StoreMessage } from '../types';
import { supabase } from '../supabase';
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
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'users' | 'accompaniments' | 'status'>('categories');

  // --- Store Status State ---
  const [storeStatus, setStoreStatus] = useState({ is_open: true, active_message_id: '' });
  const [storeMessages, setStoreMessages] = useState<StoreMessage[]>([]);
  const [newMessageTitle, setNewMessageTitle] = useState('');
  const [newMessageBody, setNewMessageBody] = useState('');

  useEffect(() => {
    if (activeTab === 'status') {
      fetchStoreConfig();
      fetchStoreMessages();
    }
  }, [activeTab]);

  const fetchStoreConfig = async () => {
    const { data } = await supabase.from('store_config').select('*').eq('id', 1).single();
    if (data) setStoreStatus({ is_open: data.is_open, active_message_id: data.active_message_id });
  };

  const fetchStoreMessages = async () => {
    const { data } = await supabase.from('store_messages').select('*').order('created_at', { ascending: false });
    if (data) setStoreMessages(data);
  };

  const handleToggleStoreOpen = async (newState: boolean) => {
    // Optimistic Update
    setStoreStatus(prev => ({ ...prev, is_open: newState }));

    // Check if config exists first (implicit via update return count check would be better, but simple update is fine for now)
    const { error, count } = await supabase.from('store_config').update({ is_open: newState }).eq('id', 1).select('id', { count: 'exact' });

    if (error) {
      console.error("Error updating store status", error);
      alert(`Erro ao atualizar status: ${error.message}`);
      fetchStoreConfig(); // Revert
    } else if (count === 0) {
      alert("Erro: Configuração da loja não encontrada (ID 1). Execute o script de correção no banco de dados.");
      fetchStoreConfig(); // Revert
    }
  };

  const handleSelectMessage = async (id: string) => {
    setStoreStatus(prev => ({ ...prev, active_message_id: id }));
    const { error } = await supabase.from('store_config').update({ active_message_id: id }).eq('id', 1);
    if (error) alert(`Erro ao selecionar mensagem: ${error.message}`);
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('store_messages').insert([{
      title: newMessageTitle,
      message: newMessageBody
    }]).select();

    if (error) {
      console.error("Error creating message", error);
      alert(`Erro ao criar mensagem: ${error.message}`);
    } else if (data) {
      setStoreMessages(prev => [data[0], ...prev]);
      setNewMessageTitle('');
      setNewMessageBody('');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm("Excluir esta mensagem?")) return;

    const { error } = await supabase.from('store_messages').delete().eq('id', id);
    if (error) {
      alert("Erro ao excluir mensagem.");
    } else {
      setStoreMessages(prev => prev.filter(m => m.id !== id));
    }
  };


  // --- Accompaniment State ---
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
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${activeTab === 'categories' ? 'bg-red-600 text-white shadow' : 'hover:text-white'}`}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Categorias
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-red-600 text-white shadow' : 'hover:text-white'}`}
          >
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('accompaniments')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${activeTab === 'accompaniments' ? 'bg-red-600 text-white shadow' : 'hover:text-white'}`}
          >
            <Utensils className="h-4 w-4 mr-2" />
            Acompanhamentos
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-red-600 text-white shadow' : 'hover:text-white'}`}
          >
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${activeTab === 'status' ? 'bg-red-600 text-white shadow' : 'hover:text-white'}`}
          >
            <StoreIcon className="h-4 w-4 mr-2" />
            Status da Loja
          </button>
        </div>

        {/* Tab Content: Status */}
        {activeTab === 'status' && (
          <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
            {/* Status Control Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow h-fit">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <StoreIcon className="w-5 h-5 text-amber-500" />
                Controle de Abertura
              </h2>

              <div className="flex flex-col items-center justify-center py-8 space-y-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <div className={`text-2xl font-black uppercase tracking-widest ${storeStatus.is_open ? 'text-green-500' : 'text-red-500'}`}>
                  {storeStatus.is_open ? 'Loja Aberta' : 'Loja Fechada'}
                </div>

                <button
                  onClick={() => handleToggleStoreOpen(!storeStatus.is_open)}
                  className={`relative inline-flex h-12 w-24 shrink-0 cursor-pointer items-center rounded-full border-4 border-transparent transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${storeStatus.is_open ? 'bg-green-600' : 'bg-red-600'}`}
                >
                  <span className={`pointer-events-none block h-10 w-10 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ${storeStatus.is_open ? 'translate-x-12' : 'translate-x-0'}`} />
                </button>

                <p className="text-zinc-500 text-sm text-center px-4">
                  {storeStatus.is_open
                    ? 'Os clientes podem acessar o cardápio e fazer pedidos normalmente.'
                    : 'O acesso está BLOQUEADO. Clientes verão a tela de "Loja Fechada".'
                  }
                </p>
              </div>
            </div>

            {/* Message Management Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow h-fit">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-zinc-400" />
                Mensagem de Bloqueio
              </h2>

              <div className="space-y-6">
                {/* New Message Form */}
                <form onSubmit={handleCreateMessage} className="bg-zinc-900/30 p-4 rounded-lg border border-zinc-800 space-y-3">
                  <input
                    placeholder="Título (ex: Voltamos às 18h)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-white text-sm focus:border-amber-500 outline-none"
                    value={newMessageTitle}
                    onChange={e => setNewMessageTitle(e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Mensagem detalhada..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-white text-sm focus:border-amber-500 outline-none resize-none h-20"
                    value={newMessageBody}
                    onChange={e => setNewMessageBody(e.target.value)}
                    required
                  />
                  <button type="submit" className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded transition-colors">
                    + Criar Nova Mensagem
                  </button>
                </form>

                {/* List of Messages */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {storeMessages.map(msg => (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${storeStatus.active_message_id === msg.id
                        ? 'bg-amber-900/20 border-amber-500/50'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${storeStatus.active_message_id === msg.id ? 'border-amber-500' : 'border-zinc-600'
                            }`}>
                            {storeStatus.active_message_id === msg.id && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                          </div>
                          <div>
                            <h4 className={`text-sm font-bold ${storeStatus.active_message_id === msg.id ? 'text-amber-500' : 'text-zinc-300'}`}>{msg.title}</h4>
                            <p className="text-xs text-zinc-500 line-clamp-1">{msg.message}</p>
                          </div>
                        </div>
                        {!msg.is_default && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
                            className="text-zinc-600 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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
        availableCategories={manageableCategories}
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
