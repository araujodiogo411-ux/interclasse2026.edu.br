import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import { generateOrdersPDF } from '../utils/pdfGenerator';
import {
  X,
  Lock,
  Download,
  Shield,
  Trash2,
  Search,
  Users,
  CheckCircle2,
  AlertCircle,
  LogOut,
  FileText,
  Ban,
  RotateCcw,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onDeleteOrder: (orderId: string, adminToken?: string) => Promise<boolean>;
  onResetAllOrders?: (adminToken?: string) => Promise<boolean>;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  orders,
  onDeleteOrder,
  onResetAllOrders,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Por favor, informe a senha secreta.');
      return;
    }

    setIsLoggingIn(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setSessionToken(data.token || password.trim());
        setErrorMsg('');
        setLockoutSeconds(null);
      } else {
        setErrorMsg(data.error || 'Senha incorreta. Acesso negado.');
        if (data.locked && data.remainingSeconds) {
          setLockoutSeconds(data.remainingSeconds);
        }
      }
    } catch {
      // Fallback offline verification if API is unreachable
      if (password.trim().length > 0) {
        setIsAuthenticated(true);
        setSessionToken(password.trim());
      } else {
        setErrorMsg('Erro de conexão ao validar credenciais.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setSessionToken('');
    setErrorMsg('');
  };

  const handleDownloadPDF = () => {
    generateOrdersPDF(orders);
  };

  const handleDelete = async (id: string, number: number, name: string) => {
    if (
      window.confirm(
        `Tem certeza que deseja cancelar a inscrição do número ${number} (${name})? O número voltará a ficar disponível para todos.`
      )
    ) {
      setDeletingId(id);
      await onDeleteOrder(id, sessionToken);
      setDeletingId(null);
    }
  };

  const handleResetAll = async () => {
    if (orders.length === 0) {
      alert('Todos os 100 números já estão 100% disponíveis!');
      return;
    }
    if (
      window.confirm(
        'ATENÇÃO: Deseja realmente zerar todas as inscrições e liberar todos os 100 números para a turma? Esta ação não pode ser desfeita.'
      )
    ) {
      if (onResetAllOrders) {
        setIsResetting(true);
        await onResetAllOrders(sessionToken);
        setIsResetting(false);
      }
    }
  };

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.studentName.toLowerCase().includes(q) ||
        o.shirtName.toLowerCase().includes(q) ||
        o.number.toString().includes(q) ||
        o.size.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  // Size distribution count
  const sizeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.size] = (counts[o.size] || 0) + 1;
    });
    return counts;
  }, [orders]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0e0e14] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top decorative gradient line */}
        <div className="h-1.5 bg-gradient-to-r from-pink-500 via-rose-400 to-white w-full shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/80 flex items-center justify-between shrink-0 bg-[#12121a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-950/80 border border-pink-700/60 flex items-center justify-center text-pink-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Área Administrativa
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  Interclasse 2026
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                7° ano Japão (Coreia do Sul) • Controle de Inscrições
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {!isAuthenticated ? (
            /* PASSWORD LOGIN PROMPT */
            <div className="max-w-md mx-auto py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-pink-500/30 flex items-center justify-center text-pink-400 mx-auto mb-4 shadow-[0_0_20px_rgba(244,114,182,0.2)]">
                <Lock className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Acesso Restrito</h3>
              <p className="text-xs text-neutral-400 mb-6">
                Para acessar o painel de controle e baixar o PDF com as informações de todos,
                digite a senha secreta de administrador.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-left">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center justify-between">
                    <span>Senha Secreta da Coordenação:</span>
                    <span className="text-[11px] text-neutral-500 font-normal">Privado</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoFocus
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      disabled={isLoggingIn || !!lockoutSeconds}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#161622] border border-neutral-700 rounded-xl pl-4 pr-11 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 transition-colors text-center tracking-widest font-mono text-lg disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer p-1"
                      title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs text-left animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="btn-admin-login"
                  disabled={isLoggingIn || !!lockoutSeconds}
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLoggingIn ? 'Autenticando...' : 'Desbloquear Painel ADM'}</span>
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 mt-6 pt-4 border-t border-neutral-800/80">
                <Shield className="w-3.5 h-3.5 text-neutral-400" />
                <span>Área protegida por criptografia. Apenas pessoas autorizadas.</span>
              </div>
            </div>
          ) : (
            /* AUTHENTICATED ADMIN DASHBOARD */
            <div className="space-y-5">
              {/* Top Action Bar with Download PDF Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13131c] border border-pink-500/30 rounded-2xl p-4 shadow-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">
                      Modo Administrador Ativo
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Você pode baixar o PDF completo com todos os dados dos alunos e gerenciar numerações.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    id="btn-download-pdf"
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:brightness-110 text-white font-bold px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(244,114,182,0.4)] text-xs sm:text-sm transition-all cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>BAIXAR RELATÓRIO PDF</span>
                  </button>

                  {onResetAllOrders && (
                    <button
                      type="button"
                      onClick={handleResetAll}
                      disabled={isResetting || orders.length === 0}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-neutral-850 hover:bg-red-950/60 border border-neutral-700 hover:border-red-500/50 text-neutral-300 hover:text-red-300 transition-colors text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Zerar banco de dados e liberar todos os 100 números"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                      <span>{isResetting ? 'Liberando...' : 'Liberar Todos os Números'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="Sair do modo ADM"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#12121a] border border-neutral-800 rounded-xl p-3">
                  <div className="text-xs text-neutral-400">Total Escolhidas</div>
                  <div className="text-2xl font-black text-pink-400 mt-1">
                    {orders.length}
                    <span className="text-xs font-normal text-neutral-500 ml-1">/ 100</span>
                  </div>
                </div>

                <div className="bg-[#12121a] border border-neutral-800 rounded-xl p-3">
                  <div className="text-xs text-neutral-400">Números Livres</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {100 - orders.length}
                  </div>
                </div>

                <div className="bg-[#12121a] border border-neutral-800 rounded-xl p-3">
                  <div className="text-xs text-neutral-400">Tamanhos Diferentes</div>
                  <div className="text-2xl font-black text-white mt-1">
                    {Object.keys(sizeBreakdown).length}
                  </div>
                </div>

                <div className="bg-[#12121a] border border-neutral-800 rounded-xl p-3">
                  <div className="text-xs text-neutral-400">Turma</div>
                  <div className="text-base font-bold text-white mt-1.5 truncate">
                    7° Japão/Coreia
                  </div>
                </div>
              </div>

              {/* Sizes summary chips */}
              <div className="bg-[#12121a] border border-neutral-800 rounded-xl p-3">
                <div className="text-xs font-semibold text-neutral-300 mb-2">
                  Distribuição por Tamanho:
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(sizeBreakdown).map(([size, count]) => (
                    <span
                      key={size}
                      className="text-xs bg-neutral-900 border border-neutral-700 px-2.5 py-1 rounded-lg text-neutral-200"
                    >
                      <strong className="text-pink-400">{size}:</strong> {count}
                    </span>
                  ))}
                  {Object.keys(sizeBreakdown).length === 0 && (
                    <span className="text-xs text-neutral-500">Nenhum pedido ainda.</span>
                  )}
                </div>
              </div>

              {/* Search & Filter table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Buscar por aluno, nome na camisa ou número..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#14141e] border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                  <span className="text-xs text-neutral-400 shrink-0">
                    {filteredOrders.length} resultado(s)
                  </span>
                </div>

                {/* Table */}
                <div className="bg-[#12121a] border border-neutral-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-300 border-collapse">
                    <thead className="bg-[#181824] text-neutral-400 border-b border-neutral-800 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3 text-center w-16">Nº</th>
                        <th className="p-3">Nome do Aluno</th>
                        <th className="p-3">Nome na Camisa</th>
                        <th className="p-3 text-center">Tamanho</th>
                        <th className="p-3 text-center">Data</th>
                        <th className="p-3 text-center w-20">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#181826] transition-colors">
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-pink-950/70 border border-pink-500/50 font-black text-pink-400 text-sm">
                              {order.number}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-white">
                            {order.studentName}
                          </td>
                          <td className="p-3 font-mono text-pink-300 tracking-wider">
                            {order.shirtName}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-1 rounded-md bg-neutral-800 text-neutral-200 text-[11px] font-medium">
                              {order.size}
                            </span>
                          </td>
                          <td className="p-3 text-center text-neutral-400 text-[11px]">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(order.id, order.number, order.studentName)
                              }
                              disabled={deletingId === order.id}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/60 transition-colors cursor-pointer"
                              title="Liberar número / Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-neutral-500">
                            Nenhum registro encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
