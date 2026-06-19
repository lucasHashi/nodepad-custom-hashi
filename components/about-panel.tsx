"use client"

import { useState, useCallback } from "react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { CONTENT_TYPE_CONFIG } from "@/lib/content-types"
import {
  Sparkles, Layers, Kanban, GitFork, FolderDown,
  FolderInput, Download, Brain, Zap, Globe, Search, Check, Mail
} from "lucide-react"
import { useModKey } from "@/lib/utils"

interface AboutPanelProps {
  open: boolean
  onClose: () => void
  language?: "en" | "pt-BR"
}

const aboutTranslations = {
  en: {
    copyEmail: "Copy email",
    copied: "Copied!",
    aboutTitle: "About nodepad",
    desc: "A spatial research tool that reads what you write and enriches it with AI — no prompting, no chat. Just capture your thinking and let the structure emerge.",
    badge: "No chat · No prompts · AI that augments your thinking",
    experiment: "A design experiment by",
    sourceCode: "Source code ↗",
    analytics: "This app uses anonymous analytics (Umami) to track feature interactions — views switched, exports, synthesis events. No note content, no personal data, no cross-site tracking.",
    watchIntro: "Watch the intro",
    theIdea: "The idea",
    theIdea1: "Most AI tools ask you to prompt them. nodepad flips this — you write freely, and the AI quietly reads everything you've captured, classifies it, annotates it, finds contradictions, surfaces connections, and synthesises emerging insights. Your canvas evolves as you think.",
    theIdea2: "It's designed for researchers, writers, and deep thinkers who want a thinking partner — not a chatbot. The goal is to reduce the friction between a raw thought and a structured insight.",
    quickStart: "Quick start",
    step1Title: "Add your API key",
    step1Desc: "Open the sidebar (☰ top-left) → Settings. The default provider is OpenRouter — create a free account at openrouter.ai and paste your key. You can use free models (Nemotron 30B or 120B) with no credits, or add credits to access GPT-4o, Claude Sonnet, Gemini 2.5 Pro, and DeepSeek. OpenAI and Z.ai are also supported as direct providers.",
    step2Title: "Capture anything",
    step2Desc: "Type a thought, paste a quote, drop a URL, or write a question into the input bar at the bottom and press Enter. nodepad classifies it automatically.",
    step3Title: "Watch it enrich",
    step3Desc: "Each node is sent to the AI in context with everything else on your canvas. It comes back with a type, category, annotation, and connections to related nodes.",
    step4Title: "Force a type with #type",
    step4Desc: "Start your note with a shorthand like #claim, #question, or #idea to override AI classification.",
    step5Title: "Watch for synthesis",
    step5Desc: "After a few nodes, nodepad auto-generates a synthesis note — an emergent thesis drawn from everything on the canvas. Find it in the Synthesis panel (top-right sparkle icon).",
    contentTypes: "Content types",
    contentTypesDesc: "nodepad recognises 14 types of thinking. Each node is classified into one automatically, and given a colour to match.",
    contentTypesFoot: "Also: definition, opinion, reflection, narrative, comparison, general.",
    views: "Views",
    viewsTiling: "Tiling",
    viewsTilingDesc: "Default. Nodes are laid out in a Binary Space Partition grid — each new node splits the available space. Navigate pages horizontally. A minimap in the bottom-right shows your spatial position.",
    viewsKanban: "Kanban",
    viewsKanbanDesc: "Nodes grouped into columns by content type. Good for reviewing your thinking by category. Tasks always appear first.",
    viewsGraph: "Graph",
    viewsGraphDesc: "An interactive force-directed graph of all your nodes. Connections between them become the focus — highly-connected nodes drift toward the centre, isolated ones settle at the periphery. Click any node to open its full detail panel. Hover to dim unrelated nodes.",
    aiFeatures: "AI features",
    featClassification: "Auto-classification",
    featClassificationDesc: "Every node is classified into one of 14 content types based on its meaning, not just its keywords.",
    featAnnotation: "Contextual annotation",
    featAnnotationDesc: "The AI reads your whole canvas and writes a 2–4 sentence annotation for each node that explains it in the context of everything else.",
    featConnections: "Connection mapping",
    featConnectionsDesc: "Hover the dot indicator on any tile header to dim unrelated nodes and reveal which nodes are semantically connected. In Graph view, the same connections drive the layout — connected nodes pull toward each other.",
    featGrounding: "Web grounding",
    featGroundingDesc: "Enable web grounding in settings to have claims, questions, and references verified against live sources. Citations appear inline.",
    featSynthesis: "Synthesis",
    featSynthesisDesc: "After ≥3 nodes, nodepad quietly generates an emergent thesis — a 15–25 word synthesis of what you're actually thinking about. Solidify it to keep it, or dismiss.",
    exportData: "Export & your data",
    expNodepad: "Export .nodepad",
    expNodepadDesc: "Save your full research space as a .nodepad file. Import it on any device to pick up where you left off.",
    expMarkdown: "Export Markdown",
    expMarkdownDesc: "Export a richly formatted Markdown document with YAML front matter, a table of contents, grouped sections, confidence tables for claims, and cited sources.",
    expLocal: "Your data, locally",
    expLocalDesc: "Everything is stored in your browser's localStorage — no account, no cloud sync. Notes are sent to the AI provider of your choice (OpenRouter, OpenAI, or Z.ai) using your own API key. Nothing is stored server-side.",
    keyboardShortcuts: "Keyboard shortcuts",
    kbCommandMenu: "Command menu",
    kbUndo: "Undo last action",
    kbSubmit: "Submit a new node",
    kbClose: "Close command menu / deselect",
    tips: "Tips",
    tipsList: [
      "Write in fragments — nodepad handles the structure. You don't need to write in full sentences.",
      "Mix types freely. A canvas with claims, questions, and quotes is richer than one with only one type.",
      "Switch to Graph view (via ⌘K → Graph) to understand which nodes are central to your thinking and which are peripheral.",
      "The canvas index (⌘K → Index) groups nodes by category — hovering a title in the index highlights the matching node in any view.",
      "Pin important nodes with the pin icon in Tiling view so they stand out visually.",
      "Tasks added to the canvas become a sub-task list — add sub-tasks by nesting them in the tile.",
      "Use multiple projects (sidebar) to keep separate research threads isolated."
    ]
  },
  "pt-BR": {
    copyEmail: "Copiar e-mail",
    copied: "Copiado!",
    aboutTitle: "Sobre o nodepad",
    desc: "Uma ferramenta de pesquisa espacial que lê o que você escreve e o enriquece com IA — sem necessidade de comandos ou chat. Apenas capture seu pensamento e deixe a estrutura emergir.",
    badge: "Sem chat · Sem comandos · IA que amplia seu pensamento",
    experiment: "Um experimento de design por",
    sourceCode: "Código fonte ↗",
    analytics: "Este aplicativo usa estatísticas anônimas (Umami) para rastrear interações de recursos — visualizações alternadas, exportações, eventos de síntese. Nenhum conteúdo de nota, dado pessoal ou rastreamento entre sites é feito.",
    watchIntro: "Assista à introdução",
    theIdea: "A ideia",
    theIdea1: "A maioria das ferramentas de IA pede que você insira prompts. O nodepad inverte isso — você escreve livremente e a IA lê silenciosamente tudo o que você capturou, classifica, anota, encontra contradições, descobre conexões e sintetiza insights emergentes. Sua tela evolui conforme você pensa.",
    theIdea2: "Ele foi projetado para pesquisadores, escritores e pensadores profundos que desejam um parceiro de pensamento — não um chatbot. O objetivo é reduzir o atrito entre um pensamento bruto e um insight estruturado.",
    quickStart: "Início rápido",
    step1Title: "Adicione sua chave API",
    step1Desc: "Abra a barra lateral (☰ superior esquerdo) → Configurações. O provedor padrão é o OpenRouter — crie uma conta gratuita em openrouter.ai e cole sua chave. Você pode usar modelos gratuitos (Nemotron 30B ou 120B) sem créditos, ou adicionar créditos para acessar GPT-4o, Claude Sonnet, Gemini 2.5 Pro e DeepSeek. OpenAI e Z.ai também são suportados como provedores diretos.",
    step2Title: "Capture qualquer coisa",
    step2Desc: "Digite um pensamento, cole uma citação, insira uma URL ou digite uma pergunta na barra de entrada na parte inferior e pressione Enter. O nodepad classifica isso automaticamente.",
    step3Title: "Veja o enriquecimento",
    step3Desc: "Cada nó é enviado para a IA no contexto de tudo o mais em sua tela. Ele retorna com um tipo, categoria, anotação e conexões com nós relacionados.",
    step4Title: "Force um tipo com #tipo",
    step4Desc: "Comece sua nota com uma abreviação como #claim, #question ou #idea para substituir a classificação da IA.",
    step5Title: "Observe a síntese",
    step5Desc: "Após alguns nós, o nodepad gera automaticamente uma nota de síntese — uma tese emergente extraída de tudo na tela. Encontre-a no painel de Síntese (ícone de brilho no canto superior direito).",
    contentTypes: "Tipos de conteúdo",
    contentTypesDesc: "O nodepad reconhece 14 tipos de pensamento. Cada nó é classificado em um automaticamente e recebe uma cor correspondente.",
    contentTypesFoot: "Também: definição, opinião, reflexão, narrativa, comparação, geral.",
    views: "Visualizações",
    viewsTiling: "Mosaico",
    viewsTilingDesc: "Padrão. Os nós são organizados em uma grade de Partição Binária de Espaço — cada novo nó divide o espaço disponível. Navegue pelas páginas horizontalmente. Um minimapa no canto inferior direito mostra sua posição espacial.",
    viewsKanban: "Quadro (Kanban)",
    viewsKanbanDesc: "Nós agrupados em colunas por tipo de conteúdo. Bom para revisar seus pensamentos por categoria. As tarefas sempre aparecem primeiro.",
    viewsGraph: "Gráfico",
    viewsGraphDesc: "Um gráfico de forças interativo de todos os seus nós. As conexões entre eles tornam-se o foco — nós altamente conectados flutuam em direção ao centro, os isolados se assentam na periferia. Clique em qualquer nó para abrir seu painel de detalhes. Passe o cursor para esmaecer nós não relacionados.",
    aiFeatures: "Recursos de IA",
    featClassification: "Classificação automática",
    featClassificationDesc: "Cada nó é classificado em um dos 14 tipos de conteúdo com base em seu significado, e não apenas em palavras-chave.",
    featAnnotation: "Anotação contextual",
    featAnnotationDesc: "A IA lê toda a sua tela e escreve uma anotação de 2 a 4 frases para cada nó, explicando-o no contexto de tudo o mais.",
    featConnections: "Mapeamento de conexões",
    featConnectionsDesc: "Passe o cursor sobre o indicador de ponto em qualquer cabeçalho de bloco para esmaecer nós não relacionados e revelar quais nós estão semanticamente conectados. Na visualização de Gráfico, as mesmas conexões conduzem o layout — nós conectados se atraem.",
    featGrounding: "Pesquisa Web (Grounding)",
    featGroundingDesc: "Ative a pesquisa web nas configurações para que afirmações, perguntas e referências sejam verificadas em fontes em tempo real. As citações aparecem inline.",
    featSynthesis: "Síntese",
    featSynthesisDesc: "Após ≥3 nós, o nodepad gera silenciosamente uma tese emergente — uma síntese de 15 a 25 palavras do que você realmente está pensando. Consolide-a para mantê-la ou descarte-a.",
    exportData: "Exportação e seus dados",
    expNodepad: "Exportar .nodepad",
    expNodepadDesc: "Salve seu espaço de pesquisa completo como um arquivo .nodepad. Importe-o em qualquer dispositivo para continuar de onde parou.",
    expMarkdown: "Exportar Markdown",
    expMarkdownDesc: "Exporte um documento Markdown ricamente formatado com front matter YAML, sumário, seções agrupadas, tabelas de confiança para afirmações e fontes citadas.",
    expLocal: "Seus dados, localmente",
    expLocalDesc: "Tudo é armazenado no localStorage do seu navegador — sem conta, sem sincronização na nuvem. As notas são enviadas ao provedor de IA de sua escolha (OpenRouter, OpenAI ou Z.ai) usando sua própria chave de API. Nada é armazenado no servidor.",
    keyboardShortcuts: "Atalhos de teclado",
    kbCommandMenu: "Menu de comandos",
    kbUndo: "Desfazer última ação",
    kbSubmit: "Enviar um novo nó",
    kbClose: "Fechar menu de comandos / desmarcar",
    tips: "Dicas",
    tipsList: [
      "Escreva em fragmentos — o nodepad cuida da estrutura. Você não precisa escrever frases completas.",
      "Misture tipos livremente. Uma tela com afirmações, perguntas e citações é mais rica do que uma com apenas um tipo.",
      "Mude para a visualização de Gráfico (via ⌘K → Gráfico) para entender quais nós são centrais para o seu pensamento e quais são periféricos.",
      "O índice da tela (⌘K → Índice) agrupa nós por categoria — passar o cursor sobre um título no índice destaca o nó correspondente em qualquer visualização.",
      "Fixe nós importantes com o ícone de alfinete na visualização em Mosaico para que eles se destaquem visualmente.",
      "Tarefas adicionadas à tela tornam-se uma lista de subtarefas — adicione subtarefas aninhando-as no bloco.",
      "Use múltiplos espaços (barra lateral) para manter threads de pesquisa diferentes isoladas."
    ]
  }
}

