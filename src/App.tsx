import { useEffect, useRef, useState } from "react";

// ─── ICONS ────────────────────────────────────────────────────────────────────

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

type IconProps = { className?: string };

const UserAvatarIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="8.2" r="3.2" />
    <path d="M5.8 19.2c.8-3.1 3.1-5 6.2-5s5.4 1.9 6.2 5" />
  </svg>
);

const DashboardIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="5" y="5" width="5" height="5" rx="1.2" />
    <rect x="14" y="5" width="5" height="5" rx="1.2" />
    <rect x="5" y="14" width="5" height="5" rx="1.2" />
    <rect x="14" y="14" width="5" height="5" rx="1.2" />
  </svg>
);

const BillingIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="4" y="6.5" width="16" height="11" rx="2.2" />
    <path d="M4 10h16" />
    <path d="M8 14.5h3" />
    <path d="M15.5 14.5h1.8" />
  </svg>
);

const SettingsIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 7h12" />
    <path d="M6 17h12" />
    <circle cx="10" cy="7" r="2" />
    <circle cx="15" cy="17" r="2" />
  </svg>
);

const SignOutIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H9" />
    <path d="M14 8l4 4-4 4" />
    <path d="M18 12H9" />
  </svg>
);

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Page = "login" | "register" | "forgot";
type LoginError = "invalid-email" | "invalid-credentials" | null;
type CreateVmStatus = "idle" | "creating" | "created" | "error";
type CreatedVm = {
  instanceId: string;
  imageId: string;
  imageName?: string | null;
  instanceType: string;
  region: string;
  state: string;
  consoleUrl?: string;
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const BG_URL = "/site-background.png?v=4";
const LOGO_URL = "/versex-icon-transparent.png?v=3";
const pageIndex: Record<Page, number> = {
  forgot: 0,
  login: 1,
  register: 2,
};

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder-transparent focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-colors duration-200";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const headlineTerms = [
  "lugar",
  "tela",
  "navegador",
  "monitor",
  "notebook",
  "computador",
  "setup",
  "TV",
  "sala",
  "cidade",
  "rede",
  "momento",
];
const MOONLIGHT_ICON_URL =
  "https://play-lh.googleusercontent.com/QGBq_X2ewz_3HUR9AUI3NXcOjfVJd-Mf1l66-3D6zMzF-HN81f_KeZ-shqxRE633I3M";

// ─── SHARED SHELL ─────────────────────────────────────────────────────────────
function PageShell({
  children,
  active,
  className = "",
}: {
  children: React.ReactNode;
  active: boolean;
  className?: string;
}) {
  return (
    <section
      aria-hidden={!active}
      className={`flex min-h-screen w-full min-w-full shrink-0 flex-col px-8 py-8 ${active ? "pointer-events-auto" : "pointer-events-none"} ${className}`}
    >
      {children}
    </section>
  );
}

// ─── LOGO BUTTON ─────────────────────────────────────────────────────────────
function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 flex items-center justify-center hover:opacity-60 transition-opacity duration-200 cursor-pointer bg-transparent border-none p-0"
      aria-label="Voltar ao início"
    >
      <img
        src={LOGO_URL}
        alt="Versex"
        width="40"
        height="40"
        decoding="async"
        draggable={false}
        className="h-10 w-10 object-contain"
      />
    </button>
  );
}

