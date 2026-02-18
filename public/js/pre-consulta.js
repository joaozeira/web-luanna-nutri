/**
 * Pre-Consulta Form - Vanilla JS
 * Formulario multi-step estilo Typeform para coleta de dados de pacientes
 */

// ============================================
// CONFIGURACAO DOS STEPS
// ============================================

const steps = [
  {
    id: "nome",
    type: "text",
    field: "nome",
    question: "Qual é o seu nome e sobrenome?",
    placeholder: "Digite seu nome completo...",
  },
  {
    id: "idade",
    type: "number",
    field: "idade",
    question: (data) => `${data.nome || ""}, qual a sua idade?`,
    placeholder: "Digite sua idade...",
  },
  {
    id: "sexo",
    type: "radio",
    field: "sexo",
    question: (data) => `${data.nome || ""}, qual o seu sexo?`,
    options: [
      { value: "Feminino", label: "Feminino" },
      { value: "Masculino", label: "Masculino" },
    ],
  },
  {
    id: "ocupacaoProfissional",
    type: "text",
    field: "ocupacaoProfissional",
    question: (data) =>
      `${data.nome || ""}, qual a sua ocupação profissional?`,
    placeholder: "Digite sua ocupação...",
  },
  {
    id: "acompanhamentoNutricionalAnterior",
    type: "radio",
    field: "acompanhamentoNutricionalAnterior",
    question: (data) =>
      `${data.nome || ""}, você já fez acompanhamento nutricional anteriormente?`,
    options: [
      { value: "Sim", label: "Sim" },
      { value: "Não", label: "Não" },
    ],
  },
  {
    id: "objetivo",
    type: "radio",
    field: "objetivo",
    multiple: true,
    question: (data) =>
      `${data.nome || ""}, o que você deseja alcançar com o acompanhamento nutricional?`,
    options: [
      { value: "Emagrecimento", label: "Emagrecimento" },
      { value: "Ganho de massa muscular", label: "Ganho de massa muscular" },
      { value: "Melhora da saúde", label: "Melhora da saúde" },
      { value: "Reeducação alimentar", label: "Reeducação alimentar" },
      { value: "Performance esportiva", label: "Performance esportiva" },
      { value: "Outro", label: "Outro" },
    ],
    otherField: "objetivoOutro",
    otherOptionValue: "Outro",
  },
  {
    id: "possuiDoenca",
    type: "radio",
    field: "possuiDoenca",
    question: (data) =>
      `${data.nome || ""}, você possui alguma doença diagnosticada?`,
    options: [
      { value: "Sim", label: "Sim" },
      { value: "Não", label: "Não" },
    ],
  },
  {
    id: "quaisDoencas",
    type: "radio",
    field: "quaisDoencas",
    multiple: true,
    optional: true,
    question: "Quais doenças?",
    showWhen: (data) => data.possuiDoenca === "Sim",
    options: [
      { value: "Diabetes", label: "Diabetes" },
      { value: "Hipertensão", label: "Hipertensão" },
      { value: "Colesterol alto", label: "Colesterol alto" },
      { value: "Triglicerídeos alto", label: "Triglicerídeos alto" },
      { value: "Hipotireoidismo", label: "Hipotireoidismo" },
      { value: "Hipertireoidismo", label: "Hipertireoidismo" },
      { value: "Ovário Policístico", label: "Ovário Policístico" },
      { value: "Outra(s)", label: "Outra(s)" },
    ],
    otherField: "doencasOutras",
    otherOptionValue: "Outra(s)",
  },
  {
    id: "historicoDoencaFamilia",
    type: "radio",
    field: "historicoDoencaFamilia",
    question: (data) =>
      `${data.nome || ""}, possui histórico de doença na família?`,
    options: [
      { value: "Sim", label: "Sim" },
      { value: "Não", label: "Não" },
    ],
  },
  {
    id: "historicoDoencaFamiliaQuais",
    type: "textarea",
    field: "historicoDoencaFamiliaQuais",
    optional: true,
    question: "Qual(is) doença(s)?",
    placeholder: "Descreva as doenças...",
    showWhen: (data) => data.historicoDoencaFamilia === "Sim",
  },
  {
    id: "alergiaIntolerancia",
    type: "radio",
    field: "alergiaIntolerancia",
    question: (data) =>
      `${data.nome || ""}, você apresenta alergia ou intolerância alimentar?`,
    options: [
      { value: "Sim", label: "Sim" },
      { value: "Não", label: "Não" },
    ],
  },
  {
    id: "alergiaIntoleranciaQuais",
    type: "textarea",
    field: "alergiaIntoleranciaQuais",
    optional: true,
    question: "Qual(is)?",
    placeholder: "Descreva suas alergias ou intolerâncias...",
    showWhen: (data) => data.alergiaIntolerancia === "Sim",
  },
  {
    id: "usoSuplemento",
    type: "radio",
    field: "usoSuplemento",
    question: (data) =>
      `${data.nome || ""}, você faz uso de suplemento?`,
    options: [
      { value: "Sim", label: "Sim" },
      { value: "Não", label: "Não" },
    ],
  },
  {
    id: "usoSuplementoQuais",
    type: "textarea",
    field: "usoSuplementoQuais",
    optional: true,
    question: "Qual(is)?",
    placeholder: "Descreva os suplementos que utiliza...",
    showWhen: (data) => data.usoSuplemento === "Sim",
  },
  {
    id: "usoMedicamentoContinuo",
    type: "radio",
    field: "usoMedicamentoContinuo",
    question: (data) =>
      `${data.nome || ""}, você faz uso de medicamento contínuo?`,
    options: [
      { value: "Sim", label: "Sim" },
      { value: "Não", label: "Não" },
    ],
  },
  {
    id: "usoMedicamentoContinuoQuais",
    type: "textarea",
    field: "usoMedicamentoContinuoQuais",
    optional: true,
    question: "Qual(is)?",
    placeholder: "Descreva os medicamentos que utiliza...",
    showWhen: (data) => data.usoMedicamentoContinuo === "Sim",
  },
  {
    id: "praticaAtividadeFisica",
    type: "radio",
    field: "praticaAtividadeFisica",
    question: (data) =>
      `${data.nome || ""}, você pratica atividade física?`,
    options: [
      { value: "Sim", label: "Sim" },
      { value: "Não", label: "Não" },
    ],
  },
  {
    id: "tipoAtividadeFisica",
    type: "radio",
    field: "tipoAtividadeFisica",
    multiple: true,
    optional: true,
    question: "Qual tipo?",
    showWhen: (data) => data.praticaAtividadeFisica === "Sim",
    options: [
      { value: "Musculação", label: "Musculação" },
      { value: "Crossfit", label: "Crossfit" },
      { value: "Corrida", label: "Corrida" },
      { value: "Caminhada", label: "Caminhada" },
      { value: "Natação", label: "Natação" },
      { value: "Pilates", label: "Pilates" },
      { value: "Dança", label: "Dança" },
      { value: "Outro", label: "Outro" },
    ],
    otherField: "tipoAtividadeFisicaOutro",
    otherOptionValue: "Outro",
  },
  {
    id: "frequenciaAtividadeFisica",
    type: "radio",
    field: "frequenciaAtividadeFisica",
    optional: true,
    question: "Com que frequência semanal?",
    showWhen: (data) => data.praticaAtividadeFisica === "Sim",
    options: [
      { value: "1-2x", label: "1-2x" },
      { value: "3-4x", label: "3-4x" },
      { value: "5-6x", label: "5-6x" },
      { value: "Todos os dias", label: "Todos os dias" },
    ],
  },
  {
    id: "examesLaboratoriais",
    type: "radio",
    field: "examesLaboratoriais",
    question: (data) =>
      `${data.nome || ""}, você realizou exames laboratoriais nos últimos 3 meses?`,
    options: [
      { value: "Sim", label: "Sim" },
      { value: "Não", label: "Não" },
    ],
  },
  {
    id: "ingestaoHidrica",
    type: "radio",
    field: "ingestaoHidrica",
    question: (data) =>
      `${data.nome || ""}, quanto de água você consome por dia?`,
    options: [
      { value: "Menos de 500ml", label: "Menos de 500ml" },
      { value: "500ml a 1L", label: "500ml a 1L" },
      { value: "1L a 2L", label: "1L a 2L" },
      { value: "Mais de 2L", label: "Mais de 2L" },
    ],
  },
  {
    id: "frequenciaIntestinal",
    type: "radio",
    field: "frequenciaIntestinal",
    question: (data) =>
      `${data.nome || ""}, com que frequência seu intestino funciona?`,
    options: [
      { value: "Todo dia", label: "Todo dia" },
      { value: "Dia sim/dia não", label: "Dia sim/dia não" },
      { value: "A cada 3 dias ou mais", label: "A cada 3 dias ou mais" },
      { value: "Irregular", label: "Irregular" },
    ],
  },
  {
    id: "consistenciaFezes",
    type: "radio",
    field: "consistenciaFezes",
    question: "Consistência das fezes?",
    options: [
      { value: "Ressecadas", label: "Ressecadas" },
      { value: "Normais", label: "Normais" },
      { value: "Amolecidas", label: "Amolecidas" },
      { value: "Líquidas", label: "Líquidas" },
    ],
  },
];