function CopyEmailButton({ language }: { language?: "en" | "pt-BR" }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("mskayyali@me.com").then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest border px-2 py-0.5 rounded-sm transition-all duration-300 cursor-pointer"
      style={{
        color:       copied ? "var(--color-emerald-400, #34d399)" : "color-mix(in oklch, var(--primary) 60%, transparent)",
        borderColor: copied ? "color-mix(in oklch, var(--color-emerald-400, #34d399) 35%, transparent)" : "color-mix(in oklch, var(--primary) 25%, transparent)",
      }}
    >
      <span className="relative flex items-center" style={{ width: "12px", height: "12px" }}>
        <Mail
          className="absolute inset-0 transition-all duration-300"
          style={{ width: "12px", height: "12px", opacity: copied ? 0 : 1, transform: copied ? "scale(0.6)" : "scale(1)" }}
        />
        <Check
          className="absolute inset-0 transition-all duration-300"
          style={{ width: "12px", height: "12px", opacity: copied ? 1 : 0, transform: copied ? "scale(1)" : "scale(0.6)" }}
        />
      </span>
      <span className="transition-all duration-300" style={{ opacity: copied ? 0.7 : 1 }}>
        {copied ? (language === "pt-BR" ? "Copiado!" : "Copied!") : (language === "pt-BR" ? "Copiar e-mail" : "Copy email")}
      </span>
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 border border-primary/20 font-mono text-[10px] font-black text-primary">
        {n}
      </div>
      <div className="space-y-1 pt-0.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  )
}