function LoginErrorAlert({ error }: { error: LoginError }) {
  if (!error) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-[#ffb8b8] bg-[#fff6f6] px-3 py-3 text-sm text-[#9f1d1d]"
    >
      {error === "invalid-email" ? "E-mail inválido." : "E-mail ou senha incorretos."}
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({
  active,
  onGoRegister,
  onGoForgot,
  onLoginSuccess,
  onReset,
}: {
  active: boolean;
  onGoRegister: () => void;
  onGoForgot: () => void;
  onLoginSuccess: () => void;
  onReset: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<LoginError>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailPattern.test(email.trim())) {
      setLoginError("invalid-email");
      return;
    }

    if (email.trim().toLowerCase() === "tester@gmail.com") {
      onLoginSuccess();
      return;
    }

    setLoginError("invalid-credentials");
  };

  return (
    <PageShell active={active}>
      <Logo onClick={onReset} />

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-[420px]">
          <h1 className="text-[2.5rem] font-light text-white tracking-normal mb-2 leading-tight">
            Entrar na conta
          </h1>
          <p className="text-white/40 text-sm mb-8">
            Entre na sua conta para acessar seus workspaces.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <LoginErrorAlert error={loginError} />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLoginError(null);
                }}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/70">Senha</label>
                <button
                  type="button"
                  onClick={onGoForgot}
                  className="text-sm text-white/30 hover:text-white/60 transition duration-200 cursor-pointer bg-transparent border-none p-0"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError(null);
                  }}
                  className={inputClass + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition duration-200"
                >
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black rounded-full py-3 text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all duration-200 mt-1"
            >
              Entrar
            </button>
          </form>

          <p className="text-sm text-white/30 mt-6">
            Ainda não tem conta?{" "}
            <button
              onClick={onGoRegister}
              className="font-semibold text-white hover:text-white/60 transition duration-200 cursor-pointer bg-transparent border-none p-0"
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>

      <p className="text-xs text-white/20 pt-8">
        © 2026 Versex. Todos os direitos reservados.
      </p>
    </PageShell>
  );
}

// ─── REGISTER PAGE ────────────────────────────────────────────────────────────
function RegisterPage({
  active,
  onGoLogin,
  onReset,
}: {
  active: boolean;
  onGoLogin: () => void;
  onReset: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => e.preventDefault();

  return (
    <PageShell active={active}>
      <Logo onClick={onReset} />

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-[420px]">
          <h1 className="text-[2.5rem] font-light text-white tracking-normal mb-2 leading-tight">
            Criar conta
          </h1>
          <p className="text-white/40 text-sm mb-8">
            Crie sua conta para começar a usar a Versex.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition duration-200"
                >
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
              <p className="text-xs text-white/25 mt-0.5">
                Mínimo 8 caracteres, com maiúscula, minúscula e número.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 shrink-0 cursor-pointer accent-white"
              />
              <label htmlFor="terms" className="text-sm text-white/40 leading-snug cursor-pointer">
                Concordo com os{" "}
                <a href="#" className="underline text-white/70 hover:text-white transition duration-200">
                  Termos de Serviço
                </a>{" "}
                e reconheço a{" "}
                <a href="#" className="underline text-white/70 hover:text-white transition duration-200">
                  Política de Privacidade
                </a>{" "}
                da Versex.
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black rounded-full py-3 text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all duration-200 mt-1"
            >
              Criar conta
            </button>
          </form>

          <p className="text-sm text-white/30 mt-6">
            Já tem uma conta?{" "}
            <button
              onClick={onGoLogin}
              className="font-semibold text-white hover:text-white/60 transition duration-200 cursor-pointer bg-transparent border-none p-0"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>

      <p className="text-xs text-white/20 pt-8">
        © 2026 Versex. Todos os direitos reservados.
      </p>
    </PageShell>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
function ForgotPasswordPage({
  active,
  onGoLogin,
}: {
  active: boolean;
  onGoLogin: () => void;
}) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailPattern.test(email.trim())) {
      setEmailError(true);
      setSent(false);
      return;
    }

    setEmailError(false);
    setSent(true);
  };

  return (
    <PageShell active={active}>
      <Logo onClick={onGoLogin} />

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-[440px] -mt-12">
          <h1 className="mb-3 text-[2.875rem] font-light leading-[1.12] tracking-normal text-white">
            Esqueceu a<br />
            senha?
          </h1>
          <p className="mb-10 text-[15px] leading-snug text-white/40">
            Digite o e-mail da sua conta e enviaremos um link para
            você redefinir a senha.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {emailError && (
              <div
                role="alert"
                className="rounded-xl border border-[#ffb8b8] bg-[#fff6f6] px-3 py-3 text-sm text-[#9f1d1d]"
              >
                E-mail inválido.
              </div>
            )}

            {sent && (
              <div
                role="status"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/60"
              >
                Link de redefinição enviado.
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/70">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(false);
                  setSent(false);
                }}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-white/90 active:scale-[0.98]"
            >
              Continuar
            </button>
          </form>

          <button
            type="button"
            onClick={onGoLogin}
            className="mx-auto mt-6 block bg-transparent p-0 text-sm text-white/30 transition-colors duration-200 hover:text-white/60"
          >
            Voltar para o login
          </button>
        </div>
      </div>

      <p className="text-xs text-white/20 pt-8">
        © 2026 Versex. Todos os direitos reservados.
      </p>
    </PageShell>
  );
}