// ============================================
// ESTADO GLOBAL
// ============================================

let formData = {};
let currentStepIndex = 0;
let isSubmitting = false;
let autoAdvanceTimer = null;

// ============================================
// ELEMENTOS DOM
// ============================================

const $ = (id) => document.getElementById(id);

const elements = {};

function cacheElements() {
  elements.welcomeScreen = $("welcome-screen");
  elements.formScreen = $("form-screen");
  elements.successScreen = $("success-screen");
  elements.progressBar = $("progress-bar");
  elements.progressFill = $("progress-fill");
  elements.stepWrapper = $("step-wrapper");
  elements.stepNumber = $("step-number");
  elements.stepQuestion = $("step-question");
  elements.stepOptional = $("step-optional");
  elements.stepSpacer = $("step-spacer");
  elements.stepContent = $("step-content");
  elements.stepError = $("step-error");
  elements.navDesktop = $("nav-desktop");
  elements.btnPrevDesktop = $("btn-prev-desktop");
  elements.btnNextDesktop = $("btn-next-desktop");
  elements.enterHint = $("enter-hint");
  elements.btnPrevMobile = $("btn-prev-mobile");
  elements.btnNextMobile = $("btn-next-mobile");
  elements.btnStart = $("btn-start");
}

// ============================================
// STEPS VISIVEIS
// ============================================

