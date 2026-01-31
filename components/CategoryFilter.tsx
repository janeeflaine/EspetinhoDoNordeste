
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
  const displayCategories = categories.filter(c => c.active || c.id === 'Todos');

  return (
    <div className="mb-8">
      <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide px-2 pt-2">
        {displayCategories.map((cat) => {
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group flex flex-col items-center gap-3 flex-shrink-0 outline-none transition-all duration-300 ${isActive ? 'scale-105' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
            >
              <div
                className={`
                  relative w-[4.5rem] h-[4.5rem] rounded-2xl flex items-center justify-center text-3xl
                  transition-all duration-500 ease-out
                  ${isActive
                    ? 'bg-red-600 translate-y-[-2px] text-white'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-500 shadow-lg shadow-black/40 group-hover:border-zinc-700 group-hover:bg-zinc-800 group-hover:text-white'
                  }
                `}
              >
                <span className="relative z-10 filter drop-shadow-sm">{cat.icon}</span>
              </div>

              <span
                className={`
                  text-xs font-bold tracking-wide transition-colors duration-300 max-w-[80px] text-center
                  ${isActive ? 'text-red-500' : 'text-zinc-500 group-hover:text-zinc-300'}
                `}
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
