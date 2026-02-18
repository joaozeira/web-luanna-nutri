document.addEventListener("DOMContentLoaded", () => {
  // Ano dinamico no copyright
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Scroll suave para a secao de links
  const scrollBtn = document.getElementById("scroll-btn");
  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      const linksSection = document.getElementById("links-section");
      linksSection?.scrollIntoView({ behavior: "smooth" });
    });
  }

  // ============================================
  // FORMULARIOS DE CAPTURA - Modais
  // ============================================

  // >>> CONFIGURACAO HUBSPOT <<<
  // Substitua pelos seus valores reais do HubSpot
  const HUBSPOT_PORTAL_ID = "SEU_PORTAL_ID";
  const HUBSPOT_FORM_ID = "SEU_FORM_ID";
  const WHATSAPP_NUMBER = "5584992167070";

  // Captura UTM params e URL completa
  function getTrackingData() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_term: params.get("utm_term") || "",
      utm_content: params.get("utm_content") || "",
      page_url: window.location.href,
      page_referrer: document.referrer || "",
    };
  }

  // Abrir modal
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
    // Focus no primeiro input
    const firstInput = modal.querySelector("input");
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  // Fechar modal
  function closeModal(modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "";
    // Limpar formulario e erros
    const form = modal.querySelector("form");
    if (form) {
      form.reset();
      form.querySelectorAll(".form-input").forEach((input) => {
        input.classList.remove("error");
      });
    }
  }

  // Botoes que abrem modais
  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal(btn.dataset.openModal);
    });
  });

  // Botoes/overlay que fecham modais
  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", () => {
      const modal = el.closest(".fixed");
      if (modal) closeModal(modal);
    });
  });

  // Fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".fixed.flex").forEach((modal) => {
        if (modal.id.startsWith("modal-")) closeModal(modal);
      });
    }
  });

  // Mascara de telefone brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  function applyPhoneMask(value) {
    let digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length === 0) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6)
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  // Aplicar mascara em todos os inputs de telefone
  document.querySelectorAll('input[name="telefone"]').forEach((input) => {
    input.addEventListener("input", (e) => {
      const cursorPos = e.target.selectionStart;
      const prevLen = e.target.value.length;
      e.target.value = applyPhoneMask(e.target.value);
      // Ajustar cursor apos mascara
      const diff = e.target.value.length - prevLen;
      e.target.setSelectionRange(cursorPos + diff, cursorPos + diff);
      // Limpar erro ao digitar
      e.target.classList.remove("error");
    });
  });

  // Limpar erro do nome ao digitar
  document.querySelectorAll('input[name="nome"]').forEach((input) => {
    input.addEventListener("input", () => {
      input.classList.remove("error");
    });
  });

  // Validar campos
  function validateForm(form) {
    let valid = true;
    const nome = form.querySelector('[name="nome"]');
    const telefone = form.querySelector('[name="telefone"]');

    // Validar nome (minimo 2 caracteres)
    if (nome.value.trim().length < 2) {
      nome.classList.add("error");
      valid = false;
    } else {
      nome.classList.remove("error");
    }

    // Validar telefone (10 ou 11 digitos - DDD + numero)
    const phoneDigits = telefone.value.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      telefone.classList.add("error");
      valid = false;
    } else {
      telefone.classList.remove("error");
    }

    return valid;
  }

  // Enviar dados ao HubSpot Forms API
  async function submitToHubSpot(nome, telefone, tipoConsulta) {
    const tracking = getTrackingData();

    const payload = {
      portalId: HUBSPOT_PORTAL_ID,
      formGuid: HUBSPOT_FORM_ID,
      fields: [
        { name: "firstname", value: nome },
        { name: "phone", value: telefone },
        { name: "tipo_consulta", value: tipoConsulta },
        { name: "utm_source", value: tracking.utm_source },
        { name: "utm_medium", value: tracking.utm_medium },
        { name: "utm_campaign", value: tracking.utm_campaign },
        { name: "utm_term", value: tracking.utm_term },
        { name: "utm_content", value: tracking.utm_content },
      ],
      context: {
        pageUri: tracking.page_url,
        pageName: document.title,
      },
    };

    const url = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("HubSpot erro:", response.status, await response.text());
      }
    } catch (err) {
      console.error("HubSpot erro de rede:", err);
    }
  }

  // Redirecionar para WhatsApp
  function redirectToWhatsApp(nome, tipoConsulta) {
    const tipoLabel = tipoConsulta === "presencial" ? "presencial" : "online";
    const message = `Olá! Meu nome é ${nome} e gostaria de agendar uma consulta ${tipoLabel}.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
  }

  // Handler de submit dos formularios
  function handleFormSubmit(formId, tipoConsulta) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!validateForm(form)) return;

      const nome = form.querySelector('[name="nome"]').value.trim();
      const telefone = form.querySelector('[name="telefone"]').value.trim();
      const submitBtn = form.querySelector('button[type="submit"]');

      // Desabilitar botao durante envio
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";

      // Enviar ao HubSpot (nao bloqueia o redirect)
      submitToHubSpot(nome, telefone, tipoConsulta);

      // Pequeno delay para garantir que o fetch iniciou
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Fechar modal e redirecionar
      const modal = form.closest(".fixed");
      if (modal) closeModal(modal);

      redirectToWhatsApp(nome, tipoConsulta);

      // Restaurar botao
      submitBtn.disabled = false;
      submitBtn.textContent = "Agendar consulta";
    });
  }

  // Inicializar formularios
  handleFormSubmit("form-presencial", "presencial");
  handleFormSubmit("form-online", "online");
});
