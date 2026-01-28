import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in pb-24">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para o Cardápio
      </button>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-xl">
        <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-6">
          <Shield className="w-8 h-8 text-green-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-white">Política de Privacidade</h1>
        </div>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Espetinho do Nordeste</h2>
            <p>
              A presente Política de Privacidade descreve como o Espetinho do Nordeste, registrado sob o CNPJ 33.137.007/0001-09, coleta, usa e protege as informações dos usuários que utilizam nosso aplicativo e serviços de delivery.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">1. Coleta de Informações</h3>
            <p className="mb-2">Para realizar as entregas e garantir a melhor experiência, coletamos:</p>
            <ul className="list-disc pl-5 space-y-1 marker:text-amber-500">
              <li><strong>Dados de Identificação:</strong> Nome completo, CPF (para emissão de nota fiscal quando solicitado) e data de nascimento (para validação de idade).</li>
              <li><strong>Dados de Contato:</strong> Endereço de entrega, número de telefone/WhatsApp e e-mail.</li>
              <li><strong>Dados de Pagamento:</strong> Processados de forma criptografada por parceiros de pagamento (não armazenamos dados de cartão de crédito em nossos servidores).</li>
              <li><strong>Dados de Navegação:</strong> Endereço IP, cookies e interações com o aplicativo para fins de melhoria técnica e segurança.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">2. Finalidade do Tratamento de Dados</h3>
            <p className="mb-2">Os dados são utilizados exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-1 marker:text-amber-500">
              <li>Processar pedidos e realizar a logística de entrega.</li>
              <li>Enviar atualizações sobre o status do pedido via WhatsApp ou notificações push.</li>
              <li>Cumprir obrigações legais e fiscais.</li>
              <li>Personalizar ofertas e anúncios nas plataformas da Meta (Facebook e Instagram), desde que o usuário tenha dado consentimento.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">3. Compartilhamento de Dados</h3>
            <p className="mb-2">Não vendemos seus dados. Compartilhamos informações apenas com parceiros estritamente necessários para a operação:</p>
            <ul className="list-disc pl-5 space-y-1 marker:text-amber-500">
              <li>Serviços de Logística (Entregadores).</li>
              <li>Gateways de Pagamento (Segurança financeira).</li>
              <li>Plataformas de Marketing (Meta), de forma anonimizada ou conforme as configurações de privacidade do usuário.</li>
            </ul>
          </section>

          <section className="bg-zinc-950/50 p-4 rounded-xl border border-red-900/30">
            <h3 className="text-lg font-semibold text-red-400 mb-2">4. Cláusula de Restrição: Bebidas Alcoólicas</h3>
            <p className="mb-2">Em conformidade com o Estatuto da Criança e do Adolescente (ECA) e as diretrizes do CONAR e da Meta:</p>
            <ul className="list-disc pl-5 space-y-2 marker:text-red-500">
              <li><strong>Venda Proibida:</strong> É expressamente proibida a venda e entrega de bebidas alcoólicas a menores de 18 (dezoito) anos.</li>
              <li><strong>Verificação de Idade:</strong> O acesso à categoria de bebidas alcoólicas em nosso aplicativo é restrito a usuários que confirmarem sua maioridade através de mecanismo de age-gating.</li>
              <li><strong>Ato da Entrega:</strong> Nossos entregadores estão instruídos a solicitar um documento de identificação oficial com foto no ato da entrega de pedidos que contenham álcool. Caso a maioridade não seja comprovada ou o cliente se recuse a apresentar o documento, os itens alcoólicos não serão entregues e o valor correspondente será estornado, conforme nossa política de cancelamento.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">5. Direitos do Usuário (LGPD)</h3>
            <p className="mb-2">Você possui o direito de:</p>
            <ul className="list-disc pl-5 space-y-1 marker:text-amber-500">
              <li>Confirmar a existência do tratamento de seus dados.</li>
              <li>Acessar, corrigir ou excluir seus dados pessoais de nossa base.</li>
              <li>Revogar o consentimento para comunicações de marketing a qualquer momento.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">6. Segurança</h3>
            <p>
              Empregamos medidas técnicas e administrativas para proteger seus dados contra acessos não autorizados e situações acidentais de destruição, perda ou alteração.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">7. Contato</h3>
            <p>
              Para dúvidas sobre esta política ou para exercer seus direitos, entre em contato através do e-mail ou telefone de suporte disponível em nosso aplicativo.
            </p>
          </section>

          <div className="pt-6 mt-8 border-t border-zinc-800 text-sm text-zinc-500">
            Última atualização: 28 de janeiro de 2026.
          </div>
        </div>
      </div>
    </div>
  );
};