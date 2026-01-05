(() => {
  const PDF_PATH = "assets/paper.pdf";

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const downloadBtn = document.getElementById("downloadBtn");
  const openBtn = document.getElementById("openBtn");
  const frame = document.getElementById("pdfFrame");
  const fallback = document.getElementById("pdfFallback");
  const viewer = document.getElementById("viewer");

  // Keep links consistent if you ever change the PDF path.
  if (downloadBtn) downloadBtn.href = PDF_PATH;
  if (openBtn) openBtn.href = PDF_PATH;

  // Improve "full height" behavior by accounting for actual header/footer sizes.
  const setViewerHeight = () => {
    if (!viewer) return;
    const header = document.querySelector(".site-header");
    const footer = document.querySelector(".site-footer");
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const footerH = footer ? footer.getBoundingClientRect().height : 0;
    // Space for main paddings: approx 68px (safe) on most screens.
    const reserved = headerH + footerH + 68;
    const h = Math.max(520, window.innerHeight - reserved);
    viewer.style.height = `${h}px`;
  };

  window.addEventListener("resize", setViewerHeight, { passive: true });
  setViewerHeight();

  // Robust-ish check: ensure PDF asset is reachable.
  // If HEAD is blocked, fall back to GET with Range=0-0 for minimal transfer.
  const checkPdf = async () => {
    try {
      const head = await fetch(PDF_PATH, { method: "HEAD", cache: "no-store" });
      if (head.ok) return true;
    } catch (_) {}

    try {
      const res = await fetch(PDF_PATH, {
        method: "GET",
        headers: { "Range": "bytes=0-0" },
        cache: "no-store",
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  };

  const showFallback = () => {
    if (fallback) fallback.hidden = false;
    if (frame) frame.style.display = "none";
  };

  const init = async () => {
    const ok = await checkPdf();
    if (!ok) {
      showFallback();
      return;
    }

    // Some browsers (rare) block inline PDF rendering.
    // If we detect a likely failure (no load within 2.5s), show fallback.
    let loaded = false;
    const timer = setTimeout(() => {
      if (!loaded) showFallback();
    }, 2500);

    if (frame) {
      frame.addEventListener("load", () => {
        loaded = true;
        clearTimeout(timer);
      }, { once: true });

      // Ensure the frame points to the correct file.
      if (!frame.src || !frame.src.includes(PDF_PATH)) {
        frame.src = `${PDF_PATH}#view=FitH`;
      }
    }
  };

  init();
})();
