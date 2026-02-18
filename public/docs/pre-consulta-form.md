# Documentacao Tecnica - Formulario Pre-Consulta (`/pre-consulta`)

## Sumario

- [Visao Geral](#visao-geral)
- [Arquitetura Geral](#arquitetura-geral)
- [IMPORTANTE - Configuracao via JSON](#importante---configuracao-via-json)
- [Definicao dos Steps (`steps.ts`)](#definicao-dos-steps-stepsts)
- [Schema de Validacao (`formSchema.ts`)](#schema-de-validacao-formschemats)
- [Pagina Principal (`page.tsx`)](#pagina-principal-pagetsx)
- [Componentes](#componentes)
  - [StepContainer](#stepcontainer)
  - [FormStepRenderer](#formsteprenderer)
  - [StepNavigation](#stepnavigation)
  - [TypeformInput](#typeforminput)
  - [TypeformTextarea](#typeformtextarea)
  - [RadioGroup e RadioItem](#radiogroup-e-radioitem)
- [Persistencia Local (localStorage)](#persistencia-local-localstorage)
- [Fluxo de Submissao](#fluxo-de-submissao)
- [Sistema de Cores e Estilizacao](#sistema-de-cores-e-estilizacao)
- [Responsividade](#responsividade)
- [Acessibilidade e UX](#acessibilidade-e-ux)
- [Decisoes Tecnicas](#decisoes-tecnicas)
- [Mapa de Arquivos](#mapa-de-arquivos)

---

## Visao Geral

O formulario de pre-consulta (`/pre-consulta`) e um formulario multi-step estilo Typeform para coleta de dados de pacientes antes da consulta nutricional. Ele guia o usuario atraves de perguntas sequenciais com navegacao step-by-step, validacao em tempo real e persistencia automatica dos dados.

**Rota:** `/pre-consulta`
**Runtime:** Client Component (`"use client"`)
**Layout:** Proprio (`src/app/pre-consulta/layout.tsx`) - define `themeColor` e renderiza children diretamente.

---

## Arquitetura Geral

```
                    +-----------------+
                    |   steps.ts      |  <-- Configuracao dos steps (FONTE DE VERDADE)
                    +-----------------+
                            |
                            v
+----------------+  +-----------------+  +------------------+
| formSchema.ts  |  |   page.tsx      |  |   storage.ts     |
| (Zod schema)   |->| (Orquestrador)  |->| (localStorage)   |
+----------------+  +-----------------+  +------------------+
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
     +---------------+ +-----------+ +--------------+
     |FormStepRenderer| |StepNav   | |StepContainer |
     +---------------+ +-----------+ +--------------+
              |
     +--------+--------+--------+
     |        |        |        |
     v        v        v        v
  Input   Textarea  Radio    Radio
  (text)  (textarea) (single) (multiple)
```

O fluxo funciona assim:
1. `steps.ts` define **toda a configuracao** dos steps (perguntas, tipos, opcoes, condicoes)
2. `formSchema.ts` define as regras de validacao com Zod
3. `page.tsx` orquestra tudo: gerencia o estado, step atual, validacao e submissao
4. `FormStepRenderer` renderiza o componente correto baseado no `type` do step
5. `storage.ts` persiste dados e step atual no localStorage
6. `submit.ts` + `leadService.ts` + `api/lead/route.ts` enviam os dados para o webhook

---

## IMPORTANTE - Configuracao via JSON

**A criacao dos steps e toda a definicao do formulario deve ser orientada por um arquivo de configuracao central.**

O arquivo `src/lib/steps.ts` atua como o **arquivo de configuracao unico** (fonte de verdade) para todo o formulario. Toda a estrutura do formulario - perguntas, tipos de campo, opcoes de resposta, condicoes de visibilidade, campos opcionais e vinculacao de campos "Outro" - e declarada nesse arquivo como um array exportado `steps: FormStep[]`.

### Como a configuracao funciona

O array `steps` e um **JSON-like config** (um array de objetos TypeScript) que controla:

| Propriedade | Tipo | Descricao |
|-------------|------|-----------|
| `id` | `string` | Identificador unico do step (usado para persistencia) |
| `type` | `"text" \| "number" \| "textarea" \| "radio"` | Tipo de input que sera renderizado |
| `field` | `keyof FormData` | Campo do formulario que este step controla |
| `question` | `string \| (data) => string` | Texto da pergunta (pode ser dinamico usando dados ja preenchidos) |
| `placeholder` | `string?` | Placeholder do input |
| `options` | `StepOption[]?` | Opcoes para campos do tipo `radio` |
| `multiple` | `boolean?` | Permite multipla selecao em campos `radio` |
| `optional` | `boolean?` | Step pode ser pulado sem preenchimento |
| `showWhen` | `(data) => boolean?` | Condicao para exibir o step (steps condicionais) |
| `otherField` | `keyof FormData?` | Campo de texto livre vinculado a opcao "Outro" |
| `otherOptionValue` | `string?` | Valor da opcao que ativa o campo "Outro" |

### Como adicionar um novo step

Para adicionar uma nova pergunta ao formulario, basta adicionar um novo objeto ao array `steps` em `src/lib/steps.ts`:

```typescript
{
  id: "novaEtapa",
  type: "radio",
  field: "novaEtapa",
  question: (data) => `${data.nome || ""}, nova pergunta aqui?`,
  options: [
    { value: "Opcao 1", label: "Opcao 1" },
    { value: "Opcao 2", label: "Opcao 2" },
  ],
}
```

E adicionar o campo correspondente ao `formSchema.ts`:

```typescript
novaEtapa: z.string().min(1, "Campo obrigatorio"),
```

**Nenhum componente de UI precisa ser alterado.** O `FormStepRenderer` renderiza automaticamente o componente correto baseado no `type`.

### Steps condicionais

Steps condicionais usam a propriedade `showWhen` para aparecer apenas quando uma condicao e atendida:

```typescript
{
  id: "quaisDoencas",
  // ... outras propriedades
  showWhen: (data) => data.possuiDoenca === "Sim",
}
```

A funcao `getVisibleSteps(data)` filtra o array `steps` em tempo real, removendo steps cujo `showWhen` retorna `false`. Isso garante que a barra de progresso, a navegacao e os indices se ajustam automaticamente.

### Perguntas dinamicas

A propriedade `question` aceita uma funcao que recebe os dados ja preenchidos e retorna a pergunta personalizada:

```typescript
question: (data) => `${data.nome || ""}, qual a sua idade?`
// Resultado: "Maria, qual a sua idade?"
```

---

## Definicao dos Steps (`steps.ts`)

**Arquivo:** `src/lib/steps.ts`

### Interface FormStep

```typescript
export type StepType = "text" | "number" | "textarea" | "radio"

export interface StepOption {
  value: string
  label: string
}

export interface FormStep {
  id: string
  type: StepType
  field: keyof FormData
  question: string | ((data: Partial<FormData>) => string)
  placeholder?: string
  options?: StepOption[]
  multiple?: boolean
  optional?: boolean
  showWhen?: (data: Partial<FormData>) => boolean
  otherField?: keyof FormData
  otherOptionValue?: string
}
```

### Catalogo Completo de Steps (23 steps)

| # | ID | Tipo | Campo | Pergunta | Condicional? | Multiplo? | Opcional? |
|---|-----|------|-------|----------|-------------|-----------|-----------|
| 1 | `nome` | text | `nome` | Qual e o seu nome e sobrenome? | Nao | - | Nao |
| 2 | `idade` | number | `idade` | {nome}, qual a sua idade? | Nao | - | Nao |
| 3 | `sexo` | radio | `sexo` | {nome}, qual o seu sexo? | Nao | Nao | Nao |
| 4 | `ocupacaoProfissional` | text | `ocupacaoProfissional` | {nome}, qual a sua ocupacao profissional? | Nao | - | Nao |
| 5 | `acompanhamentoNutricionalAnterior` | radio | `acompanhamentoNutricionalAnterior` | {nome}, voce ja fez acompanhamento nutricional anteriormente? | Nao | Nao | Nao |
| 6 | `objetivo` | radio | `objetivo` | {nome}, o que voce deseja alcancar...? | Nao | Sim | Nao |
| 7 | `possuiDoenca` | radio | `possuiDoenca` | {nome}, voce possui alguma doenca diagnosticada? | Nao | Nao | Nao |
| 8 | `quaisDoencas` | radio | `quaisDoencas` | Quais doencas? | `possuiDoenca === "Sim"` | Sim | Sim |
| 9 | `historicoDoencaFamilia` | radio | `historicoDoencaFamilia` | {nome}, possui historico de doenca na familia? | Nao | Nao | Nao |
| 10 | `historicoDoencaFamiliaQuais` | textarea | `historicoDoencaFamiliaQuais` | Qual(is) doenca(s)? | `historicoDoencaFamilia === "Sim"` | - | Sim |
| 11 | `alergiaIntolerancia` | radio | `alergiaIntolerancia` | {nome}, voce apresenta alergia ou intolerancia? | Nao | Nao | Nao |
| 12 | `alergiaIntoleranciaQuais` | textarea | `alergiaIntoleranciaQuais` | Qual(is)? | `alergiaIntolerancia === "Sim"` | - | Sim |
| 13 | `usoSuplemento` | radio | `usoSuplemento` | {nome}, voce faz uso de suplemento? | Nao | Nao | Nao |
| 14 | `usoSuplementoQuais` | textarea | `usoSuplementoQuais` | Qual(is)? | `usoSuplemento === "Sim"` | - | Sim |
| 15 | `usoMedicamentoContinuo` | radio | `usoMedicamentoContinuo` | {nome}, voce faz uso de medicamento continuo? | Nao | Nao | Nao |
| 16 | `usoMedicamentoContinuoQuais` | textarea | `usoMedicamentoContinuoQuais` | Qual(is)? | `usoMedicamentoContinuo === "Sim"` | - | Sim |
| 17 | `praticaAtividadeFisica` | radio | `praticaAtividadeFisica` | {nome}, voce pratica atividade fisica? | Nao | Nao | Nao |
| 18 | `tipoAtividadeFisica` | radio | `tipoAtividadeFisica` | Qual tipo? | `praticaAtividadeFisica === "Sim"` | Sim | Sim |
| 19 | `frequenciaAtividadeFisica` | radio | `frequenciaAtividadeFisica` | Com que frequencia semanal? | `praticaAtividadeFisica === "Sim"` | Nao | Sim |
| 20 | `examesLaboratoriais` | radio | `examesLaboratoriais` | {nome}, voce realizou exames nos ultimos 3 meses? | Nao | Nao | Nao |
| 21 | `ingestaoHidrica` | radio | `ingestaoHidrica` | {nome}, quanto de agua voce consome por dia? | Nao | Nao | Nao |
| 22 | `frequenciaIntestinal` | radio | `frequenciaIntestinal` | {nome}, com que frequencia seu intestino funciona? | Nao | Nao | Nao |
| 23 | `consistenciaFezes` | radio | `consistenciaFezes` | Consistencia das fezes? | Nao | Nao | Nao |

### Padrao de Ramificacao (Condicional)

O formulario implementa um padrao de **ramificacao pai-filho**:

```
possuiDoenca? ──[Sim]──> quaisDoencas (multipla selecao, opcional)
              ──[Nao]──> (pula para historicoDoencaFamilia)

historicoDoencaFamilia? ──[Sim]──> historicoDoencaFamiliaQuais (textarea)
                        ──[Nao]──> (pula para alergiaIntolerancia)

alergiaIntolerancia? ──[Sim]──> alergiaIntoleranciaQuais (textarea)
                     ──[Nao]──> (pula para usoSuplemento)

usoSuplemento? ──[Sim]──> usoSuplementoQuais (textarea)
               ──[Nao]──> (pula para usoMedicamentoContinuo)

usoMedicamentoContinuo? ──[Sim]──> usoMedicamentoContinuoQuais (textarea)
                        ──[Nao]──> (pula para praticaAtividadeFisica)

praticaAtividadeFisica? ──[Sim]──> tipoAtividadeFisica (multipla selecao)
                        |          frequenciaAtividadeFisica (selecao unica)
                        ──[Nao]──> (pula para examesLaboratoriais)
```

### Padrao "Outro" (Campo de Texto Livre)

Tres steps usam o padrao de campo "Outro":

| Step | `otherField` | `otherOptionValue` |
|------|--------------|--------------------|
| `objetivo` | `objetivoOutro` | `"Outro"` |
| `quaisDoencas` | `doencasOutras` | `"Outra(s)"` |
| `tipoAtividadeFisica` | `tipoAtividadeFisicaOutro` | `"Outro"` |

Quando o usuario seleciona a opcao "Outro"/"Outra(s)", um campo `TypeformTextarea` aparece inline abaixo das opcoes para que o usuario descreva a resposta.

---

## Schema de Validacao (`formSchema.ts`)

**Arquivo:** `src/schemas/formSchema.ts`

### Estrutura

O schema Zod define 10 secoes tematicas:

| Secao | Campos | Tipo de Validacao |
|-------|--------|------------------|
| Identificacao | `nome`, `idade`, `sexo`, `ocupacaoProfissional` | `string.min(1)`, `number.int.positive` |
| Historico nutricional | `acompanhamentoNutricionalAnterior` | `string.min(1)` |
| Objetivo | `objetivo`, `objetivoOutro` | `array.min(1)`, `string.optional` |
| Historico de saude | `possuiDoenca`, `quaisDoencas`, `doencasOutras`, `historicoDoencaFamilia`, `historicoDoencaFamiliaQuais` | `string.min(1)`, `array.optional`, `string.optional` |
| Alergias | `alergiaIntolerancia`, `alergiaIntoleranciaQuais` | `string.min(1)`, `string.optional` |
| Suplementos | `usoSuplemento`, `usoSuplementoQuais` | `string.min(1)`, `string.optional` |
| Medicamentos | `usoMedicamentoContinuo`, `usoMedicamentoContinuoQuais` | `string.min(1)`, `string.optional` |
| Atividade fisica | `praticaAtividadeFisica`, `tipoAtividadeFisica`, `tipoAtividadeFisicaOutro`, `frequenciaAtividadeFisica` | `string.min(1)`, `array.optional`, `string.optional` |
| Exames | `examesLaboratoriais` | `string.min(1)` |
| Habitos | `ingestaoHidrica`, `frequenciaIntestinal`, `consistenciaFezes` | `string.min(1)` |

### Refinamentos Cross-Field

O schema possui 3 regras `.refine()` que validam dependencias entre campos:

```typescript
// 1. Se objetivo inclui "Outro", objetivoOutro e obrigatorio
.refine(data => {
  if (data.objetivo?.includes("Outro")) {
    return data.objetivoOutro?.trim().length > 0
  }
  return true
}, { path: ["objetivoOutro"] })

// 2. Se quaisDoencas inclui "Outra(s)", doencasOutras e obrigatorio
.refine(data => {
  if (data.quaisDoencas?.includes("Outra(s)")) {
    return data.doencasOutras?.trim().length > 0
  }
  return true
}, { path: ["doencasOutras"] })

// 3. Se tipoAtividadeFisica inclui "Outro", tipoAtividadeFisicaOutro e obrigatorio
.refine(data => {
  if (data.tipoAtividadeFisica?.includes("Outro")) {
    return data.tipoAtividadeFisicaOutro?.trim().length > 0
  }
  return true
}, { path: ["tipoAtividadeFisicaOutro"] })
```

### Tipo Inferido

```typescript
export type FormData = z.infer<typeof formSchema>
```

O tipo `FormData` e inferido automaticamente pelo Zod e utilizado em todo o projeto como tipo canonico dos dados do formulario.

---

## Pagina Principal (`page.tsx`)

**Arquivo:** `src/app/pre-consulta/page.tsx`

### Estados

| Estado | Tipo | Descricao |
|--------|------|-----------|
| `showWelcome` | `boolean` | Controla exibicao da tela de boas-vindas |
| `currentStepIndex` | `number` | Indice do step atual nos steps visiveis |
| `isSubmitting` | `boolean` | Flag de envio em andamento |
| `submitSuccess` | `boolean` | Flag de envio concluido com sucesso |

### React Hook Form

O formulario usa `react-hook-form` com `zodResolver`:

```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
  watch,
  setValue,
  trigger,
} = useForm<FormData>({
  resolver: zodResolver(formSchema),
  mode: "onChange",   // Validacao a cada mudanca
  defaultValues: defaultValues as FormData,
})
```

- `mode: "onChange"` - valida campos em tempo real conforme o usuario digita
- `watch()` - observa todos os campos para reatividade (steps condicionais, persistencia)
- `trigger()` - dispara validacao manual antes de avancar
- `setValue()` - define valores programaticamente (restauracao do localStorage, selecao de radio)

### Fluxo de Steps Visiveis

```typescript
function getVisibleSteps(data: Partial<FormData>): FormStep[] {
  return steps.filter((step) => !step.showWhen || step.showWhen(data))
}

const visibleSteps = useMemo(() => getVisibleSteps(formValues), [formValues])
```

O `useMemo` recalcula os steps visiveis a cada mudanca nos dados. Isso permite que:
- A barra de progresso reflita o numero real de steps
- A navegacao se ajuste quando steps condicionais aparecem/desaparecem
- O indice atual seja corrigido se um step condicional some (`useEffect` de clamping)

### Telas do Formulario

O formulario possui 3 estados de tela:

#### 1. Tela de Boas-Vindas (`showWelcome === true`)

```
+------------------------------------+
|                                    |
|   "Formulario pre consulta"        |   <- Titulo com gradient text
|                                    |
|   "Preencha o questionario..."     |   <- Descricao
|                                    |
|   [      Iniciar      ]            |   <- Botao com gradiente
|                                    |
+------------------------------------+
```

- Titulo usa gradient text (`--gradient-hero-text` + `backgroundClip: text`)
- Botao "Iniciar" usa `--gradient-button-desktop`
- Se ja existem dados salvos no localStorage, esta tela e pulada automaticamente

#### 2. Step do Formulario (estado principal)

```
+------------------------------------+
| ████████░░░░░░░░░░░░  (progresso)  |   <- Barra fixa no topo
|                                    |
| 3→                                 |   <- Numero do step
|                                    |
|   {nome}, qual o seu sexo?         |   <- Pergunta (dinamica)
|   (opcional)                       |   <- Label se step opcional
|                                    |
|   [A] Feminino                     |   <- Opcoes radio
|   [B] Masculino          ✓        |   <- Item selecionado
|                                    |
|   [Voltar] [OK]                    |   <- Navegacao (desktop)
|   carrega em Enter →               |   <- Hint (apenas step 1)
|                                    |
+------------------------------------+
| [←] [         OK          ]       |   <- Navegacao (mobile, fixed bottom)
+------------------------------------+
```

#### 3. Tela de Sucesso (`submitSuccess === true`)

```
+------------------------------------+
|                                    |
|   "Pre-consulta enviada            |
|    com sucesso!"                   |
|                                    |
|   "Obrigada por preencher..."      |
|                                    |
+------------------------------------+
```

### Logica de Navegacao (handleNext)

```
handleNext()
  |
  +-- trigger(currentStep.field)          // Valida campo atual
  |
  +-- Se tem otherField selecionado:
  |     trigger(otherField)               // Valida campo "Outro" tambem
  |
  +-- Se radio multiple obrigatorio:
  |     Verifica array.length > 0
  |
  +-- Se step opcional e invalido:
  |     fieldValid = true                 // Permite pular
  |
  +-- Se valido E nao e ultimo step:
  |     currentStepIndex + 1              // Avanca
  |
  +-- Se valido E e ultimo step:
        handleSubmit(onSubmit)()          // Submete
```

### Auto-avanco em Radio Simples

Quando o usuario seleciona uma opcao em um radio **single select** (nao multiple), o formulario avanca automaticamente apos 300ms:

```typescript
if (onItemSelect) {
  setTimeout(() => {
    onItemSelect(val)
  }, 300) // Delay para mostrar animacao de selecao
}
```

Isso imita o comportamento do Typeform original.

### Navegacao por Teclado (Enter)

O formulario escuta `keydown` globalmente e avanca ao pressionar Enter:

```typescript
useEffect(() => {
  const handleKeyPress = async (e: KeyboardEvent) => {
    if (e.key === "Enter" && isCurrentFieldValid && !isSubmitting) {
      e.preventDefault()
      // ... mesma logica do handleNext
    }
  }
  window.addEventListener("keydown", handleKeyPress)
  return () => window.removeEventListener("keydown", handleKeyPress)
}, [/* dependencies */])
```

### Barra de Progresso

```typescript
const progressPercentage =
  visibleSteps.length > 0
    ? ((currentStepIndex + 1) / visibleSteps.length) * 100
    : 0
```

```tsx
<div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
  <div
    className="h-full bg-form-progress transition-all duration-300"
    style={{ width: `${progressPercentage}%` }}
  />
</div>
```

- Fixa no topo da tela (`fixed top-0`)
- Altura de 4px (`h-1`)
- Transicao suave de 300ms
- Cor: `bg-form-progress` (mapeado para `--color-text-primary` = `#261f1b`)

---

## Componentes

### StepContainer

**Arquivo:** `src/components/StepContainer.tsx`

Container wrapper que centraliza o conteudo do formulario:

```tsx
<div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-4 bg-form-background">
  <div className="w-full max-w-3xl lg:max-w-xl">{children}</div>
</div>
```

- Tela cheia (`min-h-screen`)
- Centralizado vertical e horizontalmente (`flex items-center justify-center`)
- Background: `bg-form-background` -> `--color-background-form` -> `#ecd7c3`
- Largura maxima: `max-w-3xl` (768px) em mobile/tablet, `max-w-xl` (576px) em desktop

### FormStepRenderer

**Arquivo:** `src/components/FormStepRenderer.tsx`

Componente que renderiza o input correto baseado no `step.type` via `switch`:

```
step.type === "text"     ->  TypeformInput (type="text")
step.type === "number"   ->  TypeformInput (type="number")
step.type === "textarea" ->  TypeformTextarea
step.type === "radio"    ->  RadioGroup + RadioItem[]
```

#### Props

```typescript
interface FormStepRendererProps {
  step: FormStep                                        // Config do step
  register: UseFormRegister<FormData>                   // register do react-hook-form
  errors: FieldErrors<FormData>                         // Erros de validacao
  value: any                                            // Valor atual do campo
  onChange: (value: any) => void                        // Callback de mudanca
  onItemSelect?: (value: string) => void                // Callback de auto-avanco (radio single)
  formValues?: Partial<FormData>                        // Todos os valores (para campo "Outro")
  onOtherFieldChange?: (field: keyof FormData, value: string) => void  // Mudanca no campo "Outro"
}
```

#### Logica Radio (Single vs Multiple)

**Single select:** Selecionar uma opcao substitui o valor anterior e dispara auto-avanco.
**Multiple select:** Selecionar uma opcao faz toggle no array (adiciona se nao existe, remove se existe). Nao dispara auto-avanco.

```typescript
if (isMultiple) {
  const newValues = currentValues.includes(val)
    ? currentValues.filter(v => v !== val)   // Remove
    : [...currentValues, val]                 // Adiciona
  onChange(newValues)
} else {
  onChange(val)
  setTimeout(() => onItemSelect(val), 300)    // Auto-avanco
}
```

#### Letras nas Opcoes

Cada opcao recebe uma letra sequencial (A, B, C, D...):

```typescript
const letters = ["A", "B", "C", "D", "E", "F", "G", "H"]
// ...
<RadioItem letter={letters[index]} />
```

### StepNavigation

**Arquivo:** `src/components/StepNavigation.tsx`

Componente de navegacao com **duas versoes**: mobile e desktop.

#### Props

```typescript
interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  isNextDisabled: boolean
  isSubmitting?: boolean
}
```

#### Mobile (< 640px)

```
+--------------------------------------------+
| [←]  [           OK / Enviar            ]  |   <- Fixed bottom, full width
+--------------------------------------------+
```

- `fixed bottom-0` com `shadow-lg`
- Botao "Voltar" e um icone `ChevronLeft` compacto
- Botao principal ocupa o espaco restante (`flex-1`)
- Background do botao: `--gradient-button-mobile`
- Border radius: `rounded-xl`

#### Desktop (>= 640px)

```
[Voltar] [OK / Enviar]  carrega em Enter →
```

- Posicionado inline abaixo do conteudo
- Botao "Voltar" com borda (`border-2 border-form-item-border`)
- Botao principal com `--gradient-button-desktop`
- Hint "carrega em Enter" com icone `ArrowRight` (apenas no step 0)
- Border radius: `rounded-xl lg:rounded-lg`

#### Estados dos Botoes

| Estado | Botao Voltar | Botao Avancar |
|--------|-------------|---------------|
| Step 0 | Oculto | "OK" |
| Step intermediario | Visivel | "OK" |
| Ultimo step | Visivel | "Enviar" |
| Enviando | Desabilitado | "Enviando..." |
| Campo invalido | Normal | Desabilitado (`bg-gray-400`) |

### TypeformInput

**Arquivo:** `src/components/ui/typeform-input.tsx`

Input minimalista estilo Typeform com apenas borda inferior:

```tsx
<input
  className="w-full bg-transparent border-0 border-b-2 px-0 py-2 sm:py-3 lg:py-2
    text-base sm:text-lg lg:text-base focus:outline-none focus:ring-0
    transition-all duration-200"
/>
```

- Sem background, sem bordas laterais
- Apenas `border-b-2` (borda inferior)
- Sem focus ring (`focus:ring-0`)
- Cor da borda: `border-form-border` (normal) ou `border-red-500` (erro)
- Para `type="number"`: remove spinners nativos com `[appearance:textfield]`

### TypeformTextarea

**Arquivo:** `src/components/ui/typeform-textarea.tsx`

Mesma estetica do TypeformInput mas para texto multi-linha:

```tsx
<textarea
  className="w-full bg-transparent border-0 border-b-2 px-0 py-2 sm:py-3 lg:py-2
    text-base sm:text-lg lg:text-base focus:outline-none focus:ring-0
    resize-none transition-all duration-200"
/>
```

- `resize-none` - impede redimensionamento manual

### RadioGroup e RadioItem

**Arquivo:** `src/components/ui/radio-group.tsx`

#### RadioGroup

Container simples com grid layout:

```tsx
<div className="grid gap-2 sm:gap-3 lg:gap-2" />
```

#### RadioItem

Item de selecao customizado com visual rico:

```
+-----------------------------------------------+
| [A]  Label da opcao                       [✓] |
+-----------------------------------------------+
```

**Estrutura:**
- Container `div` com `role` implicito de item clicavel
- Circulo com letra (A, B, C...)
- Label do texto
- Icone `Check` do lucide-react (quando selecionado)

**Estilizacao por estado:**

| Propriedade | Nao selecionado | Selecionado |
|-------------|----------------|-------------|
| Background | `--gradient-radio-unchecked` (`#f6e4d4` -> `#f0dcc7`) | `--gradient-radio-checked` (`#dfc5a8` -> `#d4b899`) |
| Borda | `border-form-item-border` | `border-form-item-border` |
| Circulo bg | `transparent` | `--gradient-radio-circle` (`#43361a` -> `#cca667`) |
| Circulo cor | `--color-gold-darkest` (`#43361a`) | `--color-text-white` (`#ffffff`) |
| Circulo borda | `--color-gold-darkest` | `--color-gold-medium` |
| Check icon | Oculto | `--color-gold-medium` (`#cca667`) |

**Animacao de selecao:**
- `pulse` de 300ms no container ao selecionar
- `scaleUp` de 300ms no circulo ao selecionar

```typescript
const [isAnimating, setIsAnimating] = React.useState(false)
React.useEffect(() => {
  if (checked) {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 300)
    return () => clearTimeout(timer)
  }
}, [checked])
```

---

## Persistencia Local (localStorage)

**Arquivo:** `src/lib/storage.ts`

### Chaves

| Chave | Tipo | Conteudo |
|-------|------|---------|
| `pre-consulta-form-data` | `JSON (Partial<FormData>)` | Todos os dados preenchidos |
| `pre-consulta-current-step` | `string (number)` | Indice numerico do step atual |
| `pre-consulta-current-step-id` | `string` | ID do step atual (ex: `"objetivo"`) |

### Funcoes

| Funcao | Descricao |
|--------|-----------|
| `saveFormData(data)` | Salva dados do formulario |
| `loadFormData()` | Carrega dados salvos (ou `null`) |
| `saveCurrentStep(index)` | Salva indice do step |
| `loadCurrentStep()` | Carrega indice (ou `0`) |
| `saveCurrentStepId(id)` | Salva ID do step |
| `loadCurrentStepId()` | Carrega ID (ou `null`) |
| `clearFormData()` | Remove todas as 3 chaves |

### Protecao SSR

Todas as funcoes verificam `typeof window === "undefined"` antes de acessar `localStorage`, evitando erros durante renderizacao no servidor.

### Fluxo de Persistencia

1. **Salvar dados:** `useEffect` com `watch()` subscription salva a cada mudanca de campo
2. **Salvar step:** `useEffect` salva indice e ID a cada mudanca de step
3. **Restaurar ao abrir:** `useEffect` inicial carrega dados e restaura step por ID
4. **Limpar ao enviar:** `clearFormData()` remove tudo apos submissao bem-sucedida

### Restauracao por ID vs Indice

A restauracao prioriza o **ID do step** (`loadCurrentStepId()`), nao o indice. Isso e importante porque:
- Steps condicionais podem alterar a lista de steps visiveis
- O indice `3` pode corresponder a perguntas diferentes dependendo das respostas
- O ID (`"objetivo"`) e estavel e nao depende da ordem filtrada

Fallback: se nao houver ID salvo, usa o indice numerico com clamping ao tamanho da lista visivel.

---

## Fluxo de Submissao

### Cadeia de Chamadas

```
page.tsx: onSubmit(data)
  |
  +-> submit.ts: submitFormData(data)
        |
        +-> leadService.ts: sendLead(data)
              |
              +-> normalizePayload(data)     // Converte arrays para strings CSV
              |
              +-> axios.post("/api/lead", payload)
                    |
                    +-> api/lead/route.ts: POST handler
                          |
                          +-> axios.post(N8N_WEBHOOK_URL, body)
                                |
                                +-> n8n webhook externo
```

### Normalizacao do Payload

Antes de enviar, `normalizePayload` converte arrays em strings separadas por virgula:

```typescript
function normalizePayload(data: FormData): LeadPayload {
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      payload[key] = value.length > 0 ? value.join(", ") : undefined
    }
  }
  payload.submittedAt = new Date().toISOString()
  return payload
}
```

Exemplo:
```
objetivo: ["Emagrecimento", "Ganho de massa muscular"]
-> objetivo: "Emagrecimento, Ganho de massa muscular"
```

### API Route (Proxy)

**Arquivo:** `src/app/api/lead/route.ts`

A API route atua como **proxy** entre o frontend e o webhook externo do n8n:

```
Frontend -> /api/lead (Next.js API Route) -> n8n webhook externo
```

Isso evita expor a URL do webhook diretamente no frontend (CORS e seguranca).

**URL do webhook:** `https://n8n-01-webhook.kemosoft.com.br/webhook/pre-consulta`

### Tratamento de Erros

O leadService trata erros de axios com mensagens especificas:

- **404:** "URL do webhook nao encontrada. Verifique a URL no n8n"
- **HTML no corpo:** Substitui por mensagem legivel
- **Erros genericos:** Extrai `status` e `details` do response

No frontend (`page.tsx`), erros resultam em `alert()` e `isSubmitting = false` (permite reenvio).

---

## Sistema de Cores e Estilizacao

### Variaveis CSS Usadas

| Variavel | Valor | Uso |
|----------|-------|-----|
| `--form-background` / `--color-background-form` | `#ecd7c3` | Fundo do StepContainer e navegacao |
| `--form-text` / `--color-text-primary` | `#261f1b` | Texto das perguntas |
| `--form-border` / `--color-text-primary` | `#261f1b` | Borda inferior dos inputs |
| `--form-progress` / `--color-text-primary` | `#261f1b` | Barra de progresso |
| `--form-item-border` / `--color-beige-border` | `#e4cebd` | Borda dos RadioItems e botao Voltar |
| `--gradient-hero-text` | `#80652d -> #c8a364` | Titulo da tela de boas-vindas |
| `--gradient-button-mobile` | `#7e632b -> #cca667` | Botao OK/Enviar em mobile |
| `--gradient-button-desktop` | `#43361a -> #cca667` | Botao OK/Enviar em desktop |
| `--gradient-radio-checked` | `#dfc5a8 -> #d4b899` | Background do RadioItem selecionado |
| `--gradient-radio-unchecked` | `#f6e4d4 -> #f0dcc7` | Background do RadioItem nao selecionado |
| `--gradient-radio-circle` | `#43361a -> #cca667` | Circulo do RadioItem selecionado |
| `--color-text-dark` | `#141414` | Label do RadioItem |
| `--color-text-white` | `#ffffff` | Letra no circulo selecionado |
| `--color-gold-darkest` | `#43361a` | Letra/borda do circulo nao selecionado |
| `--color-gold-medium` | `#cca667` | Icone Check, borda do circulo selecionado |

### Estrategia de Estilizacao

O formulario usa a mesma estrategia da pagina de links:
- **Tailwind utilities** para layout, spacing, responsividade, tipografia
- **CSS custom properties via inline styles** para cores e gradientes
- **Tailwind `@theme inline`** para mapear variaveis semanticas (ex: `bg-form-background`, `text-form-text`, `border-form-border`)

---

## Responsividade

### Breakpoints e Comportamento

O formulario adota uma estrategia **3-tier**:

| Breakpoint | Dispositivo | Caracteristicas |
|------------|-------------|----------------|
| Base (< 640px) | Mobile | Navegacao fixed bottom, inputs maiores, padding generoso |
| `sm` (>= 640px) | Tablet | Navegacao inline, tamanhos intermediarios |
| `lg` (>= 1024px) | Desktop | Layout compacto, tamanhos reduzidos |

### Diferenca de Abordagem: Mobile-First Invertido no `lg`

Nota: o formulario usa um padrao incomum onde `lg` define tamanhos **menores** que `sm`. Isso sugere uma otimizacao para telas de desktop onde o formulario e mais compacto:

```tsx
// Exemplo de escalas
className="text-xl sm:text-2xl lg:text-lg"     // 20px -> 24px -> 18px
className="p-3 sm:p-5 lg:p-3"                   // 12px -> 20px -> 12px
className="rounded-xl sm:rounded-2xl lg:rounded-xl"
```

### Navegacao Responsiva

- **Mobile (< 640px):** Barra fixa no bottom com botoes full-width
- **Desktop (>= 640px):** Botoes inline com hint "carrega em Enter" no primeiro step

---

## Acessibilidade e UX

### Teclado
- **Enter** avanca para o proximo step ou submete
- Listener global via `window.addEventListener("keydown")`
- Hint visual "carrega em Enter" no primeiro step (desktop)

### Auto-Focus
- Inputs de texto e numero recebem `autoFocus` automaticamente ao mudar de step

### Auto-Avanco
- Radio single select avanca automaticamente apos 300ms
- Radio multiple select NAO avanca (usuario precisa clicar OK)

### Validacao em Tempo Real
- `mode: "onChange"` no react-hook-form
- Mensagens de erro aparecem abaixo do input
- Botao "OK" fica desabilitado enquanto campo e invalido
- Steps opcionais permitem avancar com campo vazio

### Persistencia
- Dados sao salvos automaticamente a cada mudanca
- Ao reabrir a pagina, o formulario restaura de onde parou
- Tela de boas-vindas e pulada se ja existem dados salvos

---

## Decisoes Tecnicas

### 1. Formulario Orientado a Configuracao (Data-Driven)

Toda a definicao do formulario vive em `steps.ts` como um array de configuracao. Isso separa completamente a **configuracao** (perguntas, tipos, opcoes) da **logica de renderizacao** (componentes). Para adicionar, remover ou reordenar perguntas, basta editar o array - nenhum componente precisa ser tocado.

### 2. React Hook Form + Zod

A combinacao `react-hook-form` + `zodResolver` foi escolhida por:
- Validacao declarativa e type-safe com Zod
- Performance (re-renders minimizados pelo react-hook-form)
- `mode: "onChange"` para feedback instantaneo
- `trigger()` para validacao manual antes de avancar
- Inferencia de tipo automatica (`FormData = z.infer<typeof formSchema>`)

### 3. Steps Condicionais com `showWhen`

Em vez de um sistema de rotas ou maquina de estados, steps condicionais sao implementados como predicados simples:

```typescript
showWhen: (data) => data.possuiDoenca === "Sim"
```

Vantagens:
- Facil de entender e manter
- A lista de steps visiveis e recalculada automaticamente
- Barra de progresso e navegacao se ajustam em tempo real

### 4. Persistencia por ID (nao por Indice)

A restauracao do step usa o **ID** do step em vez do indice numerico. Isso e mais robusto porque o indice pode mudar quando steps condicionais entram/saem da lista visivel.

### 5. Proxy na API Route

O envio de dados passa por uma API Route do Next.js (`/api/lead`) em vez de chamar o webhook diretamente do frontend. Isso:
- Esconde a URL do webhook externo
- Evita problemas de CORS
- Permite tratamento de erros centralizado no servidor
- Possibilita adicionar rate limiting ou autenticacao no futuro

### 6. Estilo Typeform

O formulario imita a experiencia do Typeform com:
- Uma pergunta por tela (nao formulario longo)
- Auto-avanco em radio single select
- Navegacao por Enter
- Barra de progresso fixa
- Inputs minimalistas (apenas borda inferior)

### 7. Layout Props `lg` Compactos

O breakpoint `lg` define tamanhos menores que `sm`, criando um layout mais denso em desktop. Isso permite que o formulario funcione bem tanto em telas grandes quanto em dispositivos moveis onde telas maiores sao desejadas para toque.

---

## Mapa de Arquivos

```
src/
  app/
    pre-consulta/
      layout.tsx              # Layout (themeColor viewport)
      page.tsx                # Pagina principal (orquestrador)
    api/
      lead/
        route.ts              # API Route proxy para webhook n8n
  components/
    StepContainer.tsx         # Container centralizado
    StepNavigation.tsx        # Botoes Voltar/OK/Enviar (mobile + desktop)
    FormStepRenderer.tsx      # Renderizador por tipo de step
    ui/
      typeform-input.tsx      # Input minimalista (borda inferior)
      typeform-textarea.tsx   # Textarea minimalista (borda inferior)
      radio-group.tsx         # RadioGroup, RadioGroupItem, RadioItem
  schemas/
    formSchema.ts             # Schema Zod + tipo FormData
  lib/
    steps.ts                  # Configuracao dos steps (FONTE DE VERDADE)
    storage.ts                # Utilitarios de localStorage
    submit.ts                 # Funcao de submissao
    services/
      leadService.ts          # Envio via axios + normalizacao de payload
    utils.ts                  # Funcao cn() (clsx + tailwind-merge)
```
