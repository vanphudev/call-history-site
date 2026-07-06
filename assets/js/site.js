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
 * Nội dung pháp lý (Privacy / Terms) được tải từ data/legal.xml — NGUỒN DUY NHẤT dùng chung với ứng dụng
 * Android, để hai bên luôn đồng nhất. Trang chỉ cần đặt: <div class="doc-layout" data-legal="privacy"></div>
 * (hoặc data-legal="terms"). Nếu tải lỗi, container còn cờ data-legal-loading sẽ hiện thông báo nhẹ.
 */
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

    container.removeAttribute("data-legal-loading");
    container.textContent = "";
    container.appendChild(frag);
  } catch (err) {
    // Chỉ thay khi container còn ở trạng thái "đang tải" (giữ nội dung dự phòng nếu có).
    if (container.hasAttribute("data-legal-loading")) {
      const sec = document.createElement("section");
      sec.className = "doc-section";
      const p = document.createElement("p");
      p.textContent = "Không tải được nội dung. Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.";
      sec.appendChild(p);
      container.textContent = "";
      container.appendChild(sec);
    }
  }
}

renderLegal();
