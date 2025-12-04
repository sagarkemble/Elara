import { quotesArr } from "./quotes.js";
import { swatchArr } from "./swatch.js";

const DOM = {
  title: document.querySelector(".title"),
  instruction: document.querySelector(".instruction"),
  copiedMessage: document.querySelector(".copied-message"),
  swatch: {
    wrapper: document.querySelector(".swatch-wrapper"),
    background: document.querySelector(".background-swatch"),
    foreground: document.querySelector(".foreground-swatch"),
    backgroundTooltip: document.querySelector(".background-tooltip"),
    foregroundTooltip: document.querySelector(".foreground-tooltip"),
  },
  quote: {
    wrapper: document.querySelector(".quote-wrapper"),
    text: document.querySelector(".quote-text"),
    author: document.querySelector(".author-name"),
  },
  loading: {
    screen: document.querySelector(".loading-screen"),
    text: document.querySelector(".loading-text"),
  },

  countdown: {
    timer: document.querySelector(".countdown-timer"),
    text: document.querySelector(".timer-text"),
    circle: document.querySelector(".progress"),
  },
};

const root = document.documentElement;
let activeBgColor = "#ece4b7";
let activeFgColor = "#050315";
let quoteIndex;
let colorIndex;
let swatchIndex;

// inital start
document.addEventListener("DOMContentLoaded", async () => {
  startScreenAnimation();
});
async function startScreenAnimation() {
  setIndex();
  changeBackground();
  changeForeground();
  changeQuote();
  DOM.loading.text.classList.add("animate-loading-text");
  DOM.loading.text.addEventListener("animationend", async () => {
    resetTimer();
    await fadeOutEffect(DOM.loading.screen);
  });
}

// change/next quote and supported functions
async function nextQuote() {
  return new Promise(async (resolve) => {
    DOM.countdown.timer.style.opacity = "0";
    setIndex();
    await fadeOutEffect(DOM.quote.wrapper);
    changeForeground();
    changeBackground();
    changeQuote();
    resetTimer();

    DOM.countdown.timer.style.opacity = "1";
    await fadeInEffect(DOM.quote.wrapper);
    resolve();
  });
}
function setIndex() {
  colorIndex = Math.floor(Math.random() * swatchArr.length);
  console.log(colorIndex);

  swatchIndex = Math.random() < 0.5 ? 0 : 1;
  quoteIndex = Math.floor(Math.random() * quotesArr.length);
}
function changeBackground() {
  const backgroundColor = swatchIndex
    ? `#${swatchArr[colorIndex].color2}`
    : `#${swatchArr[colorIndex].color1}`;
  root.style.setProperty("--color-background", backgroundColor);
  DOM.swatch.backgroundTooltip.textContent = backgroundColor;
  activeBgColor = backgroundColor;
}
function changeForeground() {
  const foregroundColor = swatchIndex
    ? `#${swatchArr[colorIndex].color1}`
    : `#${swatchArr[colorIndex].color2}`;
  root.style.setProperty("--color-foreground", foregroundColor);
  DOM.swatch.foregroundTooltip.textContent = foregroundColor;
  activeFgColor = foregroundColor;
}
function changeQuote() {
  const quote = quotesArr[quoteIndex];
  DOM.quote.author.textContent = `— ${quote.from}`;
  DOM.quote.text.textContent = quote.text;
}

// timer
const duration = 8;
const radius = DOM.countdown.circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
DOM.countdown.circle.style.strokeDasharray = circumference;
DOM.countdown.circle.style.strokeDashoffset = circumference;
let start = null;
let isPaused = false;
let pausedAt = 0;
async function animate(timestamp) {
  if (!start) start = timestamp;

  // if paused, just freeze
  if (isPaused) {
    requestAnimationFrame(animate);
    return;
  }

  // const elapsed = (timestamp - start) / 1000;
  const progress = Math.min(elapsed / duration, 1);

  DOM.countdown.circle.style.strokeDashoffset = circumference * (1 - progress);
  DOM.countdown.text.textContent = Math.ceil(duration - progress * duration);

  if (progress < 1) {
    requestAnimationFrame(animate);
  } else {
    nextQuote();
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
  DOM.countdown.circle.style.strokeDashoffset = circumference;
  DOM.countdown.text.textContent = duration;
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
async function handleSwipe() {
  const threshold = 100;
  const diffX = touchEndX - touchStartX;

  if (diffX > threshold) {
    nextQuote();
  } else if (diffX < -threshold) {
    nextQuote();
  }
}

// touch/mouse
let longPressTimer;
document.addEventListener("touchstart", () => {
  longPressTimer = setTimeout(() => {
    pauseTimer();
  }, 150);
});
document.addEventListener("touchend", () => {
  clearTimeout(longPressTimer);
  resumeTimer();
});
document.addEventListener("mousedown", pauseTimer);
document.addEventListener("mouseup", resumeTimer);

//other listners
DOM.swatch.background.addEventListener("click", () => {
  navigator.clipboard.writeText(activeBgColor);
  if (document.body.clientWidth <= 1024) {
    DOM.copiedMessage.textContent = `Copied ${activeBgColor}`;
    fadeInEffect(DOM.copiedMessage);
    setTimeout(() => {
      fadeOutEffect(DOM.copiedMessage);
    }, 1000);
  } else {
    DOM.swatch.backgroundTooltip.textContent = "Copied!";
    setTimeout(() => {
      DOM.swatch.backgroundTooltip.textContent = activeBgColor;
    }, 500);
  }
});
DOM.swatch.foreground.addEventListener("click", () => {
  navigator.clipboard.writeText(activeFgColor);
  if (document.body.clientWidth <= 1024) {
    DOM.copiedMessage.textContent = `Copied ${activeFgColor}`;
    fadeInEffect(DOM.copiedMessage);
    setTimeout(() => {
      fadeOutEffect(DOM.copiedMessage);
    }, 1000);
  } else {
    DOM.swatch.foregroundTooltip.textContent = "Copied!";
    setTimeout(() => {
      DOM.swatch.foregroundTooltip.textContent = activeFgColor;
    }, 500);
  }
});
DOM.quote.text.addEventListener("click", () => {
  navigator.clipboard.writeText(DOM.quote.text.textContent);
  DOM.copiedMessage.textContent = `Copied quote by ${DOM.quote.author.textContent}`;
  fadeInEffect(DOM.copiedMessage);
  setTimeout(() => {
    fadeOutEffect(DOM.copiedMessage);
  }, 1000);
});
DOM.quote.author.addEventListener("click", () => {
  navigator.clipboard.writeText(DOM.quote.text.textContent);
  DOM.copiedMessage.textContent = `Copied quote by ${DOM.quote.author.textContent}`;
  fadeInEffect(DOM.copiedMessage);
  setTimeout(() => {
    fadeOutEffect(DOM.copiedMessage);
  }, 1000);
});
DOM.title.addEventListener("click", () => {
  nextQuote();
});
document.addEventListener("keydown", async function (event) {
  if (event.code === "Space") {
    event.preventDefault();
    nextQuote();
  }
});

// animation functions
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
