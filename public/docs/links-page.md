# Documentacao Tecnica - Pagina de Links (`/links`)

## Sumario

- [Visao Geral](#visao-geral)
- [Estrutura da Pagina](#estrutura-da-pagina)
- [Arvore de Componentes](#arvore-de-componentes)
- [HeroSection](#herosection)
- [Grid de Links](#grid-de-links)
- [Rodape (Copyright)](#rodape-copyright)
- [Sistema de Cores](#sistema-de-cores)
- [Tipografia](#tipografia)
- [Animacoes](#animacoes)
- [Responsividade](#responsividade)
- [Componentes UI Reutilizaveis](#componentes-ui-reutilizaveis)
- [Decisoes Tecnicas](#decisoes-tecnicas)
- [Mapa de Arquivos](#mapa-de-arquivos)

---

## Visao Geral

A pagina de links (`src/app/links/page.tsx`) funciona como um **link-in-bio** para a Dra. Luanna Procopio. Ela exibe uma hero section com apresentacao pessoal e uma grade de cards com links para WhatsApp e Instagram. A pagina e marcada como `"use client"` por depender de interacao no navegador (scroll suave).

**Rota:** `/links`
**Runtime:** Client Component (`"use client"`)
**Layout:** Herda do root layout (`src/app/layout.tsx`) - nao possui layout proprio.

---

## Estrutura da Pagina

A pagina segue uma composicao vertical dividida em dois blocos principais:

```
<div>  (container raiz - tela inteira, fundo beige)
  |
  +-- <HeroSection />          (bloco 1 - hero com imagem de fundo e texto)
  |
  +-- <section #links-section>  (bloco 2 - gradiente dourado)
        |
        +-- <div>  (grid de cards - margem negativa para sobrepor o hero)
        |     |
        |     +-- Card WhatsApp
        |     +-- Card Instagram
        |
        +-- <p>  (copyright)
</div>
```

### Container Raiz

```tsx
<div className="min-h-screen w-full" style={{ backgroundColor: "var(--color-beige-dark)" }}>
```

- Ocupa toda a altura da viewport (`min-h-screen`) e toda a largura (`w-full`).
- Cor de fundo: `--color-beige-dark` (`#dbc5b1`) aplicada via inline style.
- Funciona como "fallback" visual caso os blocos internos nao cubram toda a tela.

---

## Arvore de Componentes

```
LinksPage
  +-- HeroSection (src/components/HeroSection.tsx)
  |     +-- next/image (background desktop)
  |     +-- next/image (background mobile)
  |     +-- Titulo com gradient text
  |     +-- Paragrafo descritivo
  |     +-- Botao scroll (ChevronDown - lucide-react)
  |
  +-- Card (src/components/ui/card.tsx)  x2
  |     +-- CardContent
  |           +-- SVG icon (inline)
  |           +-- Texto label
  |
  +-- Paragrafo copyright
```

---

## HeroSection

**Arquivo:** `src/components/HeroSection.tsx`
**Tipo:** Client Component (`"use client"`)

### Estrutura

A hero ocupa toda a viewport em mobile (`min-h-screen`) e altura fixa de 900px em desktop (`lg:h-[900px]`). Utiliza posicionamento relativo com `overflow-hidden` para conter as imagens de fundo.

### Imagens de Fundo

Duas versoes de imagem sao carregadas com o componente `next/image`:

| Imagem | Arquivo | Visibilidade |
|--------|---------|-------------|
| Desktop | `/background-link.jpg` | `hidden lg:block` |
| Mobile | `/background-link-mobile.jpg` | `block lg:hidden` |

Ambas usam:
- `fill` - preenchem o container pai
- `object-cover object-center` - cobrem a area sem distorcao
- `priority` - carregamento prioritario (LCP optimization)

### Conteudo Textual

O conteudo esta dentro de um wrapper com `z-10` para ficar acima das imagens:

```
max-w-7xl mx-auto
  +-- div flex-1 (texto)
        +-- h2 (titulo principal)
        |     "Muito Prazer, sou a"
        |     <span> "Dra. Luanna Procopio" (gradient text)
        |
        +-- p (descricao)
        |     "Nutricionista especialista em emagrecimento e hipertrofia..."
        |
        +-- div (indicador de scroll)
              +-- button (icone ChevronDown com gradient background)
              +-- textos "Deslize para baixo e descubra links uteis"
```

#### Gradient Text no Nome

O nome "Dra. Luanna Procopio" utiliza **gradient text** via CSS:

```tsx
style={{
  backgroundImage: "var(--gradient-hero-text)",  // linear-gradient(to right, #80652d, #c8a364)
  backgroundClip: "text",
  color: "transparent",
}}
```

A tecnica aplica o gradiente como background e torna o texto transparente, fazendo com que o gradiente apareça atraves do formato das letras.

### Scroll Suave

O botao de scroll implementa navegacao suave via JavaScript:

```tsx
const scrollToLinks = () => {
  const linksSection = document.getElementById("links-section")
  linksSection?.scrollIntoView({ behavior: "smooth" })
}
```

O botao target e a `<section id="links-section">` da pagina principal.

### Efeito Shimmer no Botao

O botao possui um overlay com efeito shimmer no hover:

```tsx
<div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300
  bg-gradient-to-r from-transparent via-white to-transparent
  transform -skew-x-12 translate-x-[-200%]
  group-hover:translate-x-[200%] transition-transform duration-700"
/>
```

O efeito desliza uma faixa branca semi-transparente da esquerda para a direita ao passar o mouse.

### Bounce no ChevronDown

O icone de seta utiliza a classe `animate-bounce-slow` com animacao customizada:

```css
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}
```

---

## Grid de Links

### Sobreposicao com Hero

A grade de cards sobe sobre o hero section usando **margem negativa**:

```tsx
<div className="max-w-7xl mx-auto mt-[-100px] relative z-20">
```

- `mt-[-100px]` - puxa os cards 100px para cima, sobrepondo o final do hero
- `z-20` - garante que os cards fiquem acima do conteudo do hero (`z-10`)

### Layout da Grade

```tsx
<div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
```

- Grade com **2 colunas** em todas as breakpoints
- Gap de `24px` (`gap-6`) entre os cards

### Estrutura Individual de um Card

Cada card segue a mesma estrutura:

```
<div>  (wrapper de animacao - animate-fadeIn)
  +-- <a>  (link externo - target="_blank")
        +-- <Card>  (componente UI)
              +-- <CardContent>
                    +-- <div flex-col>
                          +-- <svg>  (icone da plataforma)
                          +-- <div flex-col>
                                +-- <span>  (subtitulo - ex: "Contato por")
                                +-- <span>  (titulo - ex: "WhatsApp", fonte Ravelle)
```

### Estilizacao dos Cards

```tsx
<Card
  className="h-[140px] sm:h-[180px] cursor-pointer border-1"
  style={{
    borderColor: "var(--color-beige-dark)",    // #dbc5b1
    background: "var(--gradient-card-background)", // linear-gradient(to bottom, #f0dcc8, #f5e3d2)
  }}
>
```

| Propriedade | Mobile | Desktop (sm+) |
|-------------|--------|---------------|
| Altura | `140px` | `180px` |
| Borda | `1px solid #dbc5b1` | `1px solid #dbc5b1` |
| Background | Gradiente vertical (beige claro -> beige medio) | Mesmo |
| Cursor | `pointer` | `pointer` |

O componente `Card` base adiciona: `rounded-lg`, `shadow-sm`, e classes de cor do sistema de design (que sao sobrescritas pelo inline style).

### Icones SVG

Os icones de WhatsApp e Instagram sao **SVGs inline** (nao usam biblioteca de icones). Isso garante:

- Zero dependencias externas para os icones
- Controle total sobre tamanho e cor via classes/styles
- Tamanhos responsivos: `w-8 h-8` em mobile, `w-11 h-11` em `sm+`
- Cor aplicada via `fill: var(--color-text-black)` (`#000000`)

### Textos dos Cards

Cada card tem dois niveis de texto:

**Subtitulo:**
```tsx
<span className="text-xs sm:text-sm" style={{ color: "var(--color-text-black)" }}>
  Contato por  /  Acompanhe meu
</span>
```

**Titulo principal:**
```tsx
<span
  className="text-2xl sm:text-[35px] font-regular text-left"
  style={{ color: "var(--color-text-black)", fontFamily: "Ravelle, serif" }}
>
  WhatsApp  /  Instagram
</span>
```

| Elemento | Mobile | Desktop (sm+) | Fonte |
|----------|--------|---------------|-------|
| Subtitulo | `text-xs` (12px) | `text-sm` (14px) | Sans-serif (padrao) |
| Titulo | `text-2xl` (24px) | `35px` | Ravelle (serif) |

### Links e Acessibilidade

Ambos os cards sao envoltos por `<a>` com:

```tsx
<a
  href="https://wa.me/5511999999999"   // ou instagram.com/luannaprocopio
  target="_blank"
  rel="noopener noreferrer"
  className="block h-full"
>
```

- `target="_blank"` - abre em nova aba
- `rel="noopener noreferrer"` - seguranca contra `window.opener` exploitation
- `block h-full` - faz o link ocupar toda a area do card (area clicavel maximizada)

### Cards Existentes

| Card | Link | Icone | Subtitulo | Titulo |
|------|------|-------|-----------|--------|
| WhatsApp | `https://wa.me/5511999999999` | SVG WhatsApp | "Contato por" | "WhatsApp" |
| Instagram | `https://instagram.com/luannaprocopio` | SVG Instagram | "Acompanhe meu" | "Instagram" |

---

## Rodape (Copyright)

```tsx
<p className="text-center text-sm text-white mt-15 mb-0 animate-fadeIn opacity-0"
   style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
  Copyright © Luanna Procopio {new Date().getFullYear()} - Todos os direitos reservados.
</p>
```

- Texto centralizado, branco, tamanho `sm` (14px)
- Margem superior de `mt-15` (60px)
- Ano dinamico via `new Date().getFullYear()`
- Comeca invisivel (`opacity-0`) e aparece com fade apos 0.5s
- `animationFillMode: "forwards"` mantem a opacidade final (1) apos a animacao

---

## Sistema de Cores

### Arquitetura de Variaveis CSS

O projeto adota um **sistema de design tokens em tres camadas** definido em `src/app/globals.css`:

```
Camada 1: Cores Base           ->  --color-beige-light, --color-gold-dark, etc.
Camada 2: Gradientes Semanticos ->  --gradient-hero-background, --gradient-card-background, etc.
Camada 3: Tokens de Sistema     ->  --background, --foreground, --primary, etc.
```

### Cores Usadas na Pagina de Links

| Variavel | Valor | Uso na Pagina |
|----------|-------|---------------|
| `--color-beige-dark` | `#dbc5b1` | Fundo raiz, borda dos cards |
| `--color-beige-light` | `#f0dcc8` | Componente dos gradientes |
| `--color-beige-medium` | `#f5e3d2` | Componente dos gradientes |
| `--color-gold-dark` | `#80652d` | Gradiente da section, botao hero, gradient text |
| `--color-gold-light` | `#c8a364` | Gradiente da section, botao hero, gradient text |
| `--color-text-primary` | `#261f1b` | Texto do hero |
| `--color-text-black` | `#000000` | Texto e icones dos cards |
| `--color-text-light` | `#d9d9d9` | Icone ChevronDown |

### Gradientes Usados

| Gradiente | Direcao | De | Para | Onde e usado |
|-----------|---------|-----|------|-------------|
| `--gradient-hero-background` | `to bottom` | `#f0dcc8` | `#f5e3d2` | Background do HeroSection |
| `--gradient-hero-text` | `to right` | `#80652d` | `#c8a364` | Texto "Dra. Luanna Procopio" |
| `--gradient-hero-button` | `to right` | `#80652d` | `#c8a364` | Botao de scroll |
| `--gradient-section-background` | `to right` | `#80652d` | `#c8a364` | Fundo da section de links |
| `--gradient-card-background` | `to bottom` | `#f0dcc8` | `#f5e3d2` | Background dos cards |

### Paleta Visual

A pagina trabalha com duas familias de cores:

- **Beige/Creme** (`#dbc5b1` a `#f5e3d2`): backgrounds, bordas, cards - transmite suavidade e elegancia
- **Dourado** (`#80652d` a `#c8a364`): gradientes de destaque, section principal, texto do nome - transmite sofisticacao

---

## Tipografia

### Fontes do Projeto

| Fonte | Tipo | Carregamento | Uso |
|-------|------|-------------|-----|
| Zalando Sans Variable | Sans-serif | `@fontsource-variable/zalando-sans` (npm) | Fonte principal do body |
| Ravelle | Serif/Display | `@font-face` local (`public/fonts/`) | Titulos dos cards ("WhatsApp", "Instagram") |
| Geist Mono | Monospace | `next/font/google` | Variavel CSS (uso secundario) |

### Arquivos da Ravelle

```
public/fonts/
  ravelle-thin.otf
  ravelle-light.otf
  ravelle-regular.otf
  ravelle-medium.otf
  ravelle-semibold.otf
  ravelle-bold.otf
```

Apenas dois pesos estao declarados no `@font-face`:
- `font-weight: normal` -> `ravelle-regular.otf`
- `font-weight: bold` -> `ravelle-bold.otf`

### Aplicacao na Pagina

A Ravelle e aplicada via **inline style** nos titulos dos cards:

```tsx
style={{ fontFamily: "Ravelle, serif" }}
```

Nao e usada a utility class do Tailwind (`font-serif`) neste componente - o estilo e aplicado diretamente.

---

## Animacoes

### fadeIn

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease-out;
}
```

Combina tres efeitos: aparecimento (opacity), deslize para cima (translateY) e escala sutil (scale).

### Sequenciamento de Animacoes

As animacoes sao escalonadas via `animationDelay` inline:

| Elemento | Delay | Fill Mode |
|----------|-------|-----------|
| Titulo do hero (h2) | `0.2s` | `both` |
| Descricao do hero (p) | `0.6s` | `both` |
| Indicador de scroll | `0.8s` | `both` |
| Card WhatsApp | `0.1s` | `both` |
| Card Instagram | `0.2s` | `both` |
| Copyright | `0.5s` | `forwards` |

O `animationFillMode: "both"` garante que o elemento mantenha o estado inicial (invisivel) antes da animacao e o estado final (visivel) apos a animacao.

O copyright usa `opacity-0` como classe base + `animationFillMode: "forwards"` para iniciar transparente e manter a opacidade final.

### bounce-slow

```css
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}
```

Aplicada no icone `ChevronDown` do hero - animacao infinita que sobe 8px e volta.

---

## Responsividade

### Breakpoints Utilizados (Tailwind v4)

| Breakpoint | Min-width | Uso na Pagina |
|------------|-----------|---------------|
| (base) | `0px` | Layout mobile-first |
| `sm` | `640px` | Tamanhos de texto, padding, altura dos cards |
| `lg` | `1024px` | Hero height, imagens de fundo, padding lateral |

### Comportamento por Breakpoint

#### Mobile (< 640px)
- Hero: `min-h-screen`, items alinhados `justify-end`
- Imagem de fundo: `background-link-mobile.jpg`
- Cards: `h-[140px]`, padding `p-3`
- Icones: `w-8 h-8`
- Subtitulo: `text-xs` (12px)
- Titulo: `text-2xl` (24px)
- Padding da section: `px-4`

#### Tablet/Desktop (>= 640px)
- Cards: `h-[180px]`, padding `p-6`
- Icones: `w-11 h-11`
- Subtitulo: `text-sm` (14px)
- Titulo: `text-[35px]` (35px)
- Padding da section: `px-6`

#### Desktop (>= 1024px)
- Hero: `h-[900px]`, items `justify-center`
- Imagem de fundo: `background-link.jpg`
- Layout hero: `flex-row` (texto a esquerda)
- Padding da section: `px-12`

---

## Componentes UI Reutilizaveis

### Card (`src/components/ui/card.tsx`)

Componente do **shadcn/ui** com pattern `forwardRef`:

```tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
```

- Classes base: `rounded-lg border bg-card text-card-foreground shadow-sm`
- Aceita `className` adicional mergeado via `cn()` (clsx + tailwind-merge)
- Na pagina de links, o `background` e `borderColor` sao sobrescritos via inline style

### CardContent

```tsx
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
```

- Padding base: `p-6 pt-0`
- Na pagina de links, sobrescrito para `p-3 sm:p-6 h-full`

### Funcao `cn()` (`src/lib/utils.ts`)

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Combina `clsx` (concatenacao condicional) com `tailwind-merge` (resolucao de conflitos de classes Tailwind).

---

## Decisoes Tecnicas

### 1. Inline Styles vs Utility Classes

A pagina mistura **Tailwind utility classes** (layout, spacing, responsividade) com **inline styles** (cores, gradientes, fontes). Isso ocorre porque:

- As CSS custom properties (`var(--...)`) nao podem ser usadas diretamente em classes Tailwind padrao
- Mantém as variaveis de design centralizadas no `:root` em vez de duplicadas no Tailwind config
- Permite alterar o tema inteiro mudando apenas as variaveis CSS

### 2. SVGs Inline em vez de Biblioteca de Icones

Os icones de WhatsApp e Instagram sao SVGs inline diretamente no JSX. Isso foi escolhido porque:

- Sao apenas 2 icones - nao justifica uma dependencia extra
- Controle total sobre `fill`, tamanho e comportamento responsivo
- Sem overhead de bundle de biblioteca de icones
- A excecao e o `ChevronDown` do hero, que vem do `lucide-react` (provavelmente ja era dependencia do projeto)

### 3. Imagens de Background Separadas (Mobile/Desktop)

Em vez de CSS media queries ou `srcSet`, o projeto usa **duas tags `<Image>`** com visibilidade controlada por classes:

```tsx
<Image className="hidden lg:block" ... />  // Desktop
<Image className="block lg:hidden" ... />  // Mobile
```

Ambas as imagens sao carregadas (nao ha lazy loading condicional), mas apenas uma e visivel. Isso simplifica o codigo e usa `next/image` para otimizacao automatica.

### 4. Tailwind CSS v4 sem Config File

O projeto utiliza **Tailwind CSS v4**, que elimina o `tailwind.config.js` em favor de configuracao via CSS:

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --font-sans: "Zalando Sans Variable", sans-serif;
  /* ... */
}
```

### 5. Margem Negativa para Sobreposicao

Os cards sobem sobre o hero usando `mt-[-100px]` com `z-20`, criando um efeito visual de continuidade entre as secoes sem necessidade de posicionamento absoluto.

### 6. Client Component Necessario

A pagina e marcada como `"use client"` pois importa `HeroSection`, que usa:

- `document.getElementById()` para scroll suave
- Event handlers (`onClick`) no botao

### 7. Ano Dinamico no Copyright

```tsx
{new Date().getFullYear()}
```

Renderizado no cliente, sempre mostra o ano atual sem necessidade de atualizacao manual.

---

## Mapa de Arquivos

```
src/
  app/
    layout.tsx                 # Root layout (fontes, metadata)
    globals.css                # Variaveis CSS, @font-face, animacoes, @theme
    links/
      page.tsx                 # Pagina de links (este documento)
  components/
    HeroSection.tsx            # Componente hero com imagem de fundo
    ui/
      card.tsx                 # Componentes Card/CardContent (shadcn/ui)
  lib/
    utils.ts                   # Funcao cn() (clsx + tailwind-merge)

public/
  background-link.jpg          # Imagem de fundo hero (desktop)
  background-link-mobile.jpg   # Imagem de fundo hero (mobile)
  fonts/
    ravelle-regular.otf        # Fonte Ravelle regular
    ravelle-bold.otf           # Fonte Ravelle bold
    ravelle-thin.otf           # Fonte Ravelle thin
    ravelle-light.otf          # Fonte Ravelle light
    ravelle-medium.otf         # Fonte Ravelle medium
    ravelle-semibold.otf       # Fonte Ravelle semibold
```
