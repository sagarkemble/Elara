import { quotesArr } from "./quotes.js";
import { swatchArr } from "./swatch.js";
const DOM = {
  quoteWrapper: document.querySelector(".quote-wrapper"),
  quoteText: document.querySelector(".quote-text"),
  author: document.querySelector(".author-name"),
  instruction: document.querySelector(".instruction"),
  backgroundSwatch: document.querySelector(".background-swatch"),
  foregroundSwatch: document.querySelector(".foreground-swatch"),
  backgroundSwatchTooltip: document.querySelector(".background-tooltip"),
  foregroundSwatchTooltip: document.querySelector(".foreground-tooltip"),
  copiedMessage: document.querySelector(".copied-message"),
  loadingScreen: document.querySelector(".loading-screen"),
  loadingText: document.querySelector(".loading-text"),
};
const root = document.documentElement;
let activeBgColor = "#ece4b7";
let activeFgColor = "#050315";

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    event.preventDefault();
    changeQuote();
  }
});

if (document.body.clientWidth > 1024) {
  DOM.instruction.textContent = "Press space for next quote";
}
let touchStartX = 0;
let touchEndX = 0;
document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});
document.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});
function handleSwipe() {
  const threshold = 100; // Minimum distance for a swipe
  const diffX = touchEndX - touchStartX;

  if (diffX > threshold) {
    changeQuote();
  } else if (diffX < -threshold) {
    changeQuote();
    console.log("Swiped left!");
  }
}
async function changeQuote() {
  return new Promise(async (resolve) => {
    const randomIndex = Math.floor(Math.random() * quotesArr.length);
    const randomColorIndex = Math.floor(Math.random() * swatchArr.length);
    const quote = quotesArr[randomIndex];
    const swapColors = Math.random() < 0.5;

    const backgroundColor = swapColors
      ? `#${swatchArr[randomColorIndex].color2}`
      : `#${swatchArr[randomColorIndex].color1}`;

    const foregroundColor = swapColors
      ? `#${swatchArr[randomColorIndex].color1}`
      : `#${swatchArr[randomColorIndex].color2}`;

    setTimeout(() => {
      root.style.setProperty("--color-background", backgroundColor);
    }, 20);

    await fadeOutEffect(DOM.quoteWrapper);

    DOM.author.textContent = `— ${quote.from}`;
    DOM.quoteText.textContent = quote.text;
    root.style.setProperty("--color-foreground", foregroundColor);
    DOM.backgroundSwatchTooltip.textContent = backgroundColor;
    DOM.foregroundSwatchTooltip.textContent = foregroundColor;

    activeBgColor = backgroundColor;
    activeFgColor = foregroundColor;

    // Assuming fadeInEffect returns a promise or uses animationend
    await fadeInEffect(DOM.quoteWrapper);

    resolve(); // ✅ resolve when done
  });
}

export async function fadeInEffect(element) {
  if (!element.classList.contains("hidden")) {
    return;
  }
  element.style.opacity = "0";
  element.classList.remove("hidden");
  const durationStr = getComputedStyle(element).transitionDuration;
  let ms = 0;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  element.style.opacity = "1";
  await new Promise((resolve) => setTimeout(resolve, ms));
}
export async function fadeOutEffect(element) {
  if (element.classList.contains("hidden")) {
    return;
  }
  element.style.opacity = "0";
  const durationStr = getComputedStyle(element).transitionDuration;
  if (durationStr === "0s") {
    element.classList.add("hidden");
    return;
  }
  let ms = 0;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
  element.classList.add("hidden");
}
DOM.backgroundSwatch.addEventListener("click", () => {
  navigator.clipboard.writeText(activeBgColor);
  if (document.body.clientWidth <= 1024) {
    DOM.copiedMessage.textContent = `Copied ${activeBgColor}`;
    fadeInEffect(DOM.copiedMessage);
    setTimeout(() => {
      fadeOutEffect(DOM.copiedMessage);
    }, 1000);
  } else {
    DOM.backgroundSwatchTooltip.textContent = "Copied!";
    setTimeout(() => {
      DOM.backgroundSwatchTooltip.textContent = activeBgColor;
    }, 500);
  }
});
DOM.foregroundSwatch.addEventListener("click", () => {
  navigator.clipboard.writeText(activeFgColor);
  if (document.body.clientWidth <= 1024) {
    DOM.copiedMessage.textContent = `Copied ${activeFgColor}`;
    fadeInEffect(DOM.copiedMessage);
    setTimeout(() => {
      fadeOutEffect(DOM.copiedMessage);
    }, 1000);
  } else {
    DOM.foregroundSwatchTooltip.textContent = "Copied!";
    setTimeout(() => {
      DOM.foregroundSwatchTooltip.textContent = activeFgColor;
    }, 500);
  }
});
DOM.quoteText.addEventListener("click", () => {
  navigator.clipboard.writeText(DOM.quoteText.textContent);
  DOM.copiedMessage.textContent = `Copied quote by ${DOM.author.textContent}`;
  fadeInEffect(DOM.copiedMessage);
  setTimeout(() => {
    fadeOutEffect(DOM.copiedMessage);
  }, 1000);
});
DOM.author.addEventListener("click", () => {
  navigator.clipboard.writeText(DOM.quoteText.textContent);
  DOM.copiedMessage.textContent = `Copied quote by ${DOM.author.textContent}`;
  fadeInEffect(DOM.copiedMessage);
  setTimeout(() => {
    fadeOutEffect(DOM.copiedMessage);
  }, 1000);
});
document.addEventListener("DOMContentLoaded", async () => {
  await changeQuote();
  DOM.loadingText.classList.add("animate-loading-text"); // no dot here!
  DOM.loadingText.addEventListener("animationend", () => {
    fadeOutEffect(DOM.loadingScreen);
  });
});
