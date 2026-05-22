const dataPath = "./data/works.csv";
const worksGrid = document.querySelector("#works-grid");
const workCount = document.querySelector("#work-count");
const dataNote = document.querySelector("#data-note");
const workTemplate = document.querySelector("#work-template");
const quoteNode = document.querySelector("#footer-quote");
const modeToggle = document.querySelector("#mode-toggle");
const oracleToggle = document.querySelector("#oracle-toggle");
const oraclePanel = document.querySelector("#oracle-panel");
const oracleClose = document.querySelector("#oracle-close");
const oracleAgain = document.querySelector("#oracle-again");
const hexagramNode = document.querySelector("#hexagram");
const oracleTitle = document.querySelector("#oracle-title");
const oracleMessage = document.querySelector("#oracle-message");

const quotes = [
  "知止而后有定，定而后能静。",
  "观其所由，察其所安。",
  "Until you make the unconscious conscious, it will direct your life.",
  "静而后能安，安而后能虑。"
];

const hexagrams = [
  { title: "乾卦", message: "自强不息，先让心志有其天光。", lines: "111111" },
  { title: "坤卦", message: "厚德载物，柔顺并非退让。", lines: "000000" },
  { title: "离卦", message: "柔顺以待，光明不远。", lines: "101101" },
  { title: "坎卦", message: "行过幽谷，仍要守住一线清醒。", lines: "010010" },
  { title: "震卦", message: "惊雷起处，新的行动正在醒来。", lines: "001001" },
  { title: "巽卦", message: "风入万物，缓慢也能抵达深处。", lines: "110110" },
  { title: "艮卦", message: "止于当止，给欲望一座静山。", lines: "100100" },
  { title: "兑卦", message: "悦而不散，让真心有出口。", lines: "011011" },
  { title: "泰卦", message: "天地交而万物通，先把内外调匀。", lines: "111000" },
  { title: "谦卦", message: "山在地中，收敛锋芒仍自有重量。", lines: "001000" },
  { title: "复卦", message: "一阳来复，回到最初的呼吸。", lines: "000001" },
  { title: "既济", message: "事成之后，更要照看细微的波纹。", lines: "010101" }
];

let lastHexagramIndex = -1;

function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const next = csvText[index + 1];

    if (char === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      row.push(field.trim());
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      row.push(field.trim());
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }

  const [headers = [], ...records] = rows;
  return records.map((record) =>
    headers.reduce((work, header, index) => {
      work[header] = record[index] || "";
      return work;
    }, {})
  );
}

function isDirectVideo(url) {
  return /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(url);
}

function renderWorks(works) {
  worksGrid.replaceChildren();

  works
    .filter((work) => work.title && work.videoUrl)
    .forEach((work) => {
      const fragment = workTemplate.content.cloneNode(true);
      const card = fragment.querySelector(".work-card");
      const link = fragment.querySelector(".work-link");
      const title = fragment.querySelector("h3");
      const meta = fragment.querySelector(".work-meta");
      const description = fragment.querySelector(".work-description");
      const story = fragment.querySelector(".work-story");
      const image = fragment.querySelector(".work-image");
      const video = fragment.querySelector(".work-preview");

      link.href = work.videoUrl;
      link.setAttribute("aria-label", `打开作品：${work.title}`);
      title.textContent = work.title;
      meta.textContent = [work.category, work.year].filter(Boolean).join(" / ");
      description.textContent = work.description || "进入作品，听镜头说话。";
      story.textContent = work.story;

      if (!work.story) {
        story.hidden = true;
      }

      if (work.thumbnail) {
        image.src = work.thumbnail;
        image.alt = `${work.title} 封面`;
        image.hidden = false;
      }

      if (isDirectVideo(work.videoUrl)) {
        video.src = work.videoUrl;
        video.addEventListener("loadeddata", () => video.classList.add("is-ready"), {
          once: true
        });
        card.addEventListener("pointerenter", () => video.play().catch(() => {}));
        card.addEventListener("pointerleave", () => {
          video.pause();
          video.currentTime = 0;
        });
      } else {
        video.remove();
      }

      worksGrid.append(fragment);
    });

  const renderedCount = worksGrid.children.length;
  workCount.textContent = `${renderedCount} 部作品 / 数据来自 CSV`;
}

async function loadWorks() {
  try {
    const response = await fetch(dataPath, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    renderWorks(parseCsv(await response.text()));
  } catch (error) {
    workCount.textContent = "作品数据尚未显影";
    dataNote.hidden = false;
    dataNote.textContent =
      "请通过本地静态服务器打开页面，并检查 data/works.csv 是否存在。";
    console.error("Failed to load portfolio data:", error);
  }
}

function setNightView(enabled) {
  document.body.classList.toggle("night-view", enabled);
  modeToggle.setAttribute("aria-pressed", String(enabled));
  localStorage.setItem("ink-portfolio-night-view", String(enabled));
}

function renderHexagram(hexagram) {
  hexagramNode.replaceChildren();
  hexagram.lines
    .split("")
    .reverse()
    .forEach((line) => {
      const bar = document.createElement("span");
      bar.className = `hexagram-line ${line === "1" ? "solid" : "broken"}`;
      hexagramNode.append(bar);
    });
  oracleTitle.textContent = hexagram.title;
  oracleMessage.textContent = hexagram.message;
}

function drawHexagram() {
  let index = Math.floor(Math.random() * hexagrams.length);

  if (hexagrams.length > 1) {
    while (index === lastHexagramIndex) {
      index = Math.floor(Math.random() * hexagrams.length);
    }
  }

  lastHexagramIndex = index;
  renderHexagram(hexagrams[index]);
}

function setOracleOpen(open) {
  oraclePanel.classList.toggle("is-open", open);
  oraclePanel.setAttribute("aria-hidden", String(!open));
  oracleToggle.setAttribute("aria-expanded", String(open));

  if (open) {
    drawHexagram();
    oracleAgain.focus();
  } else {
    oracleToggle.focus();
  }
}

function rotateQuotes() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let index = 0;
  window.setInterval(() => {
    quoteNode.classList.add("is-fading");
    window.setTimeout(() => {
      index = (index + 1) % quotes.length;
      quoteNode.textContent = quotes[index];
      quoteNode.classList.remove("is-fading");
    }, 420);
  }, 6400);
}

modeToggle.addEventListener("click", () => {
  setNightView(!document.body.classList.contains("night-view"));
});

oracleToggle.addEventListener("click", () => {
  setOracleOpen(!oraclePanel.classList.contains("is-open"));
});

oracleClose.addEventListener("click", () => setOracleOpen(false));
oracleAgain.addEventListener("click", drawHexagram);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && oraclePanel.classList.contains("is-open")) {
    setOracleOpen(false);
  }
});

setNightView(localStorage.getItem("ink-portfolio-night-view") === "true");
renderHexagram(hexagrams[2]);
rotateQuotes();
loadWorks();
