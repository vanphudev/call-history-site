const currentPath = window.location.pathname.replace(/\/$/, "");

document.querySelectorAll("[data-nav-link]").forEach((link) => {
  const href = new URL(link.getAttribute("href"), window.location.href);
  const hrefPath = href.pathname.replace(/\/$/, "");
  if (hrefPath === currentPath || (hrefPath.endsWith("/call-history-site") && currentPath.endsWith("/call-history-site"))) {
    link.setAttribute("aria-current", "page");
  }
});

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

/*
 * Nội dung pháp lý (Privacy / Terms) — PROGRESSIVE ENHANCEMENT.
 * Trang đã có sẵn nội dung TĨNH (đồng nhất với data/legal.xml, an toàn cho SEO / trình fetch không chạy JS).
 * Khi có JS + mạng, hàm này tải data/legal.xml (NGUỒN DUY NHẤT dùng chung với ứng dụng Android) rồi thay
 * nội dung tĩnh bằng bản mới nhất, đồng thời cập nhật ngày "Cập nhật lần cuối" từ thuộc tính updated.
 * Nếu tải/tách lỗi → GIỮ NGUYÊN nội dung tĩnh (không xoá, không báo lỗi).
 */
function formatLegalDate(raw) {
  const m = (raw || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? m[3] + "/" + m[2] + "/" + m[1] : (raw || "");
}

async function renderLegal() {
  const container = document.querySelector("[data-legal]");
  if (!container) return;
  const id = container.getAttribute("data-legal");
  try {
    const res = await fetch("../data/legal.xml", { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const xml = new DOMParser().parseFromString(await res.text(), "application/xml");
    if (xml.querySelector("parsererror")) throw new Error("parse error");
    const doc = Array.from(xml.querySelectorAll("legal > document")).find((d) => d.getAttribute("id") === id);
    if (!doc) throw new Error("document not found: " + id);

    const frag = document.createDocumentFragment();
    doc.querySelectorAll("section").forEach((section) => {
      const sec = document.createElement("section");
      sec.className = "doc-section";
      const h2 = document.createElement("h2");
      h2.textContent = section.getAttribute("title") || "";
      sec.appendChild(h2);
      Array.from(section.children).forEach((child) => {
        const tag = child.tagName.toLowerCase();
        const value = (child.textContent || "").trim();
        if (tag === "h3") {
          const h3 = document.createElement("h3");
          h3.textContent = value;
          sec.appendChild(h3);
        } else if (tag === "p") {
          const p = document.createElement("p");
          p.textContent = value;
          sec.appendChild(p);
        } else if (tag === "callout") {
          const box = document.createElement("div");
          box.className = "callout green";
          const p = document.createElement("p");
          p.textContent = value;
          box.appendChild(p);
          sec.appendChild(box);
        } else if (tag === "list") {
          const ul = document.createElement("ul");
          child.querySelectorAll("item").forEach((item) => {
            const li = document.createElement("li");
            li.textContent = (item.textContent || "").trim();
            ul.appendChild(li);
          });
          sec.appendChild(ul);
        }
      });
      frag.appendChild(sec);
    });

    // Chỉ thay khi có ít nhất 1 mục (tránh xoá sạch nội dung tĩnh nếu XML rỗng bất thường).
    if (frag.childNodes.length > 0) {
      container.textContent = "";
      container.appendChild(frag);
    }

    const updated = formatLegalDate(doc.getAttribute("updated"));
    if (updated) {
      document.querySelectorAll("[data-legal-updated]").forEach((el) => {
        el.textContent = "Cập nhật lần cuối: " + updated;
      });
    }
  } catch (err) {
    // Giữ nguyên nội dung TĨNH đã có sẵn trên trang.
  }
}

renderLegal();
