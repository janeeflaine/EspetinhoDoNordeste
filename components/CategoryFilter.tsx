
import React from 'react';
import { Category, CategoryItem } from '../types';

interface CategoryFilterProps {
  categories: CategoryItem[];
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  // Ensure "Todos" is always first if it exists, and only show active categories
  const displayCategories = categories.filter(c => c.active || c.id === 'Todos');

  return (
    <div className="mb-6">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
        {displayCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex flex-col items-center gap-2 flex-shrink-0 transition-all duration-300 outline-none ${
                isActive ? 'opacity-100 scale-105' : 'opacity-50 hover:opacity-80'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg ${
                  isActive
                    ? 'bg-gradient-to-br from-red-600 to-amber-500 shadow-red-600/30'
                    : 'bg-zinc-800 border-2 border-zinc-700'
                }`}
              >
                {cat.icon}
              </div>
              <span
                className={`text-xs font-medium transition-colors max-w-[80px] text-center ${
                  isActive ? 'text-amber-400' : 'text-zinc-400'
                }`}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