function Shortcut({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <kbd key={i} className="px-1.5 py-0.5 rounded-sm bg-secondary border border-border font-mono text-[10px] text-foreground">
            {k}
          </kbd>
        ))}
      </div>
    </div>
  )
}

const CONTENT_TYPE_HIGHLIGHTS = [
  "claim", "question", "idea", "task", "thesis", "quote", "entity", "reference"
] as const

export function AboutPanel({ open, onClose, language }: AboutPanelProps) {
  const mod = useModKey()
  const t = aboutTranslations[language || "en"]
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl flex flex-col gap-0 p-0 bg-card border-l border-border z-[200] overflow-hidden"
      >
        <SheetTitle className="sr-only">{t.aboutTitle}</SheetTitle>

        {/* Header */}
        <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-0.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-primary" />
              <span className="inline-block h-3 w-3 rounded-sm bg-primary/60" />
              <span className="inline-block h-3 w-3 rounded-sm bg-primary/30" />
            </div>
            <h1 className="font-mono text-xl font-black text-foreground tracking-tight">nodepad</h1>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
            {t.desc}
          </p>
          <p className="mt-2 text-xs font-mono text-primary/60 uppercase tracking-widest">
            {t.badge}
          </p>
          <p className="mt-3 text-xs text-muted-foreground/50 flex items-center gap-3 flex-wrap">
            <span>
              {t.experiment}{" "}
              <a
                href="http://mskayyali.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/70 hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Saleh Kayyali
              </a>
            </span>
            <a
              href="https://github.com/mskayyali/nodepad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 hover:text-foreground border border-border/80 hover:border-border px-2 py-0.5 rounded-sm transition-colors"
            >
              {t.sourceCode}
            </a>
            <CopyEmailButton language={language} />
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground/35">
            {t.analytics}
          </p>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

          {/* Intro video */}
          <Section title={t.watchIntro}>
            <div className="relative w-full rounded-sm overflow-hidden border border-border/50" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube-nocookie.com/embed/jZu4sgZOOO4?rel=0&modestbranding=1&color=white"
                title="nodepad introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Section>

          {/* The idea */}
          <Section title={t.theIdea}>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.theIdea1}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.theIdea2}
            </p>
          </Section>

          {/* Quick start */}
          <Section title={t.quickStart}>
            <div className="space-y-4">
              <Step n={1} title={t.step1Title}>
                {t.step1Desc}
              </Step>
              <Step n={2} title={t.step2Title}>
                {t.step2Desc}
              </Step>
              <Step n={3} title={t.step3Title}>
                {t.step3Desc}
              </Step>
              <Step n={4} title={t.step4Title}>
                {t.step4Desc}
              </Step>
              <Step n={5} title={t.step5Title}>
                {t.step5Desc}
              </Step>
            </div>
          </Section>

          {/* Content types */}
          <Section title={t.contentTypes}>
            <p className="text-sm text-muted-foreground mb-3">
              {t.contentTypesDesc}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_TYPE_HIGHLIGHTS.map((type) => {
                const config = CONTENT_TYPE_CONFIG[type]
                const Icon = config.icon
                const typeKey = `type${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof t
                const displayLabel = t[typeKey] || config.label
                return (
                  <div key={type} className="flex items-center gap-2.5 px-3 py-2 rounded-sm bg-secondary/50 border border-border/50">
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: config.accentVar }} />
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: config.accentVar }}>
                        {displayLabel}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-2">
              {t.contentTypesFoot}
            </p>
          </Section>

          {/* Views */}
          <Section title={t.views}>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-sm bg-secondary/30 border border-border/50">
                <Layers className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{t.viewsTiling} <span className="font-mono text-[10px] text-muted-foreground/50 ml-1">{mod}1</span></p>
                  <p className="text-sm text-muted-foreground">{t.viewsTilingDesc}</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-sm bg-secondary/30 border border-border/50">
                <Kanban className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{t.viewsKanban} <span className="font-mono text-[10px] text-muted-foreground/50 ml-1">{mod}2</span></p>
                  <p className="text-sm text-muted-foreground">{t.viewsKanbanDesc}</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-sm bg-secondary/30 border border-border/50">
                <GitFork className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{t.viewsGraph} <span className="font-mono text-[10px] text-muted-foreground/50 ml-1">{mod}3</span></p>
                  <p className="text-sm text-muted-foreground">{t.viewsGraphDesc}</p>
                </div>
              </div>
            </div>
          </Section>

          {/* AI features */}
          <Section title={t.aiFeatures}>
            <div className="space-y-3">
              {[
                { icon: Brain, title: t.featClassification, desc: t.featClassificationDesc },
                { icon: Zap, title: t.featAnnotation, desc: t.featAnnotationDesc },
                { icon: Search, title: t.featConnections, desc: t.featConnectionsDesc },
                { icon: Globe, title: t.featGrounding, desc: t.featGroundingDesc },
                { icon: Sparkles, title: t.featSynthesis, desc: t.featSynthesisDesc },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <Icon className="h-4 w-4 flex-shrink-0 text-primary/70 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Export & data */}
          <Section title={t.exportData}>
            <div className="space-y-3">
              <div className="flex gap-3">
                <FolderDown className="h-4 w-4 flex-shrink-0 text-primary/70 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{t.expNodepad}</p>
                  <p className="text-sm text-muted-foreground">{t.expNodepadDesc}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Download className="h-4 w-4 flex-shrink-0 text-primary/70 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{t.expMarkdown}</p>
                  <p className="text-sm text-muted-foreground">{t.expMarkdownDesc}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <FolderInput className="h-4 w-4 flex-shrink-0 text-primary/70 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{t.expLocal}</p>
                  <p className="text-sm text-muted-foreground">{t.expLocalDesc}</p>
                </div>
              </div>
            </div>
          </Section>

          {/* Keyboard shortcuts */}
          <Section title={t.keyboardShortcuts}>
            <div className="rounded-sm border border-border overflow-hidden">
              <div className="px-3 divide-y divide-border/40">
                <Shortcut keys={[mod, "K"]} label={t.kbCommandMenu} />
                <Shortcut keys={[mod, "Z"]} label={t.kbUndo} />
                <Shortcut keys={["Enter"]} label={t.kbSubmit} />
                <Shortcut keys={["Esc"]} label={t.kbClose} />
              </div>
            </div>
          </Section>

          {/* Tips */}
          <Section title={t.tips}>
            <ul className="space-y-2">
              {t.tipsList.map((tip, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                  <span className="flex-shrink-0 font-mono text-[10px] text-primary/50 mt-0.5 pt-px">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </Section>

          {/* Footer */}
          <div className="pt-2 pb-4 border-t border-border">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-sm bg-primary" />
              <span className="inline-block h-1.5 w-1.5 rounded-sm bg-primary/60" />
              <span className="inline-block h-1.5 w-1.5 rounded-sm bg-primary/30" />
              <span className="font-mono text-[10px] font-bold text-muted-foreground/40 ml-1">nodepad</span>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}
