/**
 * 项目文档中心 — 应用逻辑
 *
 * 新增 PDF 文档的方法：
 *   1. 将 PDF 放入 docs/reports/ 目录；
 *   2. 在下方 documents 数组中增加一条配置；
 *   3. 提交并推送到 GitHub。
 */

// ==========================================================================
// 文档配置
// 每个条目包含：
//   title     — 文档名称（显示在卡片标题）
//   file      — 相对于 docs/ 的文件路径
//   category  — 分类标签（如"技术报告"、"论文"等）
//   description — 简短说明（显示在卡片中）
// ==========================================================================
var documents = [
  {
    title: "完整技术报告",
    file: "reports/full_report.pdf",
    category: "技术报告",
    description: "项目完整技术报告与实验说明"
  }
  // 新增 PDF 示例：
  // {
  //   title: "另一份报告",
  //   file: "reports/another_report.pdf",
  //   category: "技术报告",
  //   description: "补充说明与数据分析"
  // }
];

// ==========================================================================
// 路径编码
// 对路径各段分别编码，保留 "/" 分隔符，确保中文、空格、括号等
// 特殊字符能被 PDF.js 正确解析
// ==========================================================================
function encodePath(path) {
  return path
    .split("/")
    .map(function (segment) {
      return encodeURIComponent(segment);
    })
    .join("/");
}

// 构建 PDF.js Viewer 的 URL
// viewer.html 在 docs/pdfjs/web/，PDF 在 docs/reports/
// file 参数是相对于 viewer.html 的路径：
// viewer.html 位于 pdfjs/web/ → 需要 ../../ 回到 docs/ 根 → 再进入 reports/
function buildViewerUrl(pdfPath) {
  return "./pdfjs/web/viewer.html?file=" + encodePath("../../" + pdfPath);
}

// ==========================================================================
// 设备检测
// ==========================================================================
function isMobileOrTablet() {
  return (
    window.matchMedia("(max-width: 768px)").matches ||
    window.matchMedia("(pointer: coarse)").matches ||
    navigator.maxTouchPoints > 0
  );
}

// ==========================================================================
// 渲染文档卡片
// ==========================================================================
function renderDocCards() {
  var container = document.getElementById("doc-list");
  if (!container) { return; }

  if (!documents || documents.length === 0) {
    container.innerHTML =
      '<div class="doc-empty">' +
      '<span class="icon">📄</span>' +
      '<p>暂无文档。</p>' +
      '<p>请按照下方说明添加 PDF 文档。</p>' +
      "</div>";
    return;
  }

  var mobile = isMobileOrTablet();
  var html = "";
  documents.forEach(function (doc) {
    var viewerUrl = buildViewerUrl(doc.file);
    var directUrl = encodePath(doc.file); // 原始 PDF 直接链接

    html += '<div class="doc-card">';

    if (doc.category) {
      html +=
        '<span class="doc-category">' +
        escapeHtml(doc.category) +
        "</span>";
    }

    html +=
      '<div class="doc-title">' +
      escapeHtml(doc.title) +
      "</div>";

    if (doc.description) {
      html +=
        '<div class="doc-desc">' +
        escapeHtml(doc.description) +
        "</div>";
    }

    html += '<div class="doc-actions">';

    if (mobile) {
      // 手机/平板：手机阅读 + 系统阅读器打开 + 下载
      html +=
        '<a class="btn btn-primary" href="' +
        viewerUrl +
        '">📱 手机阅读</a>';
      html +=
        '<a class="btn btn-outline" href="' +
        directUrl +
        '">↗ 系统阅读器打开</a>';
      html +=
        '<a class="btn btn-outline" href="' +
        directUrl +
        '" download>📥 下载 PDF</a>';
    } else {
      // 桌面：在线阅读（新标签页） + 下载
      html +=
        '<a class="btn btn-primary" href="' +
        viewerUrl +
        '" target="_blank">📖 在线阅读</a>';
      html +=
        '<a class="btn btn-outline" href="' +
        directUrl +
        '">📥 下载 PDF</a>';
    }

    html += "</div>";
    html += "</div>";
  });

  container.innerHTML = html;
}

// 简单的 HTML 转义
function escapeHtml(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ==========================================================================
// 检测当前是否在 GitHub Pages 子路径下
// 动态调整基准路径（仅在首页需要时使用）
// ==========================================================================
(function () {
  // 获取 <base> 路径或脚本自身路径来确定根路径
  // 不需要写死仓库名，使用相对路径即可
})();

// ==========================================================================
// 页面加载时渲染
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
  renderDocCards();
});
