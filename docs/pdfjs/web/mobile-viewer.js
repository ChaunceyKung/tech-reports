/**
 * PDF.js Viewer — 移动端初始化逻辑
 *
 * 负责：
 *  1. 移动设备检测
 *  2. 默认 page-width 缩放
 *  3. 屏幕旋转 / 窗口变化后重新适配
 *  4. 移动端侧边栏覆盖 + 遮罩 + 点击关闭
 *  5. 错误/加载失败时的备用入口
 */

// ==========================================================================
// 设备检测
// ==========================================================================
function isMobileDevice() {
  return (
    window.matchMedia("(max-width: 768px)").matches ||
    window.matchMedia("(pointer: coarse)").matches ||
    navigator.maxTouchPoints > 0
  );
}

function isCoarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches;
}

// ==========================================================================
// 移动端初始化（等待 PDF.js Viewer 就绪）
// ==========================================================================
function initMobileViewer() {
  const app = window.PDFViewerApplication;
  if (!app) {
    // Viewer 尚未初始化，延迟重试
    setTimeout(initMobileViewer, 200);
    return;
  }

  // 等待 viewer 完全初始化
  if (!app.pdfViewer || !app.initializedPromise) {
    setTimeout(initMobileViewer, 200);
    return;
  }

  app.initializedPromise.then(function () {
    if (isMobileDevice()) {
      setupMobileDefaults(app);
    }
    setupSidebarOverlay(app);
    setupErrorFallback();
    setupOrientationHandler(app);
  }).catch(function () {
    // 初始化失败，显示备用页面
    showFallback();
  });
}

// ==========================================================================
// 移动端默认设置
// ==========================================================================
function setupMobileDefaults(app) {
  try {
    // 手机端默认 page-width（仅在用户未手动设置缩放时生效）
    var params = new URLSearchParams(document.location.search.substring(1));
    var hasZoomParam = params.has("zoom") || params.has("scale");

    if (!hasZoomParam && app.pdfViewer) {
      app.pdfViewer.currentScaleValue = "page-width";
    }

    // 标记移动端，便于后续判断
    document.documentElement.classList.add("mobile-viewer");
  } catch (e) {
    console.warn("mobile-viewer: 设置默认缩放失败", e);
  }
}

// ==========================================================================
// 侧边栏覆盖 + 遮罩（移动端）
// ==========================================================================
function setupSidebarOverlay(app) {
  if (!isMobileDevice()) { return; }

  // 创建遮罩元素
  var overlay = document.createElement("div");
  overlay.id = "viewsManagerOverlay";
  document.body.appendChild(overlay);

  var viewsManager = document.getElementById("viewsManager");

  function openSidebar() {
    overlay.classList.add("visible");
  }

  function closeSidebar() {
    // 隐藏侧边栏
    if (viewsManager) {
      viewsManager.setAttribute("hidden", "true");
    }
    overlay.classList.remove("visible");
    // 也收起查找栏
    var findbar = document.getElementById("findbar");
    if (findbar) {
      findbar.classList.add("hidden");
    }
    var findButton = document.getElementById("viewFindButton");
    if (findButton) {
      findButton.setAttribute("aria-expanded", "false");
    }
  }

  // 点击遮罩关闭
  overlay.addEventListener("click", closeSidebar);

  // 监听侧边栏切换按钮
  var toggleBtn = document.getElementById("viewsManagerToggleButton");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      setTimeout(function () {
        if (viewsManager && !viewsManager.hasAttribute("hidden")) {
          openSidebar();
        } else {
          closeSidebar();
        }
      }, 50);
    });
  }

  // 点击目录项目后自动关闭侧边栏
  var outlinesView = document.getElementById("outlinesView");
  if (outlinesView) {
    outlinesView.addEventListener("click", function (e) {
      var target = e.target;
      // 检查是否点击了目录项（目录项可能是 span、a 或带特定 class 的元素）
      while (target && target !== outlinesView) {
        if (target.classList.contains("treeItem") ||
            target.tagName === "A" ||
            target.tagName === "SPAN" && target.parentElement &&
            target.parentElement.classList.contains("treeItem")) {
          setTimeout(closeSidebar, 200);
          break;
        }
        target = target.parentElement;
      }
    });
  }

  // 点击缩略图后也关闭
  var thumbnailsView = document.getElementById("thumbnailsView");
  if (thumbnailsView) {
    thumbnailsView.addEventListener("click", function () {
      if (thumbnailsView.querySelector(".thumbnail.selected")) {
        setTimeout(closeSidebar, 200);
      }
    });
  }

  // 添加查找栏打开时的遮罩处理
  var findButton = document.getElementById("viewFindButton");
  if (findButton) {
    findButton.addEventListener("click", function () {
      setTimeout(function () {
        var findbar = document.getElementById("findbar");
        if (findbar && !findbar.classList.contains("hidden")) {
          overlay.classList.add("visible");
        } else {
          overlay.classList.remove("visible");
        }
      }, 100);
    });
  }

  // 点击查找栏外部区域（遮罩）关闭查找栏
  overlay.addEventListener("click", function () {
    var findbar = document.getElementById("findbar");
    if (findbar && !findbar.classList.contains("hidden")) {
      findbar.classList.add("hidden");
      var fb = document.getElementById("viewFindButton");
      if (fb) { fb.setAttribute("aria-expanded", "false"); }
    }
  });
}

