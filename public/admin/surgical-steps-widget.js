/*
 * Decap CMS custom widget: "surgical_steps"
 *
 * One widget manages the whole "Surgical Photographs" list of a procedure:
 *
 *   - upload several photographs at once (button or drag-and-drop)
 *   - thumbnails, drag-to-reorder (plus ◀ ▶ buttons for touch/keyboard)
 *   - replace / delete individual photographs, edit each stage title
 *   - an Instagram-style editor: zoom, drag to reposition, aspect ratio,
 *     reset — shown inside the same frame the website uses
 *   - a preview of the complete chronological sequence
 *
 * Data model (unchanged shape — a YAML list of maps, in display order):
 *
 *   steps:
 *     - image: /uploads/procedures/x.jpg      # the ORIGINAL, never altered
 *       title: ...
 *       width: 4000      # original pixel size, recorded at upload
 *       height: 3000
 *       ratio: 4x3       # optional framing — all four are omitted when
 *       zoom: 1.4        #   the photo is shown "as is"
 *       focusX: 40
 *       focusY: 55
 *
 * The order of the list IS the order on the website; there is no separate
 * order field. Entries written before this widget existed (image + title
 * only) load and save unchanged.
 *
 * The framing maths below (frameLayout) and the stage CSS mirror
 * lib/framing.ts and the .photo-stage rules in app/globals.css, so what
 * the doctor sees here is what visitors see. Keep them in step.
 */
