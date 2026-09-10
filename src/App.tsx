import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { DatabaseLoader } from './components/DatabaseLoader';
import { SakuraPetals } from './components/SakuraPetals';
import { ArcticFoxEmblem } from './components/ArcticFoxEmblem';
import { NumberGrid } from './components/NumberGrid';
import { SizeSelector } from './components/SizeSelector';
import { AdminModal } from './components/AdminModal';
import { Order, ShirtSize } from './types';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Lock,
  RefreshCw,
  Ban,
  User,
  Tag,
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'interclasse_2026_orders';

export default function App() {
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Form State
  const [studentName, setStudentName] = useState('');
  const [shirtName, setShirtName] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<ShirtSize | null>(null);

  // Submissions list
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // Load orders from server or fallback to localStorage
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data: Order[] = await res.json();
        // Ensure no legacy demo items are retained
        const cleaned = data.filter((o) => !o.id?.startsWith('demo-'));
        setOrders(cleaned);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
        return;
      }
    } catch (err) {
      console.warn('Backend fetch failed, reading localStorage', err);
    }

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((o: Order) => !o.id?.startsWith('demo-'));
          setOrders(cleaned);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
        }
      } catch {
        // ignore parse error
      }
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form Validations
    if (!studentName.trim()) {
      setFormError('Por favor, digite o seu nome completo.');
      return;
    }

    if (!shirtName.trim()) {
      setFormError('Por favor, digite o nome que deseja estampado na camisa.');
      return;
    }

    if (selectedNumber === null || selectedNumber < 1 || selectedNumber > 100) {
      setFormError('Por favor, selecione um número de 1 a 100 clicando em um dos botões disponíveis.');
      return;
    }

    // Verify if number is already taken
    const alreadyTaken = orders.find((o) => o.number === selectedNumber);
    if (alreadyTaken) {
      setFormError(
        `O número ${selectedNumber} já foi escolhido anteriormente e agora está bloqueado com a placa de PROIBIDO 🚫. Escolha outro número disponível.`
      );
      return;
    }

    if (!selectedSize) {
      setFormError('Por favor, selecione o tamanho da camisa (RN, PP, P, M, G, GG, XG).');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      studentName: studentName.trim(),
      shirtName: shirtName.trim().toUpperCase(),
      number: selectedNumber,
      size: selectedSize,
    };

    let confirmedOrder: Order | null = null;

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        confirmedOrder = result.order;
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || 'Erro ao registrar pedido.');
        setIsSubmitting(false);
        fetchOrders();
        return;
      }
    } catch {
      // Local fallback in case backend is unavailable
      confirmedOrder = {
        id: 'local-' + Date.now(),
        ...payload,
        createdAt: new Date().toISOString(),
      };
    }

    if (confirmedOrder) {
      const updatedOrders = [...orders, confirmedOrder];
      setOrders(updatedOrders);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedOrders));

      // Launch Sakura & Gold celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#ffffff', '#f472b6', '#ffd700', '#fb7185'],
      });

      setSuccessOrder(confirmedOrder);
      // Reset input fields
      setStudentName('');
      setShirtName('');
      setSelectedNumber(null);
      setSelectedSize(null);
    }

    setIsSubmitting(false);
  };

  const handleDeleteOrder = async (orderId: string, adminToken?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminToken || '' },
      });
      if (res.ok) {
        const updated = orders.filter((o) => o.id !== orderId);
        setOrders(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return true;
      }
    } catch {
      // fallback delete
      const updated = orders.filter((o) => o.id !== orderId);
      setOrders(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return true;
    }
    return false;
  };

  const handleResetAllOrders = async (adminToken?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'x-admin-key': adminToken || '' },
      });
      if (res.ok) {
        setOrders([]);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
        return true;
      }
    } catch {
      // fallback
      setOrders([]);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-[#08080c] text-neutral-100 flex flex-col relative overflow-x-hidden">
      {/* Floating Sakura Petals Layer */}
      <SakuraPetals />

      {/* Atmospheric Database Connection Screen */}
      {isLoadingDb && (
        <DatabaseLoader onComplete={() => setIsLoadingDb(false)} />
      )}

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full bg-[#0d0d14]/90 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Left Brand Badge */}
        <div className="flex items-center gap-3">
          <ArcticFoxEmblem size="sm" />
          <div>
            <div className="text-xs tracking-widest text-pink-400 font-bold uppercase flex items-center gap-1.5">
              <span>INTERCLASSE 2026</span>
              <span className="text-neutral-500">•</span>
              <span className="text-white">7° ANO</span>
            </div>
            <div className="text-[11px] text-neutral-400 hidden sm:block">
              Japão (Coreia do Sul) • Raposa do Ártico
            </div>
          </div>
        </div>

        {/* Top Right Action: ÁREA ADM */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-top-area-adm"
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-pink-950 hover:to-neutral-900 border border-neutral-700 hover:border-pink-500 text-neutral-200 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer group"
          >
            <Lock className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
            <span className="tracking-wider uppercase">ÁREA ADM</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 z-10">
        {/* HERO TITLE SECTION - As specifically requested: "Interclasse 2026 e um mini texto abaixo: 7° ano Japão (Coreia do Sul)" */}
        <section className="text-center mb-8 sm:mb-10 relative">
          {/* Subtle oriental decorative flags */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-950/40 border border-pink-500/30 text-xs font-semibold text-pink-300 mb-3 backdrop-blur-xs">
            <span>🇯🇵 日本</span>
            <span className="text-neutral-500">•</span>
            <span>🦊 Raposa do Ártico</span>
            <span className="text-neutral-500">•</span>
            <span>🇰🇷 대한민국</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-cinzel glow-pink">
            Interclasse <span className="text-pink-500">2026</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 font-medium mt-2 tracking-wide">
            7° ano Japão <span className="text-pink-400 font-semibold">(Coreia do Sul)</span>
          </p>

          <p className="max-w-xl mx-auto text-xs sm:text-sm text-neutral-400 mt-2">
            Personalize o seu manto oficial. Escolha o seu nome, o número exclusivo (1 a 100) e o tamanho da sua camisa.
          </p>
        </section>

        {/* WORKSPACE: REGISTRATION FORM & DELEGATION INFO */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* REGISTRATION FORM */}
          <form onSubmit={handleSubmit} className="bg-[#0f0f16] border border-neutral-800/90 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6">
            <div className="border-b border-neutral-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-400" />
                  Ficha de Inscrição da Camisa
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Preencha todos os campos abaixo para reservar seu número e tamanho.
                </p>
              </div>

              <div className="text-[11px] text-pink-400/90 font-mono hidden sm:block">
                #7ANO-2026
              </div>
            </div>

            {/* Error Banner if any */}
            {formError && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">{formError}</div>
              </div>
            )}

            {/* 1. Nome da Pessoa */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-student-name"
                className="block text-sm font-semibold text-neutral-200 flex items-center gap-2"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-pink-500 text-white text-xs font-bold">
                  1
                </span>
                Nome da pessoa:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-student-name"
                  type="text"
                  required
                  placeholder="Digite seu nome completo (Ex: JungKook)..."
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-[#151520] border border-neutral-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors shadow-inner"
                />
              </div>
            </div>

            {/* 2. Nome que deseja na camisa */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-shirt-name"
                className="block text-sm font-semibold text-neutral-200 flex items-center gap-2"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-pink-500 text-white text-xs font-bold">
                  *
                </span>
                Nome que deseja na camisa:
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-shirt-name"
                  type="text"
                  required
                  maxLength={16}
                  placeholder="Ex: JUNGKOOK, JK, KOREA FOX..."
                  value={shirtName}
                  onChange={(e) => setShirtName(e.target.value.toUpperCase())}
                  className="w-full bg-[#151520] border border-neutral-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white uppercase tracking-wider font-mono placeholder-neutral-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors shadow-inner"
                />
              </div>
              <span className="text-[11px] text-neutral-400 block pl-1">
                Este é o nome que será estampado nas costas da sua camisa (máx. 16 letras).
              </span>
            </div>

            {/* 3. Número de 1 a 100 */}
            <div className="pt-2">
              <NumberGrid
                selectedNumber={selectedNumber}
                onSelectNumber={(num) => setSelectedNumber(num)}
                orders={orders}
              />
            </div>

            {/* 4. Escolha do Tamanho da Camisa */}
            <div className="pt-2">
              <SizeSelector
                selectedSize={selectedSize}
                onSelectSize={(size) => setSelectedSize(size)}
              />
            </div>

            {/* Botão CONFIRMAR */}
            <div className="pt-4 border-t border-neutral-800">
              <button
                type="submit"
                id="btn-submit-order"
                disabled={isSubmitting}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-500 hover:to-pink-600 text-white font-extrabold py-4 px-6 rounded-xl shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 text-base tracking-wider uppercase disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processando e Reservando Número...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>CONFIRMAR INSCRIÇÃO DA CAMISA</span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-neutral-500 mt-2">
                Ao confirmar, seus dados serão registrados e o número escolhido ficará indisponível com a placa de proibido 🚫 para os outros alunos.
              </p>
            </div>
          </form>

          {/* Team Identity Card */}
          <div className="bg-[#0f0f16] border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <ArcticFoxEmblem size="sm" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Delegação 7° Ano • Interclasse 2026
                </h3>
                <p className="text-xs text-pink-400 font-medium">
                  Japão (Coreia do Sul) • Raposa do Ártico
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              A temática oficial une a disciplina e as flores de cerejeira (Sakura) do Japão e da Coreia do Sul
              com a velocidade e a agilidade da Raposa do Ártico.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-[#14141d] border border-neutral-800 p-2.5 rounded-xl">
                <span className="text-neutral-400 block text-[10px]">CORES OFICIAIS</span>
                <div className="flex items-center gap-1.5 mt-1 font-semibold text-white">
                  <span className="w-3 h-3 rounded-full bg-pink-500 border border-white/20" />
                  <span className="w-3 h-3 rounded-full bg-white border border-neutral-400" />
                  <span className="w-3 h-3 rounded-full bg-black border border-neutral-600" />
                  <span className="text-[11px] ml-1">Rosa, Branco, Preto</span>
                </div>
              </div>

              <div className="bg-[#14141d] border border-neutral-800 p-2.5 rounded-xl">
                <span className="text-neutral-400 block text-[10px]">MASCOTE OFICIAL</span>
                <div className="font-bold text-pink-300 mt-1 flex items-center gap-1">
                  <span>Raposa do Ártico</span>
                </div>
              </div>
            </div>

            {/* Status Note about rules */}
            <div className="mt-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 flex items-start gap-2.5 text-xs text-neutral-400">
              <Ban className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-200">Regra de Exclusividade:</strong> Cada número de 1 a 100 só pode ser escolhido uma única vez. Uma vez confirmado, o sistema bloqueia automaticamente para todos os demais alunos com a placa de PROIBIDO.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-neutral-800/80 bg-[#09090e] py-6 px-4 text-center text-xs text-neutral-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            <span className="font-semibold text-neutral-300">Interclasse 2026</span>
            <span>— 7° ano Japão (Coreia do Sul)</span>
          </div>

          <div className="text-[11px] text-neutral-400">
            Cerejeira • Raposa do Ártico • Rosa, Branco e Preto
          </div>

          <button
            type="button"
            id="btn-open-admin-modal"
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-pink-300 transition-colors cursor-pointer text-xs py-1.5 px-3 rounded-xl hover:bg-neutral-800/80 border border-neutral-800/80"
          >
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Acesso Restrito da Coordenação</span>
          </button>
        </div>
      </footer>

      {/* SUCCESS CONFIRMATION MODAL */}
      {successOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#101017] border border-pink-500/50 rounded-2xl p-6 shadow-2xl text-center">
            {/* Success icon */}
            <div className="w-16 h-16 rounded-2xl bg-pink-950/80 border border-pink-500 flex items-center justify-center text-pink-400 mx-auto mb-4 shadow-[0_0_25px_rgba(244,114,182,0.4)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-black text-white font-cinzel">
              Camisa Confirmada!
            </h3>
            <p className="text-xs text-pink-300 font-medium mt-1">
              Seus dados foram enviados para o administrador do site.
            </p>

            {/* Receipt Summary Card */}
            <div className="bg-[#161622] border border-neutral-800 rounded-xl p-4 my-5 text-left space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Aluno:</span>
                <span className="font-bold text-white">{successOrder.studentName}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Nome na Camisa:</span>
                <span className="font-mono font-bold text-pink-400">{successOrder.shirtName}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Número da Camisa:</span>
                <span className="font-black text-base text-white bg-pink-600 px-2 py-0.5 rounded-md">
                  Nº {successOrder.number}
                </span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Tamanho Escolhido:</span>
                <span className="font-bold text-neutral-200">{successOrder.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Turma:</span>
                <span className="text-pink-300 font-semibold">7° Ano Japão (Coreia do Sul)</span>
              </div>
            </div>

            <div className="bg-red-950/30 border border-red-900/60 rounded-lg p-2.5 mb-5 text-[11px] text-red-300 flex items-center justify-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>O número {successOrder.number} agora tem a placa de proibido para outros alunos.</span>
            </div>

            <button
              type="button"
              onClick={() => setSuccessOrder(null)}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all cursor-pointer text-sm"
            >
              Concluir e Voltar
            </button>
          </div>
        </div>
      )}

      {/* SECURE ADMIN MODAL (PDF DOWNLOAD & NUMBER MANAGEMENT) */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        onDeleteOrder={handleDeleteOrder}
        onResetAllOrders={handleResetAllOrders}
      />
    </div>
  );
}
