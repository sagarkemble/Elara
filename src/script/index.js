import { logo } from "quote-generator";
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
  countDowm: {
    circle: document.querySelector(".progress"),
  },
  swatchWrapper: document.querySelector(".swatch-wrapper"),
};
const root = document.documentElement;
let activeBgColor = "#ece4b7";
let activeFgColor = "#050315";
let quoteIndex;
let colorIndex;
let swatchIndex;

async function nextQuote() {
  return new Promise(async (resolve) => {
    setIndex();
    // setTimeout(() => {
    // changeBackground();
    // }, 20);
    await fadeOutEffect(DOM.quoteWrapper);
    changeForeground();
    changeBackground();
    changeQuote();
    await fadeInEffect(DOM.quoteWrapper);

    resolve();
  });
}
document.addEventListener("DOMContentLoaded", async () => {
  startScreenAnimation();
});
function startScreenAnimation() {
  setIndex();
  console.log(colorIndex, swatchIndex, quoteIndex);

  changeBackground();
  changeForeground();
  changeQuote();
  DOM.loadingText.classList.add("animate-loading-text");
  console.log(DOM.loadingText);

  DOM.loadingText.addEventListener("animationend", () => {
    fadeOutEffect(DOM.loadingScreen);
  });
  nextQuote();
  resetTimer();
}

function setIndex() {
  colorIndex = Math.floor(Math.random() * swatchArr.length);
  swatchIndex = Math.random() < 0.5 ? 0 : 1;
  quoteIndex = Math.floor(Math.random() * quotesArr.length);
}
function changeBackground() {
  const backgroundColor = swatchIndex
    ? `#${swatchArr[colorIndex].color2}`
    : `#${swatchArr[colorIndex].color1}`;
  root.style.setProperty("--color-background", backgroundColor);
  DOM.backgroundSwatchTooltip.textContent = backgroundColor;
  activeBgColor = backgroundColor;
  console.log("background changed");
}
function changeForeground() {
  const foregroundColor = swatchIndex
    ? `#${swatchArr[colorIndex].color1}`
    : `#${swatchArr[colorIndex].color2}`;
  root.style.setProperty("--color-foreground", foregroundColor);
  DOM.foregroundSwatchTooltip.textContent = foregroundColor;
  activeFgColor = foregroundColor;
  console.log("foreground changed");
}
function changeQuote() {
  const quote = quotesArr[quoteIndex];
  console.log(quoteIndex);

  DOM.author.textContent = `— ${quote.from}`;
  DOM.quoteText.textContent = quote.text;
}

// timer
const duration = 8; // seconds
const circle = document.querySelector(".progress");
const text = document.querySelector(".timer-text");
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
circle.style.strokeDasharray = circumference;
circle.style.strokeDashoffset = circumference;
let start = null;
let isPaused = false;
let pausedAt = 0;
function animate(timestamp) {
  if (!start) start = timestamp;

  // if paused, just freeze
  if (isPaused) {
    requestAnimationFrame(animate);
    return;
  }

  const elapsed = (timestamp - start) / 1000;
  const progress = Math.min(elapsed / duration, 1);

  circle.style.strokeDashoffset = circumference * (1 - progress);
  text.textContent = Math.ceil(duration - progress * duration);

  if (progress < 1) {
    requestAnimationFrame(animate);
  } else {
    nextQuote();
    resetTimer();
  }
}

function pauseTimer() {
  if (!isPaused) {
    isPaused = true;
    pausedAt = performance.now() - start;
  }
}

function resumeTimer() {
  if (isPaused) {
    isPaused = false;
    start = performance.now() - pausedAt;
  }
}

function resetTimer() {
  start = null;
  circle.style.strokeDashoffset = circumference;
  text.textContent = duration;
  requestAnimationFrame(animate);
}

//handle swipe
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
    nextQuote();
    resetTimer();
  } else if (diffX < -threshold) {
    nextQuote();
    resetTimer();
  }
}

//listners
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
document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    event.preventDefault();
    nextQuote();
    resetTimer();
  }
});
// Mouse
document.addEventListener("mousedown", pauseTimer);
document.addEventListener("mouseup", resumeTimer);

// Touch
document.addEventListener("touchstart", pauseTimer);
document.addEventListener("touchend", resumeTimer);

// animations
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
