/**
 * Night Bloom — Universal Bioluminescent Botanical Experience
 * Lightweight Vanilla JavaScript controller for dynamic URL greetings
 * and nocturnal bloom animation orchestration.
 */

(function () {
  "use strict";

  const DEFAULT_GREETING = "A Special Flower For You";

  /**
   * Sanitizes a raw URL parameter string to prevent injection or layout overflow.
   * @param {string | null} raw
   * @param {number} maxLength
   * @returns {string}
   */
  function sanitizeParam(raw, maxLength = 48) {
    if (!raw || typeof raw !== "string") return "";
    return raw
      .replace(/[\u0000-\u001F\u007F<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  /**
   * Resolves the full greeting phrase from the `?name=` URL parameter.
   * Falls back to "A Special Flower For You" when no name is provided.
   * @param {string} name
   * @returns {string}
   */
  function buildGreetingText(name) {
    if (!name) return DEFAULT_GREETING;
    if (/^a special flower for\b/i.test(name)) {
      return name;
    }
    return `A Special Flower For ${name}`;
  }

  /**
   * Renders a greeting string into word-safe `<span class="word">` containers
   * with staggered `<span class="char">` elements so text never breaks mid-word.
   * @param {HTMLElement} container
   * @param {string} text
   */
  function renderAnimatedGreeting(container, text) {
    if (!container) return;
    container.setAttribute("aria-label", text);
    container.textContent = "";

    const words = text.split(" ").filter(Boolean);
    let charIndex = 0;

    words.forEach((wordText, wordIdx) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "word";

      Array.from(wordText).forEach((ch) => {
        const charSpan = document.createElement("span");
        charSpan.className = "char";
        charSpan.style.setProperty("--char-index", String(charIndex));
        charSpan.textContent = ch;
        wordSpan.appendChild(charSpan);
        charIndex += 1;
      });

      container.appendChild(wordSpan);
      if (wordIdx < words.length - 1) {
        container.appendChild(document.createTextNode(" "));
      }
    });
  }

  /**
   * Updates internal navigation links to preserve `?name=` and `?msg=` parameters.
   * @param {string} name
   * @param {string} msg
   */
  function syncNavigationLinks(name, msg) {
    const query = new URLSearchParams();
    if (name) query.set("name", name);
    if (msg) query.set("msg", msg);
    const queryString = query.toString();
    const suffix = queryString ? `?${queryString}` : "";

    const bloomCta = document.getElementById("bloom-cta");
    if (bloomCta) {
      bloomCta.setAttribute("href", `flower.html${suffix}`);
    }

    const backHomeLink = document.getElementById("back-home-link");
    if (backHomeLink) {
      backHomeLink.setAttribute("href", `index.html${suffix}`);
    }
  }

  /**
   * Applies the current URL parameters to the DOM on either `index.html` or `flower.html`.
   */
  function applyUrlPersonalization() {
    const params = new URLSearchParams(window.location.search);
    const rawName = params.get("name") || params.get("to") || "";
    const rawMsg = params.get("msg") || params.get("message") || "";

    const cleanName = sanitizeParam(rawName, 40);
    const cleanMsg = sanitizeParam(rawMsg, 180);
    const fullGreeting = buildGreetingText(cleanName);

    // 1. Landing Page Greeting (`index.html`)
    const greetingTitle = document.getElementById("greeting-title");
    if (greetingTitle) {
      renderAnimatedGreeting(greetingTitle, fullGreeting);
      document.title = cleanName
        ? `Night Bloom — ${fullGreeting}`
        : `Night Bloom — ${DEFAULT_GREETING}`;
    }

    // Optional custom poetic subtitle (`?msg=...`)
    const greetingSubtitle = document.getElementById("greeting-subtitle");
    if (greetingSubtitle && cleanMsg) {
      const span = greetingSubtitle.querySelector("span") || greetingSubtitle;
      span.textContent = cleanMsg;
    }

    // 2. Flower Sanctuary HUD (`flower.html`)
    const bloomDedication = document.getElementById("bloom-dedication");
    if (bloomDedication) {
      bloomDedication.textContent = fullGreeting;
      document.title = cleanName
        ? `Night Bloom — ${fullGreeting}`
        : "Night Bloom — Bioluminescent Sanctuary";
    }

    const bloomWhisper = document.getElementById("bloom-whisper");
    if (bloomWhisper && cleanMsg) {
      bloomWhisper.textContent = cleanMsg;
    }

    // Pre-fill personalize input if present
    const recipientInput = document.getElementById("recipient-input");
    if (recipientInput && cleanName) {
      recipientInput.value = cleanName;
    }

    syncNavigationLinks(cleanName, cleanMsg);
  }

  /**
   * Initializes the interactive "Personalize & Share" bar on `index.html`
   * and the "Replay" button on `flower.html`.
   */
  function initInteractiveControls() {
    const toggleBtn = document.getElementById("toggle-personalize");
    const panel = document.getElementById("personalize-panel");
    const input = document.getElementById("recipient-input");
    const copyBtn = document.getElementById("copy-link-btn");

    if (toggleBtn && panel) {
      toggleBtn.addEventListener("click", () => {
        const isHidden = panel.hasAttribute("hidden");
        if (isHidden) {
          panel.removeAttribute("hidden");
          toggleBtn.setAttribute("aria-expanded", "true");
          if (input) input.focus();
        } else {
          panel.setAttribute("hidden", "");
          toggleBtn.setAttribute("aria-expanded", "false");
        }
      });

      panel.addEventListener("submit", (event) => {
        event.preventDefault();
        const nameVal = input ? sanitizeParam(input.value, 40) : "";
        const nextUrl = new URL(window.location.href);
        if (nameVal) {
          nextUrl.searchParams.set("name", nameVal);
        } else {
          nextUrl.searchParams.delete("name");
        }
        window.history.replaceState({}, "", nextUrl.toString());
        applyUrlPersonalization();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        const nameVal = input ? sanitizeParam(input.value, 40) : "";
        const shareUrl = new URL(window.location.href);
        if (nameVal) {
          shareUrl.searchParams.set("name", nameVal);
        } else {
          shareUrl.searchParams.delete("name");
        }
        window.history.replaceState({}, "", shareUrl.toString());
        applyUrlPersonalization();

        try {
          await navigator.clipboard.writeText(shareUrl.toString());
          const originalText = copyBtn.textContent;
          copyBtn.textContent = "Copied!";
          setTimeout(() => {
            copyBtn.textContent = originalText;
          }, 1800);
        } catch (_err) {
          // Fallback if clipboard permission is restricted
          if (input) {
            input.value = shareUrl.toString();
            input.select();
          }
        }
      });
    }

    // Replay button on `flower.html`
    const replayBtn = document.getElementById("replay-bloom");
    if (replayBtn) {
      replayBtn.addEventListener("click", () => {
        const flowersEl = document.querySelector(".flowers");
        if (!flowersEl) return;
        document.body.classList.add("container");
        // Force style recalculation and clone/reset animations cleanly
        const clone = flowersEl.cloneNode(true);
        flowersEl.parentNode.replaceChild(clone, flowersEl);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            document.body.classList.remove("container");
          });
        });
      });
    }
  }

  // Initialize personalization as soon as DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      applyUrlPersonalization();
      initInteractiveControls();
    });
  } else {
    applyUrlPersonalization();
    initInteractiveControls();
  }

  // Start the flower blooming animation when all assets finish loading
  window.addEventListener("load", () => {
    document.body.classList.remove("container");
  });
})();
