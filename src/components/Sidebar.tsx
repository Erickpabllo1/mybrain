'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search, Home, Calendar, FolderOpen,
  CheckCircle, Settings, Plus, Trash2, HelpCircle,
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-[#131313] flex flex-col py-6 px-4 border-r border-transparent text-sm shrink-0">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-white tracking-tighter">Arquitetura</h1>
        <p className="text-xs text-[#acabab]">Organizador Pessoal</p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#acabab]" />
        <input
          type="text"
          placeholder="Buscar"
          className="w-full bg-[#1f2020] text-white border-none rounded-md py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-[#adc6ff] outline-none placeholder-[#acabab] transition-all"
        />
      </div>

      <nav className="flex-1 space-y-1">
        <NavItem href="/"        icon={<Home       className="w-[18px] h-[18px]" />} label="Página inicial"  active={pathname === '/'} />
        <NavItem href="/rotina"  icon={<Calendar   className="w-[18px] h-[18px]" />} label="Minha rotina"   active={pathname.startsWith('/rotina')} />
        <NavItem href="/projetos" icon={<FolderOpen className="w-[18px] h-[18px]" />} label="Projetos"       active={pathname.startsWith('/projetos')} />
        <NavItem href="/tarefas" icon={<CheckCircle className="w-[18px] h-[18px]" />} label="Tarefas"        active={pathname.startsWith('/tarefas')} />
        <NavItem href="/config"  icon={<Settings   className="w-[18px] h-[18px]" />} label="Configurações"  active={pathname.startsWith('/config')} />
      </nav>

      <button className="mt-4 flex items-center gap-2 w-full text-left px-3 py-2 text-[#acabab] hover:text-white hover:bg-[#1f2020] transition-all rounded-md">
        <Plus className="w-[18px] h-[18px]" />
        <span>Nova página</span>
      </button>

      <div className="mt-auto pt-4 border-t border-white/5 space-y-1">
        <NavItem href="/lixeira" icon={<Trash2     className="w-[18px] h-[18px]" />} label="Lixeira" active={false} />
        <NavItem href="/ajuda"   icon={<HelpCircle className="w-[18px] h-[18px]" />} label="Ajuda"   active={false} />
      </div>
    </aside>
  )
}

function NavItem({
  href, icon, label, active,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
        active
          ? 'bg-[#1f2020] text-white font-medium'
          : 'text-[#acabab] hover:text-white hover:bg-[#1f2020]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}