function getVisibleSteps() {
  return steps.filter((step) => !step.showWhen || step.showWhen(formData));
}

function getCurrentStep() {
  const visible = getVisibleSteps();
  return visible[currentStepIndex] || null;
}

// ============================================
// LOCALSTORAGE (limpar dados antigos)
// ============================================

function clearFormStorage() {
  try {
    localStorage.removeItem("pre-consulta-form-data");
    localStorage.removeItem("pre-consulta-current-step");
    localStorage.removeItem("pre-consulta-current-step-id");
  } catch (e) {
    // silently fail
  }
}

// ============================================
// VALIDACAO
// ============================================

function isFieldValid(step) {
  const value = formData[step.field];

  if (step.optional) {
    // Opcional: sempre valido, exceto se "Outro" selecionado sem texto
    if (step.otherField && step.otherOptionValue) {
      const selected = Array.isArray(value) ? value : [value];
      if (selected.includes(step.otherOptionValue)) {
        const otherVal = formData[step.otherField];
        if (!otherVal || !String(otherVal).trim()) return false;
      }
    }
    return true;
  }

  if (step.type === "radio" && step.multiple) {
    if (!Array.isArray(value) || value.length === 0) return false;
  } else if (step.type === "number") {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) return false;
  } else {
    if (!value || !String(value).trim()) return false;
  }

  // Validar campo "Outro" se selecionado
  if (step.otherField && step.otherOptionValue) {
    const selected = Array.isArray(value) ? value : [value];
    if (selected.includes(step.otherOptionValue)) {
      const otherVal = formData[step.otherField];
      if (!otherVal || !String(otherVal).trim()) return false;
    }
  }

  return true;
}

function validateCurrentStep() {
  const step = getCurrentStep();
  if (!step) return true;
  return isFieldValid(step);
}

// ============================================
// RENDERIZACAO
// ============================================

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function getQuestionText(step) {
  if (typeof step.question === "function") {
    return step.question(formData);
  }
  return step.question;
}