(function () {
  "use strict";

  var CMS = window.CMS;
  var h = window.h;
  var createClass = window.createClass;
  if (!CMS || !h || !createClass) {
    console.error("[surgical_steps] Decap CMS globals not found; widget not registered.");
    return;
  }

  /* ------------------------------------------------------------------ *
   * Framing maths (mirror of lib/framing.ts)
   * ------------------------------------------------------------------ */
  var RATIOS = [
    { id: "original", label: "Original" },
    // Stored as "4x3", not "4:3": YAML reads an unquoted 4:3 as a number.
    { id: "1x1", label: "1:1" },
    { id: "4x5", label: "4:5" },
    { id: "3x4", label: "3:4" },
    { id: "4x3", label: "4:3" },
    { id: "3x2", label: "3:2" },
    { id: "16x9", label: "16:9" },
  ];
  var MAX_ZOOM = 4;
  var FALLBACK_ASPECT = 4 / 3;

  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
  }
  function parseRatio(r) {
    var p = String(r).replace(":", "x").split("x");
    var w = Number(p[0]);
    var hh = Number(p[1]);
    return w > 0 && hh > 0 ? w / hh : FALLBACK_ASPECT;
  }
  // Returns numeric percentages (the website uses the same numbers as CSS %).
  function frameLayout(f) {
    var hasDims = f.width > 0 && f.height > 0;
    var imageAspect = hasDims ? f.width / f.height : null;
    var ratio = f.ratio || "original";
    var aspect = ratio === "original" ? imageAspect || FALLBACK_ASPECT : parseRatio(ratio);
    if (imageAspect === null) return { aspect: aspect, img: null, known: false };
    var zoom = clamp(f.zoom == null ? 1 : f.zoom, 1, MAX_ZOOM);
    var fx = clamp(f.focusX == null ? 50 : f.focusX, 0, 100);
    var fy = clamp(f.focusY == null ? 50 : f.focusY, 0, 100);
    var w = Math.max(1, imageAspect / aspect) * 100 * zoom;
    var hgt = Math.max(1, aspect / imageAspect) * 100 * zoom;
    return {
      aspect: aspect,
      known: true,
      img: {
        w: w,
        h: hgt,
        left: ((100 - w) * fx) / 100,
        top: ((100 - hgt) * fy) / 100,
      },
    };
  }

  /* ------------------------------------------------------------------ *
   * Small helpers
   * ------------------------------------------------------------------ */
  // Blob URLs for photographs uploaded in this browser session, so they
  // preview instantly (and before the site has been redeployed).
  var previewCache = {};
  function normaliseMediaPath(path) {
    var value = String(path || "").trim();
    if (!value) return "";
    if (/^(https?:|data:|blob:)/i.test(value)) return value;
    value = value.split("#")[0].replace(/\\/g, "/");
    value = value.replace(/^\.\//, "");
    value = value.replace(/^public\//, "");
    if (value.charAt(0) !== "/") value = "/" + value;
    return value;
  }
  function urlFor(path) {
    if (!path) return "";
    if (previewCache[path]) return previewCache[path];
    var clean = normaliseMediaPath(path);
    return /^https?:/i.test(clean) ? clean : new URL(clean, window.location.origin).href;
  }
  // A small media-library picker backed by a generated index of public/uploads.
  // This lets editors reuse repository images instead of uploading duplicates.
  function chooseExistingMedia(onChoose) {
    fetch("/api/admin/media", { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("Media index could not be loaded.");
      return r.json();
    }).then(function (items) {
      var overlay = E("div", { class: "ss-modal" });
      var panel = E("div", { class: "ss-panel" });
      var head = E("header", {}, E("div", {}, E("h3", { text: "Choose an existing image" }), E("p", { text: "Select an image already stored in this project's uploads folder." })), E("button", { class: "ss-x", type: "button", text: "×", onclick: function () { overlay.remove(); } }));
      var grid = E("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: "12px", padding: "16px", overflow: "auto" } });
      (items || []).forEach(function (item) {
        var b = E("button", { type: "button", style: { border: "1px solid #d5dde8", borderRadius: "8px", padding: "6px", background: "white", cursor: "pointer", textAlign: "left" } });
        var im = E("img", { src: urlFor(item.path), alt: "", style: { width: "100%", height: "95px", objectFit: "contain", background: "#eef2f7", borderRadius: "5px" } });
        im.onerror = function () { im.style.display = "none"; };
        b.appendChild(im);
        b.appendChild(E("span", { text: item.name, style: { display: "block", fontSize: "11px", overflowWrap: "anywhere", marginTop: "5px" } }));
        b.addEventListener("click", function () { overlay.remove(); onChoose(item.path); });
        grid.appendChild(b);
      });
      if (!items || !items.length) grid.appendChild(E("p", { text: "No images were found in public/uploads." }));
      panel.appendChild(head); panel.appendChild(grid); overlay.appendChild(panel);
      overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.remove(); });
      document.body.appendChild(overlay);
    }).catch(function (err) { window.alert(err.message || "Could not load existing images."); });
  }
  function basename(p) {
    return String(p).split("/").pop();
  }
  function toPlain(value) {
    if (!value) return [];
    if (typeof value.toJS === "function") value = value.toJS();
    return Array.isArray(value) ? value : [];
  }
  function round(n, d) {
    var m = Math.pow(10, d);
    return Math.round(n * m) / m;
  }

  function E(tag, props) {
    var el = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.indexOf("on") === 0) el.addEventListener(k.slice(2), v);
      else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? "" : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null || c === false) continue;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return el;
  }

  var ICON = {
    grip:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
    left:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    right:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    crop:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/></svg>',
    swap:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3l4 4-4 4M21 7H8M7 21l-4-4 4-4M3 17h13"/></svg>',
    trash:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>',
    play:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>',
    plus:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    upload:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>',
  };
  function icon(name) {
    var s = document.createElement("span");
    s.className = "ss-ico";
    s.innerHTML = ICON[name];
    return s;
  }

  /* ------------------------------------------------------------------ *
   * Styles (injected once)
   * ------------------------------------------------------------------ */
  var CSS = [
    ".ss{font-family:inherit;color:#1a2a3d}",
    ".ss *{box-sizing:border-box}",
    ".ss-ico{display:inline-flex;vertical-align:middle}",
    ".ss-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}",
    ".ss-bar h4{margin:0;font-size:14px;font-weight:700}",
    ".ss-bar small{font-weight:500;color:#5b6b7e}",
    ".ss-btns{display:flex;flex-wrap:wrap;gap:8px}",
    ".ss-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid #c9d3df;background:#fff;color:#1a2a3d;border-radius:8px;padding:7px 12px;font:600 13px/1 inherit;cursor:pointer;transition:background .15s,border-color .15s,color .15s}",
    ".ss-btn:hover{border-color:#ff6b35;color:#e5551f}",
    ".ss-btn:disabled{opacity:.4;cursor:not-allowed;border-color:#c9d3df;color:#1a2a3d}",
    ".ss-btn--primary{background:#ff6b35;border-color:#ff6b35;color:#fff}",
    ".ss-btn--primary:hover{background:#e5551f;border-color:#e5551f;color:#fff}",
    ".ss-btn--danger:hover{border-color:#c62828;color:#c62828}",
    ".ss-btn--icon{padding:7px 9px}",
    ".ss-drop{display:flex;flex-direction:column;align-items:center;gap:6px;padding:22px 16px;margin-bottom:14px;text-align:center;border:2px dashed #b9c6d6;border-radius:12px;background:#f6f9fc;color:#41546b;cursor:pointer;transition:border-color .15s,background .15s}",
    ".ss-drop:hover,.ss-drop.is-over{border-color:#ff6b35;background:#fff4ee}",
    ".ss-drop strong{font-size:14px;color:#1a2a3d}",
    ".ss-drop span.s{font-size:12px}",
    ".ss-note{margin:0 0 12px;font-size:12px;color:#5b6b7e}",
    ".ss-error{margin:0 0 12px;padding:9px 12px;border-radius:8px;background:#fdecea;color:#8a1c14;font-size:13px}",
    ".ss-status{margin:0 0 12px;padding:9px 12px;border-radius:8px;background:#eef4ff;color:#1d3f7a;font-size:13px}",
    ".ss-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}",
    ".ss-card{position:relative;border:1px solid #d5dde8;border-radius:12px;background:#fff;padding:8px;display:flex;flex-direction:column;gap:8px;transition:box-shadow .15s,opacity .15s}",
    ".ss-card.is-dragging{opacity:.4}",
    ".ss-card.ss-drop-before::before,.ss-card.ss-drop-after::after{content:'';position:absolute;top:-2px;bottom:-2px;width:4px;border-radius:2px;background:#ff6b35}",
    ".ss-card.ss-drop-before::before{left:-9px}.ss-card.ss-drop-after::after{right:-9px}",
    ".ss-head{display:flex;align-items:center;gap:8px}",
    ".ss-grip{display:inline-flex;align-items:center;gap:4px;padding:4px 8px 4px 4px;border-radius:6px;background:#eef2f7;color:#41546b;cursor:grab;font-size:11px;font-weight:700;user-select:none}",
    ".ss-grip:hover{background:#ffe3d6;color:#e5551f}.ss-grip:active{cursor:grabbing}",
    ".ss-num{margin-left:auto;min-width:24px;height:24px;padding:0 7px;border-radius:12px;background:#0a2647;color:#fff;font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center}",
    ".ss-thumb{display:block;width:100%;padding:0;border:0;border-radius:8px;overflow:hidden;cursor:pointer;position:relative;container-type:size;aspect-ratio:4/3;background:#06182e}",
    ".ss-thumb:focus-visible{outline:2px solid #ff6b35;outline-offset:2px}",
    ".ss-thumb .ss-hint{position:absolute;inset:auto 0 0 0;padding:14px 8px 6px;background:linear-gradient(transparent,rgba(0,0,0,.65));color:#fff;font-size:11px;font-weight:600;opacity:0;transition:opacity .15s;text-align:center}",
    ".ss-thumb:hover .ss-hint,.ss-thumb:focus-visible .ss-hint{opacity:1}",
    ".ss-frame{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);aspect-ratio:var(--a,1.3333);width:min(100cqw,calc(100cqh * var(--a,1.3333)));overflow:hidden}",
    ".ss-frame img{position:absolute;max-width:none;display:block;user-select:none;-webkit-user-drag:none}",
    ".ss-frame img.is-contain{inset:0;width:100%;height:100%;object-fit:contain}",
    ".ss-title{width:100%;border:1px solid #c9d3df;border-radius:8px;padding:8px 10px;font:500 14px/1.2 inherit;color:#1a2a3d}",
    ".ss-title:focus{outline:none;border-color:#ff6b35;box-shadow:0 0 0 3px rgba(255,107,53,.18)}",
    ".ss-title.is-empty{border-color:#e08a7a;background:#fff8f6}",
    ".ss-row{display:flex;gap:6px;flex-wrap:wrap}",
    ".ss-row .ss-btn{padding:6px 8px;font-size:12px}",
    ".ss-row .grow{flex:1;justify-content:center}",
    ".ss-badge{font-size:10px;font-weight:700;color:#a14418;background:#ffe3d6;border-radius:4px;padding:2px 6px}",
    /* modal */
    ".ss-modal{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(6,24,46,.78)}",
    ".ss-panel{background:#fff;border-radius:14px;width:min(1120px,100%);max-height:calc(100vh - 36px);overflow:auto;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.45)}",
    ".ss-panel header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-bottom:1px solid #e3e9f0}",
    ".ss-panel header h3{margin:0;font-size:16px}",
    ".ss-panel header p{margin:2px 0 0;font-size:12px;color:#5b6b7e}",
    ".ss-x{border:0;background:transparent;font-size:24px;line-height:1;cursor:pointer;color:#41546b;padding:2px 8px;border-radius:6px}.ss-x:hover{background:#eef2f7}",
    ".ss-body{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:20px;padding:18px}",
    "@media(max-width:820px){.ss-body{grid-template-columns:1fr}}",
    ".ss-side h5{margin:0 0 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#5b6b7e}",
    ".ss-side section{margin-bottom:20px}",
    ".ss-chips{display:flex;flex-wrap:wrap;gap:6px}",
    ".ss-chip{border:1px solid #c9d3df;background:#fff;border-radius:999px;padding:6px 12px;font:600 12px/1 inherit;cursor:pointer;color:#1a2a3d}",
    ".ss-chip:hover{border-color:#ff6b35}",
    ".ss-chip[aria-pressed=true]{background:#0a2647;border-color:#0a2647;color:#fff}",
    ".ss-zoom{display:flex;align-items:center;gap:8px}",
    ".ss-zoom input[type=range]{flex:1;accent-color:#ff6b35}",
    ".ss-zoom output{min-width:46px;text-align:right;font-weight:700;font-size:13px}",
    ".ss-help{font-size:12px;line-height:1.5;color:#5b6b7e;margin:0}",
    ".ss-foot{display:flex;justify-content:flex-end;gap:10px;padding:14px 18px;border-top:1px solid #e3e9f0}",
    /* the website stage, replicated */
    ".ss-pstage{position:relative;overflow:hidden;width:100%;container-type:size;aspect-ratio:var(--sa,1.3333);max-height:min(62vh,560px);background:#06182e;border-radius:12px}",
    ".ss-pstage .ss-bg{position:absolute;inset:0}",
    ".ss-pstage .ss-bg img{width:100%;height:100%;object-fit:cover;transform:scale(1.25);opacity:.5;filter:blur(28px) saturate(1.5)}",
    ".ss-pstage .ss-frame{outline:1px solid rgba(255,255,255,.35)}",
    ".ss-pstage.is-edit .ss-frame{cursor:grab;touch-action:none}",
    ".ss-pstage.is-edit .ss-frame.is-drag{cursor:grabbing}",
    ".ss-grid{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .15s;background-image:linear-gradient(to right,transparent 33.2%,rgba(255,255,255,.35) 33.3%,transparent 33.5%,transparent 66.5%,rgba(255,255,255,.35) 66.6%,transparent 66.8%),linear-gradient(to bottom,transparent 33.2%,rgba(255,255,255,.35) 33.3%,transparent 33.5%,transparent 66.5%,rgba(255,255,255,.35) 66.6%,transparent 66.8%)}",
    ".ss-frame.is-drag .ss-grid{opacity:1}",
    ".ss-cap{position:absolute;inset:auto 0 0 0;padding:34px 18px 14px;background:linear-gradient(transparent,rgba(0,0,0,.72));color:#fff;font-size:17px;font-weight:600;pointer-events:none}",
    ".ss-arrow{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;border:0;background:rgba(0,0,0,.5);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2}",
    ".ss-arrow:hover{background:#ff6b35}.ss-arrow.l{left:10px}.ss-arrow.r{right:10px}",
    ".ss-strip{display:flex;gap:8px;overflow-x:auto;padding:12px 0 2px}",
    ".ss-strip button{flex:0 0 auto;width:62px;height:62px;border:0;padding:0;border-radius:8px;overflow:hidden;position:relative;container-type:size;background:#06182e;cursor:pointer;opacity:.6;outline:2px solid transparent;outline-offset:2px}",
    ".ss-strip button.on{opacity:1;outline-color:#ff6b35}",
    ".ss-strip .ss-frame{width:max(100cqw,calc(100cqh * var(--a,1.3333)))}",
    ".ss-strip i{position:absolute;left:3px;top:3px;font:700 10px/16px inherit;background:rgba(0,0,0,.6);color:#fff;border-radius:3px;padding:0 4px;font-style:normal}",
  ].join("\n");
  (function injectStyle() {
    if (document.getElementById("ss-style")) return;
    var s = document.createElement("style");
    s.id = "ss-style";
    s.textContent = CSS;
    document.head.appendChild(s);
  })();

  /* ------------------------------------------------------------------ *
   * Frame rendering (thumbnails, editor stage, sequence preview)
   * ------------------------------------------------------------------ */
  function applyImgLayout(img, layout) {
    if (layout.img) {
      img.classList.remove("is-contain");
      img.style.width = layout.img.w + "%";
      img.style.height = layout.img.h + "%";
      img.style.left = layout.img.left + "%";
      img.style.top = layout.img.top + "%";
    } else {
      img.classList.add("is-contain");
      img.style.width = img.style.height = img.style.left = img.style.top = "";
    }
  }

  // A frame element (+ its <img>) for a step, at the size the website uses.
  function buildFrame(step) {
    var layout = frameLayout(step);
    var img = E("img", { src: urlFor(step.image), alt: "", draggable: "false" });
    var frame = E("div", { class: "ss-frame" }, img);
    frame.style.setProperty("--a", layout.aspect);
    applyImgLayout(img, layout);
    // Legacy entries have no recorded size: measure once loaded.
    if (!layout.known) {
      img.addEventListener("load", function () {
        if (img.naturalWidth && img.naturalHeight) {
          frame.style.setProperty("--a", img.naturalWidth / img.naturalHeight);
        }
      });
    }
    return { frame: frame, img: img, layout: layout };
  }

  // The website's PhotoStage: sizing box + blurred backdrop + frame.
  function buildStage(step, editable) {
    var layout = frameLayout(step);
    var stage = E("div", { class: "ss-pstage" + (editable ? " is-edit" : "") });
    var bgImg = E("img", { src: urlFor(step.image), alt: "" });
    var bg = E("div", { class: "ss-bg", "aria-hidden": "true" }, bgImg);
    var img = E("img", { src: urlFor(step.image), alt: "", draggable: "false" });
    var frame = E("div", { class: "ss-frame" }, img, E("div", { class: "ss-grid" }));
    stage.appendChild(bg);
    stage.appendChild(frame);
    function update(s) {
      var l = frameLayout(s);
      stage.style.setProperty("--sa", l.aspect);
      frame.style.setProperty("--a", l.aspect);
      applyImgLayout(img, l);
      return l;
    }
    function setSource(s) {
      bgImg.src = urlFor(s.image);
      img.src = urlFor(s.image);
    }
    update(step);
    return { stage: stage, frame: frame, img: img, update: update, setSource: setSource, layout: layout };
  }

  function loadDims(url) {
    return new Promise(function (resolve, reject) {
      var im = new Image();
      im.onload = function () {
        resolve({ width: im.naturalWidth, height: im.naturalHeight });
      };
      im.onerror = function () {
        reject(new Error("This photograph could not be loaded for preview."));
      };
      im.src = url;
    });
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var im = new Image();
      im.onload = function () {
        resolve({ url: url, width: im.naturalWidth, height: im.naturalHeight });
      };
      im.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('"' + file.name + '" could not be read as an image (use JPG, PNG or WebP).'));
      };
      im.src = url;
    });
  }

  /* ------------------------------------------------------------------ *
   * Modal: adjust a photograph
   * ------------------------------------------------------------------ */
  function openAdjust(step, onDone) {
    var ed = {
      ratio: step.ratio || "original",
      zoom: step.zoom || 1,
      focusX: step.focusX == null ? 50 : step.focusX,
      focusY: step.focusY == null ? 50 : step.focusY,
      width: step.width,
      height: step.height,
      image: step.image,
    };

    var overlay = E("div", { class: "ss-modal", role: "dialog", "aria-modal": "true", "aria-label": "Adjust photograph" });
    var panel = E("div", { class: "ss-panel" });
    overlay.appendChild(panel);

    function close() {
      document.removeEventListener("keydown", onKey, true);
      overlay.remove();
    }
    function onKey(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    }
    document.addEventListener("keydown", onKey, true);
    overlay.addEventListener("mousedown", function (e) {
      if (e.target === overlay) close();
    });

    panel.appendChild(
      E(
        "header",
        {},
        E("div", {}, E("h3", { text: "Adjust photograph" }), E("p", { text: "Drag to reposition · scroll or use the slider to zoom. The original file is never changed." })),
        E("button", { class: "ss-x", type: "button", "aria-label": "Close", text: "×", onclick: close })
      )
    );
    var body = E("div", { class: "ss-body" }, E("p", { class: "ss-help", text: "Loading photograph…" }));
    panel.appendChild(body);
    document.body.appendChild(overlay);

    function start() {
      body.innerHTML = "";
      var built = buildStage(ed, true);
      var stage = built.stage;
      var zoomInput, zoomOut, chipButtons = {};

      function refresh() {
        built.update(ed);
        if (zoomInput) {
          zoomInput.value = ed.zoom;
          zoomOut.textContent = Math.round(ed.zoom * 100) + "%";
        }
        Object.keys(chipButtons).forEach(function (id) {
          chipButtons[id].setAttribute("aria-pressed", String(ed.ratio === id));
        });
      }

      // Zoom about the centre of the frame, so the part you're looking at
      // stays put.
      function setZoom(z1) {
        z1 = clamp(z1, 1, MAX_ZOOM);
        if (z1 === ed.zoom) return;
        var L0 = frameLayout(ed);
        var u = (50 - L0.img.left) / L0.img.w;
        var v = (50 - L0.img.top) / L0.img.h;
        var probe = frameLayout({ ratio: ed.ratio, zoom: z1, focusX: 50, focusY: 50, width: ed.width, height: ed.height });
        var left1 = 50 - u * probe.img.w;
        var top1 = 50 - v * probe.img.h;
        var rx = 100 - probe.img.w;
        var ry = 100 - probe.img.h;
        ed.zoom = z1;
        ed.focusX = rx < -0.0001 ? clamp((left1 / rx) * 100, 0, 100) : 50;
        ed.focusY = ry < -0.0001 ? clamp((top1 / ry) * 100, 0, 100) : 50;
        refresh();
      }

      // ---- drag to reposition (mouse, pen, touch) + pinch zoom ----
      var pointers = {};
      var drag = null;
      var pinch = null;
      built.frame.addEventListener("pointerdown", function (e) {
        built.frame.setPointerCapture(e.pointerId);
        pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
        var ids = Object.keys(pointers);
        if (ids.length === 2) {
          var a = pointers[ids[0]], b = pointers[ids[1]];
          pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: ed.zoom };
          drag = null;
        } else {
          drag = { x: e.clientX, y: e.clientY, fx: ed.focusX, fy: ed.focusY };
          built.frame.classList.add("is-drag");
        }
      });
      built.frame.addEventListener("pointermove", function (e) {
        if (!pointers[e.pointerId]) return;
        pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
        var ids = Object.keys(pointers);
        if (ids.length === 2 && pinch) {
          var a = pointers[ids[0]], b = pointers[ids[1]];
          setZoom(pinch.z * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.d));
          return;
        }
        if (!drag) return;
        var L = frameLayout(ed);
        var rect = built.frame.getBoundingClientRect();
        var ox = rect.width * (1 - L.img.w / 100);
        var oy = rect.height * (1 - L.img.h / 100);
        if (ox < -0.5) ed.focusX = clamp(drag.fx + ((e.clientX - drag.x) / ox) * 100, 0, 100);
        if (oy < -0.5) ed.focusY = clamp(drag.fy + ((e.clientY - drag.y) / oy) * 100, 0, 100);
        refresh();
      });
      function endPointer(e) {
        delete pointers[e.pointerId];
        var ids = Object.keys(pointers);
        if (ids.length < 2) pinch = null;
        if (ids.length === 0) {
          drag = null;
          built.frame.classList.remove("is-drag");
        } else if (ids.length === 1) {
          var p = pointers[ids[0]];
          drag = { x: p.x, y: p.y, fx: ed.focusX, fy: ed.focusY };
        }
      }
      built.frame.addEventListener("pointerup", endPointer);
      built.frame.addEventListener("pointercancel", endPointer);
      stage.addEventListener(
        "wheel",
        function (e) {
          e.preventDefault();
          setZoom(ed.zoom * Math.exp(-e.deltaY * 0.0015));
        },
        { passive: false }
      );
      // Keyboard: arrows pan, + / − zoom.
      stage.tabIndex = 0;
      stage.setAttribute("aria-label", "Photograph editor. Arrow keys move the photograph; plus and minus zoom.");
      stage.addEventListener("keydown", function (e) {
        var step = 2;
        if (e.key === "ArrowLeft") ed.focusX = clamp(ed.focusX + step, 0, 100);
        else if (e.key === "ArrowRight") ed.focusX = clamp(ed.focusX - step, 0, 100);
        else if (e.key === "ArrowUp") ed.focusY = clamp(ed.focusY + step, 0, 100);
        else if (e.key === "ArrowDown") ed.focusY = clamp(ed.focusY - step, 0, 100);
        else if (e.key === "+" || e.key === "=") return (e.preventDefault(), setZoom(ed.zoom + 0.1));
        else if (e.key === "-") return (e.preventDefault(), setZoom(ed.zoom - 0.1));
        else return;
        e.preventDefault();
        refresh();
      });

      // ---- side controls ----
      var chips = E("div", { class: "ss-chips" });
      RATIOS.forEach(function (r) {
        var b = E("button", {
          type: "button",
          class: "ss-chip",
          "aria-pressed": String(ed.ratio === r.id),
          text: r.label,
          onclick: function () {
            ed.ratio = r.id;
            refresh();
          },
        });
        chipButtons[r.id] = b;
        chips.appendChild(b);
      });

      zoomInput = E("input", {
        type: "range",
        min: "1",
        max: String(MAX_ZOOM),
        step: "0.01",
        value: String(ed.zoom),
        "aria-label": "Zoom",
        oninput: function (e) {
          setZoom(Number(e.target.value));
        },
      });
      zoomOut = E("output", { text: Math.round(ed.zoom * 100) + "%" });
      var zoomRow = E(
        "div",
        { class: "ss-zoom" },
        E("button", { type: "button", class: "ss-btn ss-btn--icon", "aria-label": "Zoom out", text: "−", onclick: function () { setZoom(ed.zoom - 0.25); } }),
        zoomInput,
        E("button", { type: "button", class: "ss-btn ss-btn--icon", "aria-label": "Zoom in", text: "+", onclick: function () { setZoom(ed.zoom + 0.25); } }),
        zoomOut
      );

      var side = E(
        "div",
        { class: "ss-side" },
        E("section", {}, E("h5", { text: "Shape" }), chips, E("p", { class: "ss-help", style: { marginTop: "8px" }, text: "“Original” keeps the photograph’s own proportions — nothing is cut off." })),
        E("section", {}, E("h5", { text: "Zoom" }), zoomRow),
        E(
          "section",
          {},
          E("button", {
            type: "button",
            class: "ss-btn",
            text: "Reset",
            onclick: function () {
              ed.ratio = "original";
              ed.zoom = 1;
              ed.focusX = 50;
              ed.focusY = 50;
              refresh();
            },
          })
        ),
        E("p", { class: "ss-help", text: "The picture on the left is shown inside the same frame visitors see on the website." })
      );

      body.appendChild(E("div", {}, stage));
      body.appendChild(side);
      refresh();

      var done = E("button", {
        type: "button",
        class: "ss-btn ss-btn--primary",
        text: "Done",
        onclick: function () {
          onDone({ ratio: ed.ratio, zoom: ed.zoom, focusX: ed.focusX, focusY: ed.focusY, width: ed.width, height: ed.height });
          close();
        },
      });
      panel.appendChild(
        E("div", { class: "ss-foot" }, E("button", { type: "button", class: "ss-btn", text: "Cancel", onclick: close }), done)
      );
      done.focus();
    }

    if (ed.width > 0 && ed.height > 0) start();
    else
      loadDims(urlFor(ed.image)).then(
        function (d) {
          ed.width = d.width;
          ed.height = d.height;
          start();
        },
        function (err) {
          body.innerHTML = "";
          body.appendChild(E("p", { class: "ss-error", text: err.message + " If it was only just saved, wait for the site to finish publishing and try again." }));
        }
      );
  }

  /* ------------------------------------------------------------------ *
   * Modal: preview the whole chronological sequence
   * ------------------------------------------------------------------ */
  function openSequence(steps, startIndex) {
    var i = clamp(startIndex || 0, 0, steps.length - 1);
    var overlay = E("div", { class: "ss-modal", role: "dialog", "aria-modal": "true", "aria-label": "Sequence preview" });
    var panel = E("div", { class: "ss-panel" });
    overlay.appendChild(panel);
    function close() {
      document.removeEventListener("keydown", onKey, true);
      overlay.remove();
    }
    function onKey(e) {
      if (e.key === "Escape") (e.stopPropagation(), close());
      else if (e.key === "ArrowRight") go(i + 1);
      else if (e.key === "ArrowLeft") go(i - 1);
    }
    document.addEventListener("keydown", onKey, true);
    overlay.addEventListener("mousedown", function (e) {
      if (e.target === overlay) close();
    });

    panel.appendChild(
      E(
        "header",
        {},
        E("div", {}, E("h3", { text: "Preview: chronological sequence" }), E("p", { text: "Exactly the order and framing visitors will see. Use ← → to step through." })),
        E("button", { class: "ss-x", type: "button", "aria-label": "Close", text: "×", onclick: close })
      )
    );
    var built = buildStage(steps[i], false);
    var cap = E("div", { class: "ss-cap" });
    var prev = E("button", { class: "ss-arrow l", type: "button", "aria-label": "Previous", onclick: function () { go(i - 1); } });
    prev.appendChild(icon("left"));
    var next = E("button", { class: "ss-arrow r", type: "button", "aria-label": "Next", onclick: function () { go(i + 1); } });
    next.appendChild(icon("right"));
    built.stage.appendChild(cap);
    built.stage.appendChild(prev);
    built.stage.appendChild(next);

    var strip = E("div", { class: "ss-strip" });
    var thumbs = steps.map(function (s, idx) {
      var t = buildFrame(s);
      var b = E("button", { type: "button", "aria-label": "Step " + (idx + 1) + ": " + (s.title || "untitled"), onclick: function () { go(idx); } }, t.frame, E("i", { text: String(idx + 1) }));
      strip.appendChild(b);
      return b;
    });

    function go(n) {
      i = clamp(n, 0, steps.length - 1);
      built.setSource(steps[i]);
      built.update(steps[i]);
      cap.textContent = steps[i].title || "(no title yet)";
      prev.style.display = i === 0 ? "none" : "";
      next.style.display = i === steps.length - 1 ? "none" : "";
      thumbs.forEach(function (b, idx) {
        b.classList.toggle("on", idx === i);
      });
      thumbs[i].scrollIntoView({ block: "nearest", inline: "center" });
    }
    panel.appendChild(E("div", { class: "ss-body", style: { gridTemplateColumns: "1fr" } }, E("div", {}, built.stage, strip)));
    document.body.appendChild(overlay);
    go(i);
  }

  /* ------------------------------------------------------------------ *
   * The list manager
   * ------------------------------------------------------------------ */
  function App(host, getProps) {
    this.host = host;
    this.getProps = getProps;
    this.steps = [];
    this.lastEmitted = null;
    this.idSeq = 1;
    this.message = null; // { kind: 'error'|'status', text }
    this.busy = false;
    this.dragFrom = null;
    this.root = E("div", { class: "ss" });
    host.appendChild(this.root);
    this.fileInput = E("input", { type: "file", accept: "image/jpeg,image/png,image/webp,image/*", multiple: "multiple", style: { display: "none" } });
    this.replaceInput = E("input", { type: "file", accept: "image/*", style: { display: "none" } });
    host.appendChild(this.fileInput);
    host.appendChild(this.replaceInput);
    var self = this;
    this.fileInput.addEventListener("change", function () {
      var files = Array.prototype.slice.call(self.fileInput.files);
      self.fileInput.value = "";
      self.addFiles(files);
    });
    this.setValue(getProps().value);
  }

  App.prototype.cleanStep = function (s) {
    var out = { image: s.image, title: s.title || "" };
    if (s.width > 0 && s.height > 0) {
      out.width = s.width;
      out.height = s.height;
    }
    var ratio = s.ratio && s.ratio !== "original" ? s.ratio : null;
    var zoom = s.zoom > 1.0001 ? round(clamp(s.zoom, 1, MAX_ZOOM), 2) : null;
    var fx = s.focusX == null ? 50 : s.focusX;
    var fy = s.focusY == null ? 50 : s.focusY;
    var moved = Math.abs(fx - 50) > 0.05 || Math.abs(fy - 50) > 0.05;
    if (ratio) out.ratio = ratio;
    if (zoom) out.zoom = zoom;
    if (moved && (zoom || ratio)) {
      out.focusX = round(clamp(fx, 0, 100), 1);
      out.focusY = round(clamp(fy, 0, 100), 1);
    }
    return out;
  };

  App.prototype.emit = function () {
    var self = this;
    var out = this.steps.map(function (s) {
      return self.cleanStep(s);
    });
    this.lastEmitted = JSON.stringify(out);
    this.getProps().onChange(out);
  };

  // Called on every Decap re-render; only rebuilds when the value changed
  // from OUTSIDE this widget (e.g. entry loaded, draft restored).
  App.prototype.setValue = function (value) {
    var arr = toPlain(value);
    var self = this;
    var json = JSON.stringify(
      arr.map(function (s) {
        return self.cleanStep(s);
      })
    );
    if (json === this.lastEmitted) return;
    this.lastEmitted = json;
    this.steps = arr.map(function (s) {
      var o = Object.assign({}, s);
      o._id = self.idSeq++;
      return o;
    });
    this.render();
  };

  App.prototype.validate = function () {
    if (this.steps.length === 0) {
      return { error: { message: "Add at least one surgical photograph." } };
    }
    for (var i = 0; i < this.steps.length; i++) {
      if (!this.steps[i].image) return { error: { message: "Photograph " + (i + 1) + " has no image." } };
      if (!String(this.steps[i].title || "").trim()) {
        return { error: { message: "Photograph " + (i + 1) + " needs a step title." } };
      }
    }
    return true;
  };

  App.prototype.publicPath = function (repoPath) {
    var p = this.getProps();
    var folder =
      (p.collection && p.collection.get && p.collection.get("public_folder")) ||
      (p.config && p.config.get && p.config.get("public_folder")) ||
      "/uploads";
    folder = String(folder).replace(/\/+$/, "");
    if (folder.charAt(0) !== "/" && !/^https?:/.test(folder)) folder = "/" + folder;
    var clean = String(repoPath || "").replace(/^\/+/, "");
    var marker = clean.indexOf("uploads/");
    if (marker >= 0) return "/" + clean.slice(marker);
    return folder + "/" + basename(clean);
  };

  // Hand the file to Decap's own media pipeline: it is stored with the
  // entry and committed (GitHub) / written (local backend) when saved.
  App.prototype.persist = function (file) {
    var self = this;
    var p = this.getProps();
    return Promise.resolve(p.onPersistMedia(file, { field: p.field })).then(function (action) {
      if (!action) throw new Error("Upload cancelled.");
      var mf = action.payload || action;
      var path = mf.path || mf.name;
      if (!path) throw new Error("Upload failed.");
      return self.publicPath(path);
    });
  };

  App.prototype.setMessage = function (kind, text) {
    this.message = text ? { kind: kind, text: text } : null;
    this.renderMessage();
  };

  App.prototype.addFiles = function (files) {
    var self = this;
    files = files.filter(function (f) {
      return /^image\//.test(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name);
    });
    if (!files.length) {
      this.setMessage("error", "Please choose image files (JPG, PNG or WebP).");
      return Promise.resolve();
    }
    var errors = [];
    var chain = Promise.resolve();
    this.busy = true;
    files.forEach(function (file, n) {
      chain = chain.then(function () {
        self.setMessage("status", "Uploading photograph " + (n + 1) + " of " + files.length + "…");
        return readFile(file)
          .then(function (info) {
            return self.persist(file).then(function (path) {
              previewCache[path] = info.url;
              self.steps.push({ _id: self.idSeq++, image: path, title: "", width: info.width, height: info.height });
              self.emit();
              self.renderList();
            });
          })
          .catch(function (err) {
            errors.push(err && err.message ? err.message : String(err));
          });
      });
    });
    return chain.then(function () {
      self.busy = false;
      if (errors.length) self.setMessage("error", errors.join(" "));
      else self.setMessage(null);
      self.render();
    });
  };

  App.prototype.replace = function (index) {
    var self = this;
    var input = this.replaceInput;
    function onChange() {
      input.removeEventListener("change", onChange);
      var file = input.files && input.files[0];
      input.value = "";
      if (!file) return;
      self.setMessage("status", "Replacing photograph " + (index + 1) + "…");
      readFile(file)
        .then(function (info) {
          return self.persist(file).then(function (path) {
            previewCache[path] = info.url;
            var s = self.steps[index];
            // A different photograph: keep the title, start framing afresh.
            s.image = path;
            s.width = info.width;
            s.height = info.height;
            delete s.ratio;
            delete s.zoom;
            delete s.focusX;
            delete s.focusY;
            self.emit();
            self.setMessage(null);
            self.render();
          });
        })
        .catch(function (err) {
          self.setMessage("error", err && err.message ? err.message : String(err));
        });
    }
    input.addEventListener("change", onChange);
    input.click();
  };

  App.prototype.move = function (from, to) {
    if (to < 0 || to >= this.steps.length || from === to) return;
    var item = this.steps.splice(from, 1)[0];
    this.steps.splice(to, 0, item);
    this.emit();
    this.renderList();
  };

  App.prototype.remove = function (index) {
    var s = this.steps[index];
    var label = s.title ? "“" + s.title + "”" : "photograph " + (index + 1);
    if (!window.confirm("Remove " + label + " from this procedure?\n\nThe uploaded file itself is kept in the media library.")) return;
    this.steps.splice(index, 1);
    this.emit();
    this.render();
  };

  App.prototype.adjust = function (index) {
    var self = this;
    var s = this.steps[index];
    openAdjust(s, function (result) {
      s.ratio = result.ratio;
      s.zoom = result.zoom;
      s.focusX = result.focusX;
      s.focusY = result.focusY;
      s.width = result.width;
      s.height = result.height;
      self.emit();
      self.renderList();
    });
  };

  App.prototype.renderMessage = function () {
    if (!this.msgEl) return;
    this.msgEl.innerHTML = "";
    if (this.message) {
      this.msgEl.appendChild(E("p", { class: this.message.kind === "error" ? "ss-error" : "ss-status", role: this.message.kind === "error" ? "alert" : "status", text: this.message.text }));
    }
  };

  App.prototype.renderList = function () {
    var self = this;
    var list = this.listEl;
    list.innerHTML = "";
    this.countEl.textContent = this.steps.length ? " (" + this.steps.length + ")" : "";
    this.previewBtn.disabled = this.steps.length === 0;

    this.steps.forEach(function (s, i) {
      var card = E("div", { class: "ss-card", "data-i": String(i) });

      var grip = E("span", { class: "ss-grip", title: "Drag to change the order", role: "img", "aria-label": "Drag handle: drag to change the order" });
      grip.appendChild(icon("grip"));
      grip.appendChild(document.createTextNode("Drag"));
      grip.addEventListener("mousedown", function () {
        card.draggable = true;
      });
      grip.addEventListener("mouseup", function () {
        card.draggable = false;
      });
      card.addEventListener("dragstart", function (e) {
        if (!card.draggable) {
          e.preventDefault();
          return;
        }
        self.dragFrom = i;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", "step-" + i);
        card.classList.add("is-dragging");
      });
      card.addEventListener("dragend", function () {
        self.dragFrom = null;
        card.draggable = false;
        card.classList.remove("is-dragging");
        self.clearDropMarks();
      });
      card.addEventListener("dragover", function (e) {
        if (self.dragFrom == null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        var rect = card.getBoundingClientRect();
        var before = e.clientX < rect.left + rect.width / 2;
        self.clearDropMarks();
        card.classList.add(before ? "ss-drop-before" : "ss-drop-after");
      });
      card.addEventListener("drop", function (e) {
        if (self.dragFrom == null) return;
        e.preventDefault();
        var rect = card.getBoundingClientRect();
        var before = e.clientX < rect.left + rect.width / 2;
        var from = self.dragFrom;
        var to = before ? i : i + 1;
        if (from < to) to -= 1;
        self.dragFrom = null;
        self.clearDropMarks();
        self.move(from, to);
      });

      var head = E("div", { class: "ss-head" }, grip, !(s.width > 0) ? E("span", { class: "ss-badge", text: "Not framed" }) : null, E("span", { class: "ss-num", title: "Position on the website", text: String(i + 1) }));

      var built = buildFrame(s);
      var thumb = E(
        "button",
        { type: "button", class: "ss-thumb", "aria-label": "Adjust photograph " + (i + 1), onclick: function () { self.adjust(i); } },
        built.frame,
        E("span", { class: "ss-hint", text: "Click to zoom, reposition or crop" })
      );

      var title = E("input", {
        type: "text",
        class: "ss-title" + (String(s.title || "").trim() ? "" : " is-empty"),
        value: s.title || "",
        placeholder: "Title for this stage",
        "aria-label": "Step title for photograph " + (i + 1),
      });
      title.addEventListener("input", function () {
        s.title = title.value;
        title.classList.toggle("is-empty", !title.value.trim());
        self.emit();
      });

      function mini(label, ic, fn, extra, disabled) {
        var b = E("button", { type: "button", class: "ss-btn " + (extra || ""), onclick: fn, title: label, "aria-label": label });
        b.appendChild(ic);
        if (extra && extra.indexOf("grow") >= 0) b.appendChild(document.createTextNode(label));
        if (disabled) b.disabled = true;
        return b;
      }
      var row1 = E(
        "div",
        { class: "ss-row" },
        mini("Move earlier", icon("left"), function () { self.move(i, i - 1); }, "", i === 0),
        mini("Move later", icon("right"), function () { self.move(i, i + 1); }, "", i === self.steps.length - 1),
        mini("Adjust", icon("crop"), function () { self.adjust(i); }, "grow"),
        mini("Replace", icon("swap"), function () { self.replace(i); }, "grow")
      );
      var row2 = E("div", { class: "ss-row" }, mini("Delete", icon("trash"), function () { self.remove(i); }, "ss-btn--danger grow"));

      card.appendChild(head);
      card.appendChild(thumb);
      card.appendChild(title);
      card.appendChild(row1);
      card.appendChild(row2);
      list.appendChild(card);
    });
  };

  App.prototype.clearDropMarks = function () {
    Array.prototype.forEach.call(this.listEl.querySelectorAll(".ss-drop-before,.ss-drop-after"), function (n) {
      n.classList.remove("ss-drop-before", "ss-drop-after");
    });
  };

  App.prototype.render = function () {
    var self = this;
    var root = this.root;
    root.innerHTML = "";

    this.countEl = E("small", {});
    this.previewBtn = E("button", { type: "button", class: "ss-btn", onclick: function () { if (self.steps.length) openSequence(self.steps.map(function (s) { return Object.assign({}, s); }), 0); } });
    this.previewBtn.appendChild(icon("play"));
    this.previewBtn.appendChild(document.createTextNode("Preview sequence"));
    var addBtn = E("button", { type: "button", class: "ss-btn ss-btn--primary", onclick: function () { self.fileInput.click(); } });
    addBtn.appendChild(icon("plus"));
    addBtn.appendChild(document.createTextNode("Add photographs"));
    var browseBtn = E("button", { type: "button", class: "ss-btn", text: "Browse existing images", onclick: function () {
      chooseExistingMedia(function (path) {
        var img = new Image();
        img.onload = function () { self.steps.push({ _id: self.idSeq++, image: path, title: "", width: img.naturalWidth, height: img.naturalHeight }); self.emit(); self.render(); };
        img.onerror = function () { self.setMessage("error", "That image could not be loaded: " + path); };
        img.src = urlFor(path);
      });
    } });

    root.appendChild(
      E("div", { class: "ss-bar" }, E("h4", {}, "Photographs, in order", this.countEl), E("div", { class: "ss-btns" }, this.previewBtn, browseBtn, addBtn))
    );

    this.msgEl = E("div", {});
    root.appendChild(this.msgEl);

    var drop = E("div", { class: "ss-drop", tabindex: "0", role: "button", "aria-label": "Upload photographs" });
    var dropIcon = E("span", {});
    dropIcon.appendChild(icon("upload"));
    drop.appendChild(dropIcon);
    drop.appendChild(E("strong", { text: this.steps.length ? "Drop more photographs here, or click to upload" : "Drop photographs here, or click to upload" }));
    drop.appendChild(E("span", { class: "s", text: "You can choose several at once. Each one becomes a stage, in the order shown below." }));
    drop.addEventListener("click", function () { self.fileInput.click(); });
    drop.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        self.fileInput.click();
      }
    });
    drop.addEventListener("dragover", function (e) {
      if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") >= 0) {
        e.preventDefault();
        drop.classList.add("is-over");
      }
    });
    drop.addEventListener("dragleave", function () { drop.classList.remove("is-over"); });
    drop.addEventListener("drop", function (e) {
      drop.classList.remove("is-over");
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        e.preventDefault();
        self.addFiles(Array.prototype.slice.call(e.dataTransfer.files));
      }
    });
    root.appendChild(drop);

    if (this.steps.length) {
      root.appendChild(E("p", { class: "ss-note", text: "Drag the ⠿ handle to reorder (or use the ◀ ▶ buttons). Click a photo to zoom, reposition or crop it. The numbers are the order shown on the website." }));
    }

    this.listEl = E("div", { class: "ss-list" });
    root.appendChild(this.listEl);
    this.renderMessage();
    this.renderList();
  };

  /* ------------------------------------------------------------------ *
   * Decap control
   * ------------------------------------------------------------------ */
  var Control = createClass({
    componentDidMount: function () {
      var self = this;
      this.app = new App(this.host, function () {
        return self.props;
      });
    },
    componentDidUpdate: function () {
      if (this.app) this.app.setValue(this.props.value);
    },
    isValid: function () {
      return this.app ? this.app.validate() : true;
    },
    render: function () {
      var self = this;
      return h("div", {
        className: "ss-host",
        ref: function (el) {
          self.host = el;
        },
      });
    },
  });


  /* ------------------------------------------------------------------ *
   * Widget 2: "framed_image" — one image field with a crop editor locked
   * to the placeholder it is shown in (config: aspect, also).
   *
   * Value: "/uploads/x.jpg" or "/uploads/x.jpg#f=zoom,focusX,focusY".
   * The original upload is never modified; the website applies the crop
   * with CSS (see components/ui/FitImage.tsx, lib/imageFraming.ts).
   * ------------------------------------------------------------------ */
  var FI_CSS = [
    ".fi{font-family:inherit;color:#1a2a3d}.fi *{box-sizing:border-box}",
    ".fi-frame{position:relative;overflow:hidden;background:#06182e;border-radius:8px;aspect-ratio:var(--a,1.3333);width:100%}",
    ".fi-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;user-select:none;-webkit-user-drag:none;pointer-events:none}",
    ".fi-main{max-width:460px;cursor:grab;touch-action:none;outline:1px solid #c9d3df}.fi-main.is-drag{cursor:grabbing}",
    ".fi-main .ss-grid{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .15s;background-image:linear-gradient(to right,transparent 33.2%,rgba(255,255,255,.4) 33.3%,transparent 33.5%,transparent 66.5%,rgba(255,255,255,.4) 66.6%,transparent 66.8%),linear-gradient(to bottom,transparent 33.2%,rgba(255,255,255,.4) 33.3%,transparent 33.5%,transparent 66.5%,rgba(255,255,255,.4) 66.6%,transparent 66.8%)}",
    ".fi-main.is-drag .ss-grid{opacity:1}",
    ".fi-tools{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px;max-width:460px}",
    ".fi-tools .ss-zoom{flex:1 1 220px}",
    ".fi-also{display:flex;flex-wrap:wrap;gap:14px;margin-top:14px}",
    ".fi-also figure{margin:0;width:150px}.fi-also figcaption{font-size:11px;color:#5b6b7e;margin-top:4px}",
    ".fi-also .fi-frame{outline:1px solid #d5dde8}",
    ".fi-empty{max-width:460px}"
  ].join("\n");
  (function () {
    if (document.getElementById("fi-style")) return;
    var st = document.createElement("style");
    st.id = "fi-style";
    st.textContent = FI_CSS;
    document.head.appendChild(st);
  })();

  function fiParse(value) {
    var v = String(value || "");
    var i = v.indexOf("#f=");
    if (i === -1) return { path: v, z: 1, fx: 50, fy: 50 };
    var p = v.slice(i + 3).split(",").map(Number);
    var ok = p.length === 3 && p.every(function (n) { return isFinite(n); });
    return { path: v.slice(0, i), z: ok ? clamp(p[0], 1, MAX_ZOOM) : 1, fx: ok ? clamp(p[1], 0, 100) : 50, fy: ok ? clamp(p[2], 0, 100) : 50 };
  }
  function fiFormat(st) {
    if (!st.path) return "";
    if (st.z <= 1.0001 && Math.abs(st.fx - 50) < 0.05 && Math.abs(st.fy - 50) < 0.05) return st.path;
    return st.path + "#f=" + round(st.z, 2) + "," + round(st.fx, 1) + "," + round(st.fy, 1);
  }
  function fiAspect(str, fallback) {
    var p = String(str || "").replace(":", "x").split("x");
    var a = Number(p[0]) / Number(p[1]);
    return a > 0 && isFinite(a) ? a : fallback;
  }

  function FramedApp(host, getProps) {
    this.host = host;
    this.getProps = getProps;
    this.st = { path: "", z: 1, fx: 50, fy: 50 };
    this.last = null;
    this.root = E("div", { class: "fi" });
    host.appendChild(this.root);
    var self = this;
    this.input = E("input", { type: "file", accept: "image/*", style: { display: "none" } });
    host.appendChild(this.input);
    this.input.addEventListener("change", function () {
      var f = self.input.files && self.input.files[0];
      self.input.value = "";
      if (f) self.upload(f);
    });
    this.setValue(getProps().value);
  }
  FramedApp.prototype.field = function (k) {
    var f = this.getProps().field;
    return f && f.get ? f.get(k) : undefined;
  };
  FramedApp.prototype.emit = function () {
    var v = fiFormat(this.st);
    this.last = v;
    this.getProps().onChange(v);
  };
  FramedApp.prototype.setValue = function (value) {
    var v = String(value || "");
    if (v === this.last) return;
    this.last = v;
    this.st = fiParse(v);
    this.render();
  };
  FramedApp.prototype.publicPath = function (repoPath) {
    var p = this.getProps();
    var folder =
      (p.field && p.field.get && p.field.get("public_folder")) ||
      (p.collection && p.collection.get && p.collection.get("public_folder")) ||
      (p.config && p.config.get && p.config.get("public_folder")) ||
      "/uploads";
    folder = String(folder).replace(/\/+$/, "");
    if (folder.charAt(0) !== "/" && !/^https?:/.test(folder)) folder = "/" + folder;
    var clean = String(repoPath || "").replace(/^\/+/, "");
    var marker = clean.indexOf("uploads/");
    if (marker >= 0) return "/" + clean.slice(marker);
    return folder + "/" + basename(clean);
  };
  FramedApp.prototype.upload = function (file) {
    var self = this;
    var p = this.getProps();
    this.setMsg("status", "Uploading…");
    readFile(file)
      .then(function (info) {
        return Promise.resolve(p.onPersistMedia(file, { field: p.field })).then(function (action) {
          if (!action) throw new Error("Upload cancelled.");
          var mf = action.payload || action;
          var path = self.publicPath(mf.path || mf.name);
          previewCache[path] = info.url;
          self.st = { path: path, z: 1, fx: 50, fy: 50 };
          self.emit();
          self.render();
        });
      })
      .catch(function (err) {
        self.setMsg("error", err && err.message ? err.message : String(err));
      });
  };
  FramedApp.prototype.setMsg = function (kind, text) {
    if (!this.msg) return;
    this.msg.innerHTML = "";
    if (text) this.msg.appendChild(E("p", { class: kind === "error" ? "ss-error" : "ss-status", text: text }));
  };
  // Same CSS the website uses: cover + object-position + scale about the focus.
  FramedApp.prototype.paint = function (img) {
    var s = this.st;
    img.style.objectPosition = s.fx + "% " + s.fy + "%";
    img.style.transformOrigin = s.fx + "% " + s.fy + "%";
    img.style.transform = s.z > 1.0001 ? "scale(" + s.z + ")" : "";
  };
  FramedApp.prototype.render = function () {
    var self = this;
    var root = this.root;
    root.innerHTML = "";
    this.msg = E("div", {});
    root.appendChild(this.msg);
    var st = this.st;

    if (!st.path) {
      var pick = E("button", { type: "button", class: "ss-btn ss-btn--primary", onclick: function () { self.input.click(); } });
      pick.appendChild(icon("upload"));
      pick.appendChild(document.createTextNode("Choose image"));
      var zone = E("div", { class: "ss-drop fi-empty", onclick: function () { self.input.click(); } }, E("strong", { text: "Click to upload, or drop an image here" }), E("span", { class: "s", text: "You will choose exactly how it is cropped next." }));
      var browse = E("button", { type: "button", class: "ss-btn", text: "Browse existing images", style: { marginTop: "8px" }, onclick: function () { chooseExistingMedia(function (path) { self.st = { path: path, z: 1, fx: 50, fy: 50 }; self.emit(); self.render(); }); } });
      zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.classList.add("is-over"); });
      zone.addEventListener("dragleave", function () { zone.classList.remove("is-over"); });
      zone.addEventListener("drop", function (e) {
        e.preventDefault();
        zone.classList.remove("is-over");
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) self.upload(f);
      });
      root.appendChild(zone);
      root.appendChild(browse);
      return;
    }

    var mainA = fiAspect(this.field("aspect"), 4 / 3);
    var url = urlFor(st.path);
    var main = E("div", { class: "fi-frame fi-main" }, E("img", { src: url, alt: "", draggable: "false" }), E("div", { class: "ss-grid" }));
    main.style.setProperty("--a", mainA);
    var mainImg = main.querySelector("img");
    mainImg.onerror = function () { self.setMsg("error", "Image preview could not load: " + st.path + ". Check that the file exists in public/uploads and that its path starts with /uploads/."); };
    mainImg.onload = function () { self.setMsg("status", "Image loaded. Drag to reposition, use the slider to zoom, or reset the crop."); };
    var alsoImgs = [];
    var also = E("div", { class: "fi-also" });
    String(this.field("also") || "").split(",").forEach(function (a) {
      a = a.trim();
      if (!a) return;
      var im = E("img", { src: url, alt: "", draggable: "false" });
      var fr = E("div", { class: "fi-frame" }, im);
      fr.style.setProperty("--a", fiAspect(a, 4 / 3));
      also.appendChild(E("figure", {}, fr, E("figcaption", { text: "Also shown as " + a.replace("x", ":") })));
      alsoImgs.push(im);
    });

    function paintAll() {
      self.paint(mainImg);
      alsoImgs.forEach(function (im) { self.paint(im); });
      zoomInput.value = self.st.z;
      zoomOut.textContent = Math.round(self.st.z * 100) + "%";
    }
    // Geometry (px) of the picture inside the main frame at the current zoom.
    function geom() {
      var r = main.getBoundingClientRect();
      var I = mainImg.naturalWidth && mainImg.naturalHeight ? mainImg.naturalWidth / mainImg.naturalHeight : mainA;
      var Wc = r.width * Math.max(1, I / mainA);
      var Hc = r.height * Math.max(1, mainA / I);
      return { Bw: r.width, Bh: r.height, Wd: Wc * self.st.z, Hd: Hc * self.st.z, Wc: Wc, Hc: Hc };
    }
    function setZoom(z1) {
      z1 = clamp(z1, 1, MAX_ZOOM);
      var g = geom();
      var s = self.st;
      var u = (0.5 * g.Bw - (s.fx / 100) * (g.Bw - g.Wd)) / g.Wd;
      var v = (0.5 * g.Bh - (s.fy / 100) * (g.Bh - g.Hd)) / g.Hd;
      var Wd1 = g.Wc * z1, Hd1 = g.Hc * z1;
      var ox = g.Bw - Wd1, oy = g.Bh - Hd1;
      s.z = z1;
      s.fx = ox < -0.001 ? clamp(((0.5 * g.Bw - u * Wd1) / ox) * 100, 0, 100) : 50;
      s.fy = oy < -0.001 ? clamp(((0.5 * g.Bh - v * Hd1) / oy) * 100, 0, 100) : 50;
      paintAll();
      self.emit();
    }

    var pointers = {}, drag = null, pinch = null;
    main.addEventListener("pointerdown", function (e) {
      main.setPointerCapture(e.pointerId);
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: self.st.z };
        drag = null;
      } else {
        drag = { x: e.clientX, y: e.clientY, fx: self.st.fx, fy: self.st.fy };
        main.classList.add("is-drag");
      }
    });
    main.addEventListener("pointermove", function (e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (ids.length === 2 && pinch) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        setZoom(pinch.z * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.d));
        return;
      }
      if (!drag) return;
      var g = geom();
      var ox = g.Bw - g.Wd, oy = g.Bh - g.Hd;
      if (ox < -0.5) self.st.fx = clamp(drag.fx + ((e.clientX - drag.x) / ox) * 100, 0, 100);
      if (oy < -0.5) self.st.fy = clamp(drag.fy + ((e.clientY - drag.y) / oy) * 100, 0, 100);
      paintAll();
    });
    function endPtr(e) {
      delete pointers[e.pointerId];
      var ids = Object.keys(pointers);
      if (ids.length < 2) pinch = null;
      if (ids.length === 0) {
        if (drag) self.emit();
        drag = null;
        main.classList.remove("is-drag");
      } else if (ids.length === 1) {
        var p = pointers[ids[0]];
        drag = { x: p.x, y: p.y, fx: self.st.fx, fy: self.st.fy };
      }
    }
    main.addEventListener("pointerup", endPtr);
    main.addEventListener("pointercancel", endPtr);
    main.addEventListener("wheel", function (e) { e.preventDefault(); setZoom(self.st.z * Math.exp(-e.deltaY * 0.0015)); }, { passive: false });

    var zoomInput = E("input", { type: "range", min: "1", max: String(MAX_ZOOM), step: "0.01", value: String(st.z), "aria-label": "Zoom", oninput: function (e) { setZoom(Number(e.target.value)); } });
    var zoomOut = E("output", { text: Math.round(st.z * 100) + "%" });
    var zoomRow = E("div", { class: "ss-zoom" },
      E("button", { type: "button", class: "ss-btn ss-btn--icon", "aria-label": "Zoom out", text: "−", onclick: function () { setZoom(self.st.z - 0.25); } }),
      zoomInput,
      E("button", { type: "button", class: "ss-btn ss-btn--icon", "aria-label": "Zoom in", text: "+", onclick: function () { setZoom(self.st.z + 0.25); } }),
      zoomOut);
    function btn(label, ic, fn, cls) {
      var b = E("button", { type: "button", class: "ss-btn " + (cls || ""), onclick: fn });
      b.appendChild(icon(ic));
      b.appendChild(document.createTextNode(label));
      return b;
    }
    var tools = E("div", { class: "fi-tools" }, zoomRow,
      E("button", { type: "button", class: "ss-btn", text: "Reset", onclick: function () { self.st.z = 1; self.st.fx = 50; self.st.fy = 50; paintAll(); self.emit(); } }),
      btn("Replace", "swap", function () { self.input.click(); }),
      btn("Remove", "trash", function () { if (window.confirm("Remove this image from the entry?\n\nThe uploaded file stays in the media library.")) { self.st = { path: "", z: 1, fx: 50, fy: 50 }; self.emit(); self.render(); } }, "ss-btn--danger"));

    root.appendChild(main);
    root.appendChild(tools);
    if (alsoImgs.length) root.appendChild(also);
    root.appendChild(E("p", { class: "ss-note", style: { marginTop: "10px" }, text: "Drag the picture to choose what stays visible; scroll or use the slider to zoom. The website shows exactly this crop, with no empty space. The original file is never changed." }));
    paintAll();
  }

  var FramedControl = createClass({
    componentDidMount: function () {
      var self = this;
      this.app = new FramedApp(this.host, function () { return self.props; });
    },
    componentDidUpdate: function () {
      if (this.app) this.app.setValue(this.props.value);
    },
    render: function () {
      var self = this;
      return h("div", { className: "ss-host", ref: function (el) { self.host = el; } });
    },
  });
  CMS.registerWidget("framed_image", FramedControl);

  CMS.registerWidget("surgical_steps", Control);
})();