function PostLoginHome({ onSignOut }: { onSignOut: () => void }) {
  const headlineSuffix = ".";
  const headlinePrefix = "Rode aplicativos em qualquer dispositivo, em qualquer ";
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [termIndex, setTermIndex] = useState(0);
  const [animatedTerm, setAnimatedTerm] = useState(headlineTerms[0]);
  const [isDeletingTerm, setIsDeletingTerm] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [desktopClosed, setDesktopClosed] = useState(false);
  const [desktopMinimized, setDesktopMinimized] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const [createVmStatus, setCreateVmStatus] = useState<CreateVmStatus>("idle");
  const [createdVm, setCreatedVm] = useState<CreatedVm | null>(null);
  const [createVmMessage, setCreateVmMessage] = useState("");

  const vmStatusLabel =
    createVmStatus === "creating"
      ? "Criando"
      : createVmStatus === "created"
        ? "Criada"
        : createVmStatus === "error"
          ? "Falhou"
          : "Desligada";

  const vmActionLabel =
    createVmStatus === "creating"
      ? "Criando..."
      : createVmStatus === "created"
        ? "Criada"
        : "Criar VM";

  const handleCreateVm = async () => {
    if (createVmStatus === "creating") return;

    setCreateVmStatus("creating");
    setCreateVmMessage("Preparando ambiente de demonstracao...");
    setCreatedVm(null);

    await new Promise((resolve) => window.setTimeout(resolve, 850));

    const demoVm: CreatedVm = {
      instanceId: "demo-vercel",
      imageId: "static-preview",
      imageName: "Versex Preview",
      instanceType: "g4dn.xlarge",
      region: "sa-east-1",
      state: "ready",
    };

    setCreatedVm(demoVm);
    setCreateVmStatus("created");
    setCreateVmMessage("Ambiente demonstrativo pronto para hospedagem estatica.");
  };

  useEffect(() => {
    const currentTerm = headlineTerms[termIndex];
    const termIsComplete = animatedTerm === currentTerm;
    const delay = termIsComplete && !isDeletingTerm ? 6000 : isDeletingTerm ? 34 : 58;

    const timeoutId = window.setTimeout(() => {
      if (isDeletingTerm) {
        if (animatedTerm.length > 0) {
          setAnimatedTerm(currentTerm.slice(0, animatedTerm.length - 1));
          return;
        }

        setTermIndex((currentIndex) => (currentIndex + 1) % headlineTerms.length);
        setIsDeletingTerm(false);
        return;
      }

      if (animatedTerm.length < currentTerm.length) {
        setAnimatedTerm(currentTerm.slice(0, animatedTerm.length + 1));
        return;
      }

      setIsDeletingTerm(true);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [animatedTerm, isDeletingTerm, termIndex]);

  useEffect(() => {
    if (!profileOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <header className="border-b border-white/10 bg-[#08080a]">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <img
              src={LOGO_URL}
              alt="Versex"
              width="34"
              height="34"
              className="h-[34px] w-[34px] object-contain"
            />
            <nav className="post-login-nav hidden items-center gap-6 text-sm sm:flex">
              <a href="#">Início</a>
              <a href="#">Preços</a>
              <a href="#">Empresa</a>
              <a href="#">Suporte</a>
            </nav>
          </div>

          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((isOpen) => !isOpen)}
              className="relative h-10 w-10 overflow-visible rounded-full border border-white/15 bg-white/10 p-0 shadow-sm"
              aria-label="Perfil"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <span className="grid h-full w-full place-items-center rounded-full bg-white/10 text-white/75">
                <UserAvatarIcon className="h-5 w-5" />
              </span>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#08080a] bg-emerald-500" />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#101014] text-white shadow-2xl shadow-black/45"
              >
                <div className="flex items-center gap-3 px-4 py-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/10">
                    <UserAvatarIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-5">Zak</p>
                    <p className="truncate text-sm leading-5 text-white/45">z75572702@gmail.com</p>
                  </div>
                </div>

                <div className="border-t border-white/10 py-2">
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white/85 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <DashboardIcon className="h-4 w-4 text-white/45" />
                    Painel
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white/85 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <SettingsIcon className="h-4 w-4 text-white/45" />
                    Configurações
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white/85 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <BillingIcon className="h-4 w-4 text-white/45" />
                    Faturamento
                  </button>
                </div>

                <div className="border-t border-white/10 py-2">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      onSignOut();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  >
                    <SignOutIcon className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1160px] px-6 pb-16 pt-24">
        <section className="grid gap-12 md:grid-cols-[1.25fr_0.9fr] md:items-start">
          <div>
            <h1
              aria-label={`${headlinePrefix}${headlineTerms[termIndex]}${headlineSuffix}`}
              className="min-h-[9.8rem] max-w-[620px] text-[2.45rem] font-light leading-[1.08] tracking-normal text-white sm:min-h-[11.5rem] sm:text-[3rem] lg:min-h-[12.8rem] lg:text-[3.35rem]"
            >
              {headlinePrefix}
              <span className="inline text-white">
                {animatedTerm}
                {headlineSuffix}
                <span className="inline-block h-[0.86em] w-px translate-y-[0.1em] animate-pulse bg-white/80" />
              </span>
            </h1>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/85">
                Acessar dashboard
              </button>
              <button className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-white/10">
                Conferir planos
              </button>
            </div>
          </div>

          <p className="max-w-[420px] pt-3 text-[1.0625rem] leading-7 text-white/55">
            Tenha um desktop completo na nuvem ou faça streaming de aplicativos com alta performance
            direto do seu navegador. Foque em criar, sem a dor de cabeça de gerenciar hardware.
          </p>
        </section>

        <section className="mt-16 overflow-hidden rounded-[18px] border border-white/10 bg-[#090a0f] shadow-2xl shadow-black/40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex h-10 items-center justify-between border-b border-white/10 bg-[#11131a] pl-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-5 w-5 grid-cols-2 gap-0.5 rounded p-0.5 text-sky-300">
                <span className="rounded-[1px] bg-current" />
                <span className="rounded-[1px] bg-current" />
                <span className="rounded-[1px] bg-current" />
                <span className="rounded-[1px] bg-current" />
              </span>
              <span className="truncate text-xs font-semibold text-white/65">Versex Cloud Desktop</span>
              <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[0.7rem] font-medium text-emerald-200 sm:inline">
                sessão segura
              </span>
            </div>
            <div className="flex h-full items-center text-white/60">
              <button
                type="button"
                onClick={() => {
                  setDesktopClosed(false);
                  setDesktopMinimized((isMinimized) => !isMinimized);
                }}
                aria-label="Minimizar"
                className="grid h-10 w-12 place-items-center bg-transparent transition-colors hover:bg-white/10"
              >
                <span className="h-px w-3 bg-current" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDesktopClosed(false);
                  setDesktopMinimized(false);
                  setDesktopExpanded((isExpanded) => !isExpanded);
                }}
                aria-label="Redimensionar"
                aria-pressed={desktopExpanded}
                className="grid h-10 w-12 place-items-center bg-transparent transition-colors hover:bg-white/10"
              >
                <span className="relative h-3.5 w-3.5">
                  <span className="absolute left-1 top-0 h-2.5 w-2.5 border border-current" />
                  <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border border-current" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDesktopClosed(true);
                  setDesktopMinimized(false);
                }}
                aria-label="Fechar"
                className="grid h-10 w-12 place-items-center bg-transparent transition-colors hover:bg-[#c42b1c] hover:text-white"
              >
                <span className="relative h-3.5 w-3.5">
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rotate-45 bg-current" />
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 -rotate-45 bg-current" />
                </span>
              </button>
            </div>
          </div>

          <div
            className={`relative overflow-hidden bg-[#0e1117] px-5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-7 ${
              desktopClosed || desktopMinimized
                ? "max-h-0 min-h-0 py-0 opacity-0"
                : desktopExpanded
                  ? "max-h-[680px] min-h-[620px] py-7 opacity-100"
                  : "max-h-[590px] min-h-[560px] py-6 opacity-100"
            }`}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(12, 35, 61, 0.98), rgba(9, 13, 22, 0.98) 48%, rgba(14, 51, 47, 0.94))",
              }}
            />
            <div className="absolute left-[18%] top-[20%] h-[240px] w-[240px] rotate-45 rounded-[34px] border border-cyan-300/15 bg-cyan-300/5 shadow-[0_0_120px_rgba(56,189,248,0.16)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:56px_56px] opacity-25" />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/8 to-transparent" />

            <div className={`relative z-10 pb-24 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${desktopExpanded ? "min-h-[560px]" : "min-h-[500px]"}`}>
              <div
                className={`absolute inset-x-0 mx-auto flex w-full justify-center px-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-4 ${
                  desktopExpanded ? "top-5 max-w-[920px]" : "top-6 max-w-[800px]"
                }`}
              >
                <div className="w-full overflow-hidden rounded-[18px] border border-white/35 bg-[#eef3f8] text-[#10131a] shadow-2xl shadow-black/45 ring-1 ring-black/5 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <div className="flex h-11 items-center justify-between border-b border-black/10 bg-white/90 px-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#0f172a] shadow-sm">
                        <img
                          src={LOGO_URL}
                          alt=""
                          width="15"
                          height="15"
                          className="h-[15px] w-[15px] object-contain"
                        />
                      </span>
                      <span className="truncate text-xs font-semibold text-slate-700">Versex Manager</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-2.5 py-1 text-[0.68rem] font-bold text-emerald-950 shadow-sm shadow-emerald-500/25">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-950" />
                      pronta
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex min-h-[250px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                createVmStatus === "created"
                                  ? "bg-emerald-500"
                                  : createVmStatus === "creating"
                                    ? "animate-pulse bg-sky-500"
                                    : createVmStatus === "error"
                                      ? "bg-red-500"
                                      : "bg-slate-400"
                              }`}
                            />
                            {vmStatusLabel}
                          </span>
                          <h2 className="mt-5 text-2xl font-semibold tracking-normal text-slate-950">
                            Tester · Versex
                          </h2>
                          <p className="mt-2 max-w-[430px] text-sm leading-6 text-slate-500">
                            Um desktop Windows limpo, pronto para abrir seus apps na nuvem.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleCreateVm}
                          disabled={createVmStatus === "creating" || createVmStatus === "created"}
                          className="rounded-full bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition-all duration-300 hover:bg-[#1d283d] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
                        >
                          {vmActionLabel} ▶
                        </button>
                      </div>

                      <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        {[
                          ["GPU", "NVIDIA Tesla T4"],
                          ["Memória", "16 GB"],
                          ["Disco", "256 GB SSD NVMe"],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                            <p className="text-[0.68rem] font-bold uppercase text-slate-400">{label}</p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
                          </div>
                        ))}
                      </div>

                      {createVmMessage && (
                        <div
                          className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
                            createVmStatus === "error"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : createVmStatus === "created"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-sky-200 bg-sky-50 text-sky-800"
                          }`}
                        >
                          <p>{createVmMessage}</p>
                          {createdVm?.consoleUrl && (
                            <a
                              href={createdVm.consoleUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-block font-semibold underline underline-offset-2"
                            >
                              Abrir no console AWS
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-black/10 bg-slate-100/90 p-4">
                    <div className="flex flex-col gap-4 rounded-2xl border border-slate-900/10 bg-[#0f172a] p-3 text-white shadow-lg shadow-slate-950/10 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm">
                          <img
                            src={MOONLIGHT_ICON_URL}
                            alt=""
                            width="48"
                            height="48"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Moonlight Game Stream</p>
                          <p className="text-sm text-white/60">Baixe para aproveitar o Versex ao máximo!</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm font-semibold">
                        <button className="rounded-xl bg-white px-3 py-2 text-slate-950 transition-colors hover:bg-white/90">
                          Windows
                        </button>
                        <button className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white transition-colors hover:bg-white/10">
                          macOS
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-2 z-20 mx-auto flex min-h-14 max-w-[620px] items-center gap-2 rounded-2xl border border-white/40 bg-white/90 px-3 py-2 text-[#111827] shadow-2xl shadow-black/25 backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <button
                  type="button"
                  onClick={() => {
                    setDesktopClosed(false);
                    setDesktopMinimized(false);
                  }}
                  className="grid h-8 w-8 shrink-0 grid-cols-2 gap-0.5 rounded-lg bg-white p-1.5 text-sky-600 shadow-sm transition-transform duration-300 hover:scale-105"
                  aria-label="Abrir Versex Manager"
                >
                  <span className="rounded-[1px] bg-current" />
                  <span className="rounded-[1px] bg-current" />
                  <span className="rounded-[1px] bg-current" />
                  <span className="rounded-[1px] bg-current" />
                </button>
                <div className="hidden min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500 sm:block">
                  Pesquisar no desktop
                </div>
                <div className="ml-auto hidden text-right text-[0.68rem] font-medium leading-4 text-slate-500 sm:block">
                  13:26
                  <br />
                  10/05
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = (to: Page) => {
    setPage(to);
  };

  const reset = () => navigate("login");

  const showLogin = page === "login";
  const showRegister = page === "register";
  const showForgot = page === "forgot";

  if (isLoggedIn) {
    return (
      <PostLoginHome
        onSignOut={() => {
          setIsLoggedIn(false);
          setPage("login");
        }}
      />
    );
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: `url('${BG_URL}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#0a0a0a",
      }}
    >
      {/* Dark overlay so text stays readable over the bg */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Pages */}
      <div className="relative z-10 min-h-screen">
        <div
          className="flex min-h-screen w-full will-change-transform"
          style={{
            transform: `translate3d(-${pageIndex[page] * 100}%, 0, 0)`,
            transition: "transform 360ms cubic-bezier(0.2, 0, 0, 1)",
            willChange: "transform",
            backfaceVisibility: "hidden",
            contain: "layout style",
          }}
        >
          <ForgotPasswordPage
            active={showForgot}
            onGoLogin={() => navigate("login")}
          />
          <LoginPage
            active={showLogin}
            onGoRegister={() => navigate("register")}
            onGoForgot={() => navigate("forgot")}
            onLoginSuccess={() => setIsLoggedIn(true)}
            onReset={reset}
          />
          <RegisterPage
            active={showRegister}
            onGoLogin={() => navigate("login")}
            onReset={reset}
          />
        </div>
      </div>
    </div>
  );
}
