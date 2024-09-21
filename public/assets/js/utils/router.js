const routes = {
  "/": {
    path: "pages/homepage.html",
    title: "ReviewED Home page",
    css: [
      "/assets/css/layouts/faq.css",
      "/assets/css/components/add_company.css",
      "/assets/css/components/new_top_course.css",
      "/assets/css/components/top_company_section.css",
      "/assets/css/components/search_section.css",
      "/assets/css/components/hero_section.css",
    ],
    breadCrumbsTitle: 'Main Page'
  },
  "/clp": {
    path: "pages/clp/course_list_page.html",
    title: "Course List page",
    css: ["/assets/css/layouts/clp.css"],
       breadCrumbsTitle: 'Courses'
  },

  // Add more routes here
};

let currentPageStyles = [];

function loadPageStyles(cssFiles) {
  currentPageStyles.forEach((style) => {
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
    }
  });
  currentPageStyles = [];

  cssFiles.forEach((href) => {
    if (href) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      currentPageStyles.push(link);
    }
  });
}

async function route(event) {
  event = event || window.event;
  event.preventDefault();

  const href = event.target.closest("a")?.href;
  if (href) {
    window.history.pushState({}, "", href);
    await loadContent();
  }
}
function updateBreadcrumbs() {
  const breadcrumbsContainer = document.getElementById("breadcrumbs");

  const path = window.location.pathname.replace(/\/$/, ""); // Trim trailing slash
  // Hide breadcrumbs on homepage
  if (!path || path === "/") {
    breadcrumbsContainer.style.display = "none"; // Hide breadcrumbs on homepage
    return;
  }

  breadcrumbsContainer.style.display = "flex"; // Show breadcrumbs on other pages

  const pathParts = path.split("/").filter(Boolean); // Get the parts of the path
  const homeCrumb = `<a href="/" onclick="navigateTo('/'); return false;">Main Page</a>`;
  const separator = ` <span class="breadcrumb-separator"><img src="/assets/images/icons/Expand_right_light.svg"/></span> `; // Custom separator

  // Generate dynamic breadcrumbs
  let breadcrumbsHTML = homeCrumb;

  pathParts.forEach((part, index) => {
    const route = `/${pathParts.slice(0, index + 1).join("/")}`; // Build route path
    const routeTitle = routes[route]?.breadCrumbsTitle || part; // Get the title from routes or default to path part

    if (index === pathParts.length - 1) {
      // Last part is the current page, so it's not clickable
      breadcrumbsHTML += `${separator}<span class="breadcrumb-active style-small-SB">${routeTitle}</span>`;
    } else {
      // Non-active breadcrumb paths are clickable
      breadcrumbsHTML += `${separator}<a href="${route}" onclick="navigateTo('${route}'); return false;">${routeTitle}</a>`;
    }
  });

  breadcrumbsContainer.innerHTML = breadcrumbsHTML;
}

async function loadContent() {
  showLoading();

  let path = window.location.pathname.replace(/\/$/, ""); // Trim trailing slash

  // Default to homepage only on the initial load when the path is "/"
  if (!path || path === "" || path === "/") {
    path = "/";
  }

  // Check if the route exists, otherwise load the 404 page
  const route = routes[path];
  const routeToLoad = route || {
    path: "pages/404.html", // 404 page
    title: "Page Not Found",
  };

  try {
    const content = await fetch(routeToLoad.path).then((data) => data.text());
    document.getElementById("main-app").innerHTML = content;
    document.title = `${routeToLoad.title} - ReviewED`; // Fixed template literal
    window.scrollTo(0, 0); // Scroll to top after loading content

    loadPageStyles(routeToLoad.css || []); // Only load CSS if route exists

    updateBreadcrumbs(); // Update breadcrumbs dynamically after loading the page
  } catch (error) {
    console.error("Error loading page:", error);

    // Display detailed error message on screen
    document.getElementById("main-app").innerHTML = `<h1>Error loading page</h1>
        <p>${error.message}</p>
        <pre>${error.stack}</pre>`; // Fixed template literal
  } finally {
    hideLoading();
  }
}

function navigateTo(path) {
  window.history.pushState({}, "", path);
  loadContent();
}

// Handle browser back/forward navigation
window.onpopstate = loadContent;

window.route = route; // Fixed typo
window.navigateTo = navigateTo;

// Initial page load (first load)
loadContent();