function renderStep() {
  const step = getCurrentStep();
  if (!step) return;

  const visible = getVisibleSteps();

  // Numero do step
  elements.stepNumber.textContent = `${currentStepIndex + 1} →`;

  // Pergunta
  elements.stepQuestion.textContent = getQuestionText(step);

  // Label opcional
  if (step.optional) {
    elements.stepOptional.classList.remove("hidden");
    elements.stepSpacer.classList.add("hidden");
  } else {
    elements.stepOptional.classList.add("hidden");
    elements.stepSpacer.classList.remove("hidden");
  }

  // Limpar erro
  elements.stepError.classList.add("hidden");
  elements.stepError.textContent = "";

  // Renderizar conteudo
  let html = "";
  switch (step.type) {
    case "text":
      html = renderTextInput(step);
      break;
    case "number":
      html = renderNumberInput(step);
      break;
    case "textarea":
      html = renderTextarea(step);
      break;
    case "radio":
      html = renderRadio(step);
      break;
  }
  elements.stepContent.innerHTML = html;

  // Animacao
  elements.stepWrapper.classList.remove("step-animate");
  // Force reflow
  void elements.stepWrapper.offsetWidth;
  elements.stepWrapper.classList.add("step-animate");

  // Bind events
  bindStepEvents(step);

  // Auto-focus em inputs
  if (step.type === "text" || step.type === "number" || step.type === "textarea") {
    const input = elements.stepContent.querySelector("input, textarea");
    if (input) {
      setTimeout(() => input.focus(), 50);
    }
  }

  // Atualizar barra de progresso
  updateProgressBar();

  // Atualizar navegacao
  updateNavigation();

}

function renderTextInput(step) {
  const value = formData[step.field] || "";
  const escaped = escapeHtml(value);
  const placeholder = step.placeholder ? `placeholder="${escapeHtml(step.placeholder)}"` : "";
  return `<input type="text" class="form-input" data-field="${step.field}" value="${escaped}" ${placeholder} autocomplete="off" />`;
}

function renderNumberInput(step) {
  const value = formData[step.field] || "";
  const escaped = escapeHtml(String(value));
  const placeholder = step.placeholder ? `placeholder="${escapeHtml(step.placeholder)}"` : "";
  return `<input type="number" class="form-input" data-field="${step.field}" value="${escaped}" ${placeholder} autocomplete="off" inputmode="numeric" />`;
}

function renderTextarea(step) {
  const value = formData[step.field] || "";
  const escaped = escapeHtml(value);
  const placeholder = step.placeholder ? `placeholder="${escapeHtml(step.placeholder)}"` : "";
  return `<textarea class="form-textarea" data-field="${step.field}" ${placeholder} rows="3">${escaped}</textarea>`;
}

function renderRadio(step) {
  const currentValue = formData[step.field];
  const isMultiple = step.multiple;
  let selected = [];

  if (isMultiple) {
    selected = Array.isArray(currentValue) ? currentValue : [];
  } else {
    selected = currentValue ? [currentValue] : [];
  }

  let html = '<div class="grid gap-2 sm:gap-3 lg:gap-2">';

  step.options.forEach((opt, i) => {
    const isChecked = selected.includes(opt.value);
    const checkedClass = isChecked ? "checked" : "";
    const letter = LETTERS[i] || String(i + 1);

    // Check SVG icon
    const checkSvg = `<svg class="check-icon w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`;

    html += `
      <div class="radio-item ${checkedClass}" data-value="${escapeHtml(opt.value)}" data-multiple="${isMultiple ? "true" : "false"}">
        <span class="letter-circle">${letter}</span>
        <span class="radio-label">${escapeHtml(opt.label)}</span>
        ${checkSvg}
      </div>`;
  });

  html += "</div>";

  // Campo "Outro" se necessario
  if (step.otherField && step.otherOptionValue && selected.includes(step.otherOptionValue)) {
    const otherValue = formData[step.otherField] || "";
    html += `
      <div class="mt-3">
        <textarea
          class="form-textarea"
          data-other-field="${step.otherField}"
          placeholder="Descreva aqui..."
          rows="2"
        >${escapeHtml(otherValue)}</textarea>
      </div>`;
  }

  return html;
}

// ============================================
// EVENTOS DOS STEPS
// ============================================

