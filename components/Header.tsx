import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="relative overflow-hidden mb-6 border-b border-red-900/50">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950 via-red-900 to-zinc-950"></div>

      {/* Radial Glow for depth */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-black/40"></div>

      <div className="relative px-4 pt-8 pb-6 text-center flex flex-col items-center justify-center z-10">
        {/* Logo Image */}
        {/* Certifique-se de salvar o arquivo da logo como 'logo.png' na pasta public */}
        <div className="relative mb-2 group">
          {/* Glow effect behind logo */}
          <div className="absolute inset-0 bg-red-600/10 blur-3xl rounded-full scale-125 group-hover:bg-red-600/20 transition-all duration-500"></div>

          <img
            src="/logo.png"
            alt="Espetinho do Nordeste"
            className="relative w-auto h-48 md:h-64 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] animate-scale-in transform transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>

        <p className="text-red-50/90 font-medium text-lg tracking-wide drop-shadow-md">
          O sabor autêntico na sua casa 🌶️
        </p>
      </div>
    </header>
  );
};