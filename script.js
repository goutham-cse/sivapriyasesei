const cursor = document.querySelector(".cursor-bubble");
const audio = document.querySelector("#bg-audio");
const lanes = [...document.querySelectorAll(".lane")];
const navLinks = [...document.querySelectorAll(".lane-nav a")];
const tiltCards = [...document.querySelectorAll("[data-tilt]")];

let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let bubbleX = cursorX;
let bubbleY = cursorY;

const animateCursor = () => {
  bubbleX += (cursorX - bubbleX) * 0.17;
  bubbleY += (cursorY - bubbleY) * 0.17;
  cursor.style.transform = `translate3d(${bubbleX - 17}px, ${bubbleY - 17}px, 0)`;
  requestAnimationFrame(animateCursor);
};

window.addEventListener("pointermove", (event) => {
  cursorX = event.clientX;
  cursorY = event.clientY;
  cursor.classList.add("is-visible");
});

document.querySelectorAll("a, .photo-stage").forEach((element) => {
  element.addEventListener("pointerenter", () => cursor.classList.add("is-hovering"));
  element.addEventListener("pointerleave", () => cursor.classList.remove("is-hovering"));
});

animateCursor();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { threshold: 0.52 }
);

lanes.forEach((lane) => observer.observe(lane));

const startAudio = async () => {
  if (!audio || !audio.paused) return;
  try {
    audio.volume = 0.72;
    await audio.play();
    window.removeEventListener("pointerdown", startAudio);
    window.removeEventListener("touchstart", startAudio);
    window.removeEventListener("wheel", startAudio);
    window.removeEventListener("keydown", startAudio);
  } catch {
    window.addEventListener("pointerdown", startAudio, { once: true });
    window.addEventListener("touchstart", startAudio, { once: true });
    window.addEventListener("wheel", startAudio, { once: true });
    window.addEventListener("keydown", startAudio, { once: true });
  }
};

window.addEventListener("load", startAudio);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) startAudio();
});

tiltCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 10}deg) translateZ(0)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

document.addEventListener("keydown", (event) => {
  const currentIndex = lanes.findIndex((lane) => {
    const rect = lane.getBoundingClientRect();
    return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
  });

  if (event.key === "ArrowDown" || event.key === "PageDown") {
    lanes[Math.min(currentIndex + 1, lanes.length - 1)]?.scrollIntoView({ behavior: "smooth" });
  }

  if (event.key === "ArrowUp" || event.key === "PageUp") {
    lanes[Math.max(currentIndex - 1, 0)]?.scrollIntoView({ behavior: "smooth" });
  }
});
