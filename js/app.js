/* Özsu Oto Kurtarma arayüz betiği */
if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { document.documentElement.style.display = "none"; } }

(function () {
  "use strict";

  const PHONE = "+905324238653";
  const WA_BASE = "https://wa.me/905324238653";

  function safeText(value) {
    return value === null || value === undefined ? "" : String(value);
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile menu -----------------------------------------------------------
  const menuToggle = document.getElementById("menuToggle");
  const primaryNav = document.getElementById("primaryNav");
  if (menuToggle && primaryNav) {
    menuToggle.addEventListener("click", function () {
      const open = primaryNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
    primaryNav.addEventListener("click", function (e) {
      if (e.target && e.target.tagName === "A") {
        primaryNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Scroll reveal ----------------------------------------------------------
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Count-up --------------------------------------------------------------
  function animateCount(el, target, duration) {
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const countEls = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-count") || "0", 10);
          animateCount(el, target, 1400);
          cio.unobserve(el);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -20px 0px' });
    countEls.forEach(function (el) { cio.observe(el); });
  } else {
    countEls.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  }

  // Header shadow ---------------------------------------------------------
  const header = document.getElementById("siteHeader");
  window.addEventListener("scroll", function () {
    if (!header) return;
    header.style.boxShadow = window.scrollY > 10 ? "0 8px 30px rgba(0,0,0,.08)" : "none";
  }, { passive: true });

  // News -----------------------------------------------------------------
  const newsTargets = [document.getElementById("newsList"), document.getElementById("newsListAside")].filter(Boolean);

  function formatTrDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
  }

  async function loadNews() {
    if (newsTargets.length === 0) return;
    let items = [];
    try {
      const res = await fetch("data/news.json?cb=" + Date.now(), { cache: "no-store" });
      if (res.ok) items = await res.json();
    } catch (err) { console.error("haberler yüklenemedi", err); }
    newsTargets.forEach(function (target) { target.innerHTML = ""; });
    if (!Array.isArray(items) || items.length === 0) {
      newsTargets.forEach(function (target) {
        const li = document.createElement("li");
        li.className = "news-empty";
        li.textContent = "Şu an yayınlanmış haber bulunmuyor.";
        target.appendChild(li);
      });
      return;
    }
    items.forEach(function (item) {
      newsTargets.forEach(function (target) {
        const li = document.createElement("li");
        const date = document.createElement("span");
        date.className = "news-date";
        date.textContent = formatTrDate(item.date);
        const title = document.createElement("span");
        title.className = "news-title-text";
        title.textContent = safeText(item.title);
        const body = document.createElement("p");
        body.className = "news-body";
        body.textContent = safeText(item.body);
        li.appendChild(date);
        li.appendChild(title);
        li.appendChild(body);
        target.appendChild(li);
      });
    });
  }

  function initVehicleMap() {
    if (!window.L) return;
    const mapEl = document.getElementById("vehicleMap");
    if (!mapEl) return;
    const AFYON = [38.756, 30.538];
    let map;
    try {
      map = L.map(mapEl, { zoomControl: true }).setView(AFYON, 12);
    } catch (err) {
      console.error("harita başlatılamadı", err);
      return;
    }
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap katkıda bulunanlar",
      maxZoom: 19
    }).addTo(map);
    const truckIcon = L.divIcon({ className: "truck-marker", html: "🚛", iconSize: [32, 32], iconAnchor: [16, 16] });
    L.marker(AFYON, { icon: truckIcon, title: "Özsu çekici" }).addTo(map);
    const updateEl = document.getElementById("vehicleUpdate");
    function tick() {
      if (updateEl) updateEl.textContent = new Date().toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
    }
    tick();
    setTimeout(function () { try { map.invalidateSize(); } catch (e) {} }, 400);
  }

    function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { loadNews(); initIcons(); initVehicleMap(); });
  } else {
    loadNews();
    initIcons();
    initVehicleMap();
  }

  // Feedback / missing-info form (GitHub Issues) -------------------------
  const feedbackForm = document.getElementById("feedbackForm");
  const FEEDBACK_REPO = "routermurti/ozsuyolyard-m";
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const fd = new FormData(feedbackForm);
      const name = safeText(fd.get("name")).trim();
      const note = safeText(fd.get("note")).trim();
      const groups = [];
      feedbackForm.querySelectorAll("fieldset.feedback-group").forEach(function (fs) {
        const legendEl = fs.querySelector("legend");
        const legend = legendEl ? legendEl.textContent.trim() : "Genel";
        const checkedItems = Array.from(fs.querySelectorAll('input[type="checkbox"]:checked')).map(function (cb) { return cb.value; });
        if (checkedItems.length) groups.push({ legend: legend, items: checkedItems });
      });
      const checked = groups.reduce(function (all, g) { return all.concat(g.items); }, []);

      const title = checked.length
        ? "Eksik bilgi bildirimi: " + checked.length + " madde seçildi"
        : "Eksik bilgi bildirimi: Genel geri bildirim";

      const bodyLines = [];
      bodyLines.push("### İşaretlenen eksik bilgiler");
      bodyLines.push("");
      groups.forEach(function (g) {
        bodyLines.push("**" + g.legend + "**");
        g.items.forEach(function (v) { bodyLines.push("- [x] " + v); });
        bodyLines.push("");
      });
      if (checked.length === 0) {
        bodyLines.push("- (İşaretlenen madde yok)");
        bodyLines.push("");
      }
      bodyLines.push("### Ek not");
      bodyLines.push(note || "—");
      bodyLines.push("");
      bodyLines.push("### Gönderen");
      bodyLines.push(name || "Anonim");
      bodyLines.push("");
      bodyLines.push("---");
      bodyLines.push("Otomatik taslak: Özsu web sitesi geri bildirim formu.");

      const params = new URLSearchParams();
      params.set("title", title);
      params.set("body", bodyLines.join("\n"));
      params.set("labels", "feedback,missing-info");

      const url = "https://github.com/" + FEEDBACK_REPO + "/issues/new?" + params.toString();
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  // Contact form ----------------------------------------------------------
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const fd = new FormData(form);
      const name = safeText(fd.get("name")).trim();
      const phone = safeText(fd.get("phone")).trim();
      const message = safeText(fd.get("message")).trim();
      const channel = safeText(fd.get("channel"));
      if (!name || !message) return;
      const text = encodeURIComponent("Merhaba, ben " + name + ". " + (phone ? "Tel: " + phone + ". " : "") + message);
      if (channel === "phone") {
        window.location.href = "tel:" + PHONE;
      } else {
        window.open(WA_BASE + "?text=" + text, "_blank", "noopener,noreferrer");
      }
    });
  }

})();



