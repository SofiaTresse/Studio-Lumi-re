/* ==========================================================================
   Studio Lumière — interações
   ========================================================================== */

(() => {
  "use strict";

  /* Troque pelo WhatsApp real do salão: DDI + DDD + número (só dígitos). */
  const WHATSAPP = "5511999999999";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clearFieldError = (input) => {
    const errorEl = $(`[data-error-for="${input.id}"]`);
    input.classList.remove("has-error");
    input.setAttribute("aria-invalid", "false");
    if (errorEl) errorEl.textContent = "";
  };

  /* ----------------------------------------------------------------------
     Header com fundo ao rolar
     ---------------------------------------------------------------------- */
  const header = $("#siteHeader");
  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ----------------------------------------------------------------------
     Menu mobile
     ---------------------------------------------------------------------- */
  const nav = $("#primaryNav");
  const navToggle = $("#navToggle");
  const navBackdrop = $("#navBackdrop");
  const pageRegions = [
    $("main"),
    $(".site-footer"),
    $(".whatsapp-float"),
    $(".mobile-bar"),
  ].filter(Boolean);

  const closeNav = () => {
    nav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("nav-aberto");
    pageRegions.forEach((region) => {
      region.inert = false;
    });
  };

  const openNav = () => {
    nav.classList.add("is-open");
    navToggle.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Fechar menu");
    document.body.classList.add("nav-aberto");
    pageRegions.forEach((region) => {
      region.inert = true;
    });
    const firstLink = $("a", nav);
    if (firstLink) window.setTimeout(() => firstLink.focus(), 60);
  };

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("is-open");
    isOpen ? closeNav() : openNav();
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNav();
  });

  if (navBackdrop) navBackdrop.addEventListener("click", closeNav);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeNav();
      navToggle.focus();
    }
  });

  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
    if (event.matches) closeNav();
  });

  /* ----------------------------------------------------------------------
     Barra de ações mobile
     ---------------------------------------------------------------------- */
  const mobileBar = $("#mobileBar");

  if (mobileBar) {
    const bookingSection = $("#agendamento");
    let bookingVisible = false;

    const updateMobileBar = () => {
      const shouldShow = window.scrollY > 420 && !bookingVisible;
      mobileBar.classList.toggle("is-visible", shouldShow);
      mobileBar.classList.toggle("is-away", bookingVisible);
    };

    window.addEventListener("scroll", updateMobileBar, { passive: true });

    if (bookingSection && "IntersectionObserver" in window) {
      const bookingObserver = new IntersectionObserver(
        (entries) => {
          bookingVisible = entries[0].isIntersecting;
          updateMobileBar();
        },
        { threshold: 0.12 }
      );
      bookingObserver.observe(bookingSection);
    }

    updateMobileBar();
  }

  /* ----------------------------------------------------------------------
     Reveal ao rolar
     ---------------------------------------------------------------------- */
  const revealItems = $$("[data-reveal]");

  if (revealItems.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      const siblingCount = new WeakMap();
      revealItems.forEach((item) => {
        const parent = item.parentElement;
        const index = siblingCount.get(parent) || 0;
        siblingCount.set(parent, index + 1);
        item.style.animationDelay = `${Math.min(index * 80, 320)}ms`;
      });

      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -32px 0px" }
      );

      revealItems.forEach((item) => revealObserver.observe(item));
    }
  }

  /* ----------------------------------------------------------------------
     Contadores
     ---------------------------------------------------------------------- */
  const counters = $$("[data-count]");
  const numberFormat = (value, decimals) =>
    new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);

  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";

    if (Number.isNaN(target)) return;

    if (reducedMotion) {
      el.textContent = numberFormat(target, decimals) + suffix;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = numberFormat(target * eased, decimals) + (progress === 1 ? suffix : "");
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(runCounter);
    } else {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((counter) => counterObserver.observe(counter));
    }
  }

  /* ----------------------------------------------------------------------
     Carrossel de depoimentos
     ---------------------------------------------------------------------- */
  const carousel = $("[data-carousel]");

  if (carousel) {
    const slides = $$(".depoimento", carousel);
    const dots = $$(".carousel-dot", carousel);
    const prevBtn = $("[data-carousel-prev]", carousel);
    const nextBtn = $("[data-carousel-next]", carousel);
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
      current = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });

      dots.forEach((dot, i) => {
        const active = i === current;
        dot.classList.toggle("is-active", active);
        if (active) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    };

    const stopAuto = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const startAuto = () => {
      if (reducedMotion) return;
      stopAuto();
      timer = window.setInterval(() => showSlide(current + 1), 6500);
    };

    prevBtn.addEventListener("click", () => {
      showSlide(current - 1);
      startAuto();
    });

    nextBtn.addEventListener("click", () => {
      showSlide(current + 1);
      startAuto();
    });

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        showSlide(i);
        startAuto();
      });
    });

    carousel.addEventListener("mouseenter", stopAuto);
    carousel.addEventListener("mouseleave", startAuto);
    carousel.addEventListener("focusin", stopAuto);
    carousel.addEventListener("focusout", (event) => {
      if (!carousel.contains(event.relatedTarget)) startAuto();
    });

    document.addEventListener("visibilitychange", () => {
      document.hidden ? stopAuto() : startAuto();
    });

    showSlide(0);
    startAuto();
  }

  /* ----------------------------------------------------------------------
     Links de serviço -> pré-seleciona no formulário
     ---------------------------------------------------------------------- */
  const servicoSelect = $("#servico");

  if (servicoSelect) {
    $$("[data-service]").forEach((link) => {
      link.addEventListener("click", () => {
        const value = link.dataset.service;
        const option = [...servicoSelect.options].find((opt) => opt.value === value);
        if (option) {
          servicoSelect.value = value;
          clearFieldError(servicoSelect);
        }
      });
    });
  }

  /* ----------------------------------------------------------------------
     Formulário de agendamento
     ---------------------------------------------------------------------- */
  const form = $("#agendamentoForm");

  if (form) {
    const nomeInput = $("#nome");
    const telefoneInput = $("#telefone");
    const dataInput = $("#data");
    const horarioSelect = $("#horario");
    const profissionalSelect = $("#profissional");
    const observacoesInput = $("#observacoes");
    const lembreteInput = $("#lembrete");
    const successBox = $("#bookingSuccess");
    const successDetails = $("#successDetails");
    const whatsappLink = $("#whatsappLink");
    const newBookingBtn = $("#newBooking");

    const pad = (value) => String(value).padStart(2, "0");
    const toISO = (date) =>
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 60);

    dataInput.min = toISO(today);
    dataInput.max = toISO(maxDate);

    const parseISODate = (value) => {
      if (!value) return null;
      const [year, month, day] = value.split("-").map(Number);
      if (!year || !month || !day) return null;
      return new Date(year, month - 1, day);
    };

    const getWeekday = (value) => {
      const date = parseISODate(value);
      return date ? date.getDay() : null;
    };

    const buildHorarios = (dateValue) => {
      const previous = horarioSelect.value;
      const weekday = getWeekday(dateValue);
      let lastSlot = 19 * 60 + 30; // seg a sex: até 19h30
      if (weekday === 6) lastSlot = 17 * 60 + 30; // sábado: até 17h30

      horarioSelect.innerHTML = '<option value="">Selecione</option>';

      for (let minutes = 9 * 60; minutes <= lastSlot; minutes += 30) {
        const time = `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
        const option = document.createElement("option");
        option.value = time;
        option.textContent = time;
        horarioSelect.appendChild(option);
      }

      if ([...horarioSelect.options].some((opt) => opt.value === previous)) {
        horarioSelect.value = previous;
      }
    };

    buildHorarios("");

    const setFieldError = (input, message) => {
      const errorEl = $(`[data-error-for="${input.id}"]`);
      input.classList.toggle("has-error", Boolean(message));
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (errorEl) errorEl.textContent = message;
    };

    const maskPhone = (value) => {
      const digits = value.replace(/\D/g, "").slice(0, 11);
      if (!digits) return "";
      if (digits.length <= 2) return `(${digits}`;

      const ddd = digits.slice(0, 2);
      const rest = digits.slice(2);
      const splitAt = digits.length > 10 ? 5 : 4;
      const middle = rest.slice(0, splitAt);
      const end = rest.slice(splitAt);

      return `(${ddd}) ${middle}${end ? `-${end}` : ""}`;
    };

    telefoneInput.addEventListener("input", () => {
      telefoneInput.value = maskPhone(telefoneInput.value);
    });

    [nomeInput, telefoneInput, servicoSelect, dataInput, horarioSelect].forEach((input) => {
      input.addEventListener("input", () => clearFieldError(input));
      input.addEventListener("change", () => clearFieldError(input));
    });

    dataInput.addEventListener("change", () => {
      buildHorarios(dataInput.value);
      if (dataInput.value && getWeekday(dataInput.value) === 0) {
        setFieldError(dataInput, "Aos domingos o studio descansa. Escolha outro dia.");
      }
    });

    const validateForm = () => {
      const errors = [];

      if (nomeInput.value.trim().length < 3) {
        setFieldError(nomeInput, "Digite seu nome completo.");
        errors.push(nomeInput);
      }

      const phoneDigits = telefoneInput.value.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        setFieldError(telefoneInput, "Digite um WhatsApp válido com DDD.");
        errors.push(telefoneInput);
      }

      if (!servicoSelect.value) {
        setFieldError(servicoSelect, "Escolha o serviço desejado.");
        errors.push(servicoSelect);
      }

      const chosenDate = parseISODate(dataInput.value);
      if (!chosenDate) {
        setFieldError(dataInput, "Escolha uma data.");
        errors.push(dataInput);
      } else if (chosenDate < today) {
        setFieldError(dataInput, "Escolha uma data a partir de hoje.");
        errors.push(dataInput);
      } else if (chosenDate > maxDate) {
        setFieldError(dataInput, "Agendamos com até 60 dias de antecedência.");
        errors.push(dataInput);
      } else if (chosenDate.getDay() === 0) {
        setFieldError(dataInput, "Aos domingos o studio descansa. Escolha outro dia.");
        errors.push(dataInput);
      }

      if (!horarioSelect.value) {
        setFieldError(horarioSelect, "Escolha um horário.");
        errors.push(horarioSelect);
      }

      if (errors.length) errors[0].focus();
      return errors.length === 0;
    };

    const formatDate = (value) => {
      const date = parseISODate(value);
      if (!date) return "";
      const formatted = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }).format(date);
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    const addDetail = (label, value) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = value;
      row.append(term, description);
      successDetails.appendChild(row);
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!validateForm()) return;

      const nome = nomeInput.value.trim();
      const telefone = telefoneInput.value.trim();
      const servico = servicoSelect.value;
      const profissional = profissionalSelect.value;
      const data = formatDate(dataInput.value);
      const horario = horarioSelect.value;
      const observacoes = observacoesInput.value.trim();
      const lembrete = lembreteInput.checked;

      successDetails.innerHTML = "";
      addDetail("Nome", nome);
      addDetail("WhatsApp", telefone);
      addDetail("Serviço", servico);
      if (profissional) addDetail("Profissional", profissional);
      addDetail("Data", data);
      addDetail("Horário", horario);
      if (observacoes) addDetail("Observações", observacoes);

      const intro = successBox.querySelector("p");
      const firstName = nome.split(" ")[0];
      if (intro) {
        intro.textContent = `Tudo certo, ${firstName}! Confira os dados e envie pelo WhatsApp para confirmarmos seu horário.`;
      }

      const message = [
        "Olá, Studio Lumière! Gostaria de solicitar um agendamento.",
        "",
        `Nome: ${nome}`,
        `WhatsApp: ${telefone}`,
        `Serviço: ${servico}`,
        profissional ? `Profissional: ${profissional}` : null,
        `Data: ${data}`,
        `Horário: ${horario}`,
        observacoes ? `Observações: ${observacoes}` : null,
        lembrete ? "Quero receber lembrete no WhatsApp." : null,
      ]
        .filter(Boolean)
        .join("\n");

      whatsappLink.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

      form.hidden = true;
      successBox.hidden = false;
      successBox.focus({ preventScroll: true });
      $(".booking-card").scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
      });
    });

    newBookingBtn.addEventListener("click", () => {
      form.reset();
      [nomeInput, telefoneInput, servicoSelect, dataInput, horarioSelect].forEach(clearFieldError);
      buildHorarios(dataInput.value);
      successBox.hidden = true;
      form.hidden = false;
      nomeInput.focus();
    });
  }

  /* ----------------------------------------------------------------------
     Galeria com lightbox
     ---------------------------------------------------------------------- */
  const lightbox = $("#lightbox");

  if (lightbox && typeof lightbox.showModal === "function") {
    const lightboxImg = $("#lightboxImg");
    const lightboxCaption = $("#lightboxCaption");
    const lightboxClose = $("#lightboxClose");

    $$(".galeria-item").forEach((item) => {
      item.addEventListener("click", () => {
        const thumb = $("img", item);
        lightboxImg.src = item.dataset.full || (thumb ? thumb.src : "");
        lightboxImg.alt = thumb ? thumb.alt : "";
        lightboxCaption.textContent = item.dataset.caption || "";
        lightbox.showModal();
      });
    });

    lightboxClose.addEventListener("click", () => lightbox.close());

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.close();
    });

    lightbox.addEventListener("close", () => {
      lightboxImg.src = "";
    });
  }

  /* ----------------------------------------------------------------------
     Ano no rodapé
     ---------------------------------------------------------------------- */
  const yearEl = $("#ano");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