// ==========================================================================
// 屏幕旋转 / 窗口大小变化处理
// ==========================================================================
function setupOrientationHandler(app) {
  if (!isMobileDevice()) { return; }

  var resizeTimer;
  var userChangedScale = false;

  // 监听用户手动缩放
  try {
    if (app.pdfViewer) {
      var origScaleChange = app.pdfViewer.currentScaleValue;
      app.eventBus.on("scalechanging", function () {
        userChangedScale = true;
        // 3 秒后重置标记，允许自动适配
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          userChangedScale = false;
        }, 3000);
      });
    }
  } catch (e) {
    // 忽略事件监听错误
  }

  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (isMobileDevice() && !userChangedScale && app.pdfViewer) {
        try {
          app.pdfViewer.currentScaleValue = "page-width";
        } catch (e) { /* ignore */ }
      }
    }, 300);
  });

  // 监听 orientationchange
  window.addEventListener("orientationchange", function () {
    setTimeout(function () {
      if (isMobileDevice() && !userChangedScale && app.pdfViewer) {
        try {
          app.pdfViewer.currentScaleValue = "page-width";
        } catch (e) { /* ignore */ }
      }
    }, 500);
  });
}

// ==========================================================================
// 错误处理和备用入口
// ==========================================================================
function setupErrorFallback() {
  var fallback = document.getElementById("viewerFallback");
  if (!fallback) { return; }

  // 根据 file 参数生成备用链接
  var params = new URLSearchParams(document.location.search.substring(1));
  var fileParam = params.get("file") || "";

  // 计算原始 PDF 的下载路径（相对于 docs/ 根）
  var pdfPath = fileParam;
  // 如果是 ../../reports/xxx.pdf 这种相对路径，转换为相对于站点的路径
  var directUrl = "";
  if (pdfPath.indexOf("../") === 0) {
    // 去掉前导的 ../../ 得到相对于 docs/ 根的路径
    directUrl = pdfPath.replace(/^(\.\.\/)+/, "");
  } else {
    directUrl = pdfPath;
  }

  var sysOpen = document.getElementById("fallbackSystemOpen");
  var download = document.getElementById("fallbackDownload");

  if (sysOpen) {
    sysOpen.href = directUrl;
  }
  if (download) {
    download.href = directUrl;
    download.setAttribute("download", "");
  }

  // 监听 PDF.js 加载全局错误
  window.addEventListener("error", function (e) {
    // 只捕获资源加载错误（script/CSS 404 等）
    if (e.target && (e.target.tagName === "SCRIPT" || e.target.tagName === "LINK")) {
      console.warn("mobile-viewer: 资源加载失败", e.target.src || e.target.href);
      // 延迟检查，给 Viewer 一些时间
      setTimeout(checkViewerHealth, 3000);
    }
  }, true);

  // 定期检查 Viewer 是否正常渲染
  setTimeout(checkViewerHealth, 8000);
}

function checkViewerHealth() {
  var app = window.PDFViewerApplication;
  if (!app) {
    showFallback();
    return;
  }

  // 检查是否有 PDF 文档加载
  if (app.pdfDocument) { return; } // 正常

  // 检查是否有页面渲染
  var viewer = document.getElementById("viewer");
  if (viewer && viewer.children.length > 0) { return; } // 正常

  // 过了 8 秒还没加载，显示备用
  showFallback();
}

function showFallback() {
  var fallback = document.getElementById("viewerFallback");
  if (fallback) {
    fallback.classList.remove("hidden");
  }
}

// ==========================================================================
// 启动
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
  // 延迟启动，确保 viewer.mjs 先加载
  setTimeout(initMobileViewer, 300);
});

// 也尝试在 webviewerloaded 事件时初始化
document.addEventListener("webviewerloaded", function () {
  setTimeout(initMobileViewer, 500);
});