function bindStepEvents(step) {
  // Text/number inputs
  if (step.type === "text" || step.type === "number") {
    const input = elements.stepContent.querySelector("input");
    if (input) {
      input.addEventListener("input", (e) => {
        formData[step.field] = e.target.value;

        updateNavButtons();
      });
    }
  }

  // Textarea
  if (step.type === "textarea") {
    const textarea = elements.stepContent.querySelector("textarea");
    if (textarea) {
      textarea.addEventListener("input", (e) => {
        formData[step.field] = e.target.value;

        updateNavButtons();
      });
    }
  }

  // Radio items
  if (step.type === "radio") {
    const items = elements.stepContent.querySelectorAll(".radio-item");
    items.forEach((item) => {
      item.addEventListener("click", () => {
        const value = item.dataset.value;
        const isMultiple = item.dataset.multiple === "true";
        handleRadioClick(step, value, isMultiple);
      });
    });

    // Other field textarea
    const otherTextarea = elements.stepContent.querySelector("[data-other-field]");
    if (otherTextarea) {
      otherTextarea.addEventListener("input", (e) => {
        formData[step.otherField] = e.target.value;

        updateNavButtons();
      });
    }
  }
}

function handleRadioClick(step, value, isMultiple) {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }

  if (isMultiple) {
    // Toggle in array
    let current = Array.isArray(formData[step.field])
      ? [...formData[step.field]]
      : [];
    const idx = current.indexOf(value);
    if (idx !== -1) {
      current.splice(idx, 1);
    } else {
      current.push(value);
    }
    formData[step.field] = current;

    // Limpar campo "Outro" se desmarcou a opcao
    if (step.otherField && step.otherOptionValue && value === step.otherOptionValue && idx !== -1) {
      delete formData[step.otherField];
    }
  } else {
    formData[step.field] = value;
  }

  saveFormData();

  // Re-render o conteudo do radio para atualizar visual
  elements.stepContent.innerHTML = renderRadio(step);
  bindStepEvents(step);
  updateNavButtons();

  // Auto-avanco em single select (apos 300ms)
  if (!isMultiple) {
    autoAdvanceTimer = setTimeout(() => {
      autoAdvanceTimer = null;
      handleNext();
    }, 300);
  }
}

// ============================================
// NAVEGACAO
// ============================================

function updateProgressBar() {
  const visible = getVisibleSteps();
  const percentage =
    visible.length > 0
      ? ((currentStepIndex + 1) / visible.length) * 100
      : 0;
  elements.progressFill.style.width = `${percentage}%`;
}

function updateNavigation() {
  const visible = getVisibleSteps();
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === visible.length - 1;

  // Botao Voltar
  if (isFirst) {
    elements.btnPrevDesktop.classList.add("hidden");
    elements.btnPrevMobile.classList.add("hidden");
  } else {
    elements.btnPrevDesktop.classList.remove("hidden");
    elements.btnPrevMobile.classList.remove("hidden");
  }

  // Texto do botao avancar
  let nextText = "OK";
  if (isLast) nextText = "Enviar";
  if (isSubmitting) nextText = "Enviando...";

  elements.btnNextDesktop.textContent = nextText;
  elements.btnNextMobile.textContent = nextText;

  // Hint Enter (apenas step 0)
  if (isFirst) {
    elements.enterHint.classList.remove("hidden");
  } else {
    elements.enterHint.classList.add("hidden");
  }

  // Estado dos botoes
  updateNavButtons();
}

function updateNavButtons() {
  const valid = validateCurrentStep();
  const step = getCurrentStep();
  const isValid = valid || (step && step.optional);

  if (isValid && !isSubmitting) {
    elements.btnNextDesktop.style.opacity = "1";
    elements.btnNextDesktop.style.cursor = "pointer";
    elements.btnNextDesktop.disabled = false;
    elements.btnNextMobile.style.opacity = "1";
    elements.btnNextMobile.style.cursor = "pointer";
    elements.btnNextMobile.disabled = false;
  } else {
    elements.btnNextDesktop.style.opacity = "0.5";
    elements.btnNextDesktop.style.cursor = "not-allowed";
    elements.btnNextDesktop.disabled = true;
    elements.btnNextMobile.style.opacity = "0.5";
    elements.btnNextMobile.style.cursor = "not-allowed";
    elements.btnNextMobile.disabled = true;
  }
}

