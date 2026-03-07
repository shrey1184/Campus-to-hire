"use client";

const COLORS = ["#c9a84c", "#f2d78a", "#f97316", "#facc15", "#22c55e", "#38bdf8"];

let stylesInjected = false;

function ensureStyles() {
  if (stylesInjected || typeof document === "undefined") {
    return;
  }

  const style = document.createElement("style");
  style.textContent = `
    @keyframes campus-confetti-fall {
      0% { transform: translate3d(0, -12vh, 0) rotate(0deg); opacity: 1; }
      100% { transform: translate3d(var(--confetti-x, 0), 110vh, 0) rotate(720deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  stylesInjected = true;
}

export function fireConfetti(pieceCount = 28) {
  if (typeof document === "undefined") {
    return;
  }

  ensureStyles();

  const layer = document.createElement("div");
  layer.style.position = "fixed";
  layer.style.inset = "0";
  layer.style.pointerEvents = "none";
  layer.style.zIndex = "9999";
  document.body.appendChild(layer);

  for (let index = 0; index < pieceCount; index += 1) {
    const piece = document.createElement("span");
    const size = 6 + Math.random() * 8;
    const left = Math.random() * 100;
    const drift = `${Math.round((Math.random() - 0.5) * 220)}px`;
    const duration = 900 + Math.random() * 700;
    const delay = Math.random() * 150;

    piece.style.position = "absolute";
    piece.style.left = `${left}%`;
    piece.style.top = "-10vh";
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 1.7}px`;
    piece.style.borderRadius = "999px";
    piece.style.background = COLORS[index % COLORS.length];
    piece.style.opacity = "0";
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.setProperty("--confetti-x", drift);
    piece.style.animation = `campus-confetti-fall ${duration}ms ease-out ${delay}ms forwards`;

    layer.appendChild(piece);
  }

  window.setTimeout(() => {
    layer.remove();
  }, 1800);
}