function handleNext() {
  if (isSubmitting) return;

  const step = getCurrentStep();
  if (!step) return;

  const valid = isFieldValid(step);

  // Se nao e valido e nao e opcional, mostrar erro
  if (!valid && !step.optional) {
    showError(step);
    return;
  }

  const visible = getVisibleSteps();
  const isLast = currentStepIndex === visible.length - 1;

  if (isLast) {
    submitForm();
  } else {
    currentStepIndex++;
    // Clampar ao tamanho dos steps visiveis (podem mudar)
    const newVisible = getVisibleSteps();
    if (currentStepIndex >= newVisible.length) {
      currentStepIndex = newVisible.length - 1;
    }
    renderStep();
  }
}

function handlePrevious() {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    renderStep();
  }
}

function showError(step) {
  let msg = "Campo obrigatório";
  if (step.type === "number") {
    msg = "Digite uma idade válida";
  } else if (step.type === "radio" && step.multiple) {
    msg = "Selecione pelo menos uma opção";
  } else if (step.type === "radio") {
    msg = "Selecione uma opção";
  }

  // Verificar se e erro do campo "Outro"
  if (step.otherField && step.otherOptionValue) {
    const value = formData[step.field];
    const selected = Array.isArray(value) ? value : [value];
    if (selected.includes(step.otherOptionValue)) {
      const otherVal = formData[step.otherField];
      if (!otherVal || !String(otherVal).trim()) {
        msg = "Preencha o campo de texto quando selecionar \"Outro\"";
      }
    }
  }

  elements.stepError.textContent = msg;
  elements.stepError.classList.remove("hidden");
}

// ============================================
// TELAS
// ============================================

function showScreen(screen) {
  elements.welcomeScreen.classList.add("hidden");
  elements.formScreen.classList.add("hidden");
  elements.successScreen.classList.add("hidden");

  switch (screen) {
    case "welcome":
      elements.welcomeScreen.classList.remove("hidden");
      elements.progressBar.classList.add("hidden");
      break;
    case "form":
      elements.formScreen.classList.remove("hidden");
      elements.progressBar.classList.remove("hidden");
      renderStep();
      break;
    case "success":
      elements.successScreen.classList.remove("hidden");
      elements.progressBar.classList.add("hidden");
      break;
  }
}

// ============================================
// SUBMISSAO
// ============================================

async function submitForm() {
  isSubmitting = true;
  updateNavigation();

  // Normalizar payload (arrays -> CSV)
  const payload = {};
  for (const [key, value] of Object.entries(formData)) {
    if (Array.isArray(value)) {
      payload[key] = value.length > 0 ? value.join(", ") : "";
    } else {
      payload[key] = value;
    }
  }
  payload.submittedAt = new Date().toISOString();

  try {
    const response = await fetch(
      "https://n8n-01-webhook.kemosoft.com.br/webhook/pre-consulta",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ${response.status}`);
    }

    clearFormStorage();
    showScreen("success");
  } catch (error) {
    alert("Erro ao enviar o formulário. Tente novamente.");
    isSubmitting = false;
    updateNavigation();
  }
}

// ============================================
// UTILIDADES
// ============================================

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================
// INICIALIZACAO
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();

  // Limpar dados antigos e sempre iniciar do zero
  clearFormStorage();
  showScreen("welcome");

  // Botao Iniciar
  elements.btnStart.addEventListener("click", () => {
    showScreen("form");
  });

  // Botoes de navegacao
  elements.btnNextDesktop.addEventListener("click", () => handleNext());
  elements.btnNextMobile.addEventListener("click", () => handleNext());
  elements.btnPrevDesktop.addEventListener("click", () => handlePrevious());
  elements.btnPrevMobile.addEventListener("click", () => handlePrevious());

  // Navegacao por Enter
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (isSubmitting) return;

    // Nao avancar se estiver em textarea
    const active = document.activeElement;
    if (active && active.tagName === "TEXTAREA") return;

    // Verificar se estamos na tela do formulario
    if (elements.formScreen.classList.contains("hidden")) return;

    e.preventDefault();

    const step = getCurrentStep();
    if (!step) return;

    const valid = isFieldValid(step);
    if (valid || step.optional) {
      handleNext();
    }
  });
});
