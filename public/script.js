const container = document.getElementById("saved-articles-container");

const observer = new MutationObserver(() => {
  if (container.dataset.manualHide !== "true") {
    container.style.display = "grid";
    container.style.gridTemplateColumns =
      "repeat(auto-fit, minmax(320px, 1fr))";
    container.style.gap = "24px";
    container.style.maxWidth = "1200px";
    container.style.margin = "0 auto 40px";
  }
});

observer.observe(container, {
  childList: true,
});

async function fetchNews(query = "", category = "") {
  const container = document.getElementById("news-container");
  container.innerHTML = "<p>Loading news…</p>";

  try {
    const queryParams = [];
    if (query) queryParams.push(`q=${encodeURIComponent(query)}`);
    if (category) queryParams.push(`category=${encodeURIComponent(category)}`);
    const res = await fetch(
      `/api/news${queryParams.length ? "?" + queryParams.join("&") : ""}`
    );

    const data = await res.json();
    container.innerHTML = "";

    if (!data.articles || data.articles.length === 0) {
      container.innerHTML =
        "<p>No articles found. Please try a different search.</p>";
      return;
    }

    data.articles.forEach((article) => {
      const div = document.createElement("div");
      div.className = "article";
      const imageUrl = article.urlToImage || "default-image-url.jpg";
      div.innerHTML = `
                <img src="${imageUrl}" alt="${article.title}">
                <h2>${article.title}</h2>
                <p>${article.description || ""}</p>
                <a href="${article.url}" target="_blank">Read more</a>
                <button class="save-btn">Save Article</button>
            `;
      container.appendChild(div);
      div
        .querySelector(".save-btn")
        .addEventListener("click", () => saveArticle(article));
    });
  } catch (err) {
    container.innerHTML = `<p>Error loading news: ${err.message}</p>`;
  }
}

function saveArticle(article) {
  let savedArticles = JSON.parse(localStorage.getItem("savedArticles")) || [];
  if (!savedArticles.some((saved) => saved.url === article.url)) {
    savedArticles.push(article);
    localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
    alert("Article saved!");
  } else {
    alert("Article already saved!");
  }
}

function displaySavedArticles() {
  const container = document.getElementById("saved-articles-container");
  const savedArticles = JSON.parse(localStorage.getItem("savedArticles")) || [];
  container.innerHTML = "";

  if (savedArticles.length === 0) {
    container.innerHTML = "<p>No saved articles.</p>";
    return;
  }

  savedArticles.forEach((article) => {
    const div = document.createElement("div");
    div.className = "saved-article";
    const imageUrl = article.urlToImage || "default-image-url.jpg";
    div.innerHTML = `
            <img src="${imageUrl}" alt="${article.title}">
            <div class="content">
                <h2>${article.title}</h2>
                <p>${article.description || ""}</p>
                <a href="${article.url}" target="_blank">Read more</a>
            </div>
        `;
    container.appendChild(div);
  });
}

function toggleSavedArticles() {
  const container = document.getElementById("saved-articles-container");
  const btn = document.getElementById("saved-articles-btn");

  const isVisible =
    container.style.display === "grid" || container.style.display === "block";

  if (!isVisible) {
    container.dataset.manualHide = "false";
    showSavedArticlesContent();
    container.style.display = "grid";
    btn.innerText = "❌ Hide Saved Articles";

    setTimeout(() => {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  } else {
    container.dataset.manualHide = "true";
    container.style.display = "none";
    btn.innerText = "💾 Saved";
  }
}

function showSavedArticlesContent() {
  const container = document.getElementById("saved-articles-container");
  container.innerHTML = "";

  const savedArticles = JSON.parse(
    localStorage.getItem("savedArticles") || "[]"
  );

  if (savedArticles.length === 0) {
    container.innerHTML = "<p>No saved articles.</p>";
    return;
  }

  savedArticles.forEach((article, index) => {
    const articleElement = document.createElement("div");
    articleElement.className = "saved-article";

    articleElement.innerHTML = `
      <img src="${article.urlToImage || ""}" alt="Article Image">
      <h2>${article.title}</h2>
      <p>${article.description || ""}</p>
      <a href="${article.url}" target="_blank">Read more</a>
      <button class="remove-btn" onclick="deleteSavedArticle(${index})">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;

    container.appendChild(articleElement);
  });
}

function showSavedArticles() {
  const container = document.getElementById("saved-articles-container");
  container.innerHTML = "";

  const savedArticles = JSON.parse(
    localStorage.getItem("savedArticles") || "[]"
  );

  savedArticles.forEach((article, index) => {
    const articleElement = document.createElement("div");
    articleElement.className = "saved-article";

    articleElement.innerHTML = `
      <img src="${article.urlToImage || ""}" alt="Article Image">
      <h2>${article.title}</h2>
      <p>${article.description || ""}</p>
      <a href="${article.url}" target="_blank">Read more</a>
      <button class="remove-btn" onclick="deleteSavedArticle(${index})">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;

    container.appendChild(articleElement);
  });

  setTimeout(() => {
    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
}

function deleteSavedArticle(index) {
  const savedArticles = JSON.parse(
    localStorage.getItem("savedArticles") || "[]"
  );
  savedArticles.splice(index, 1);
  localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
  showSavedArticles();
}

document.addEventListener("DOMContentLoaded", displaySavedArticles);
fetchNews();
setInterval(fetchNews, 60000);
document
  .getElementById("search-input")
  .addEventListener("input", filterArticles);

const darkModeToggle = document.getElementById("dog-mode-toggle");
const body = document.body;

if (localStorage.getItem("darkMode") === "true") {
  body.classList.add("dark-mode");
  darkModeToggle.innerText = "🌞 Light Mode";
}

darkModeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  const isDark = body.classList.contains("dark-mode");
  darkModeToggle.innerText = isDark ? "🌞 Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("darkMode", isDark);
});

function filterByCategory(category) {
  fetchNews("", category === "all" ? "" : category);
  document.querySelectorAll(".category-nav button").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.textContent.toLowerCase() === category) btn.classList.add("active");
    if (category === "all" && btn.textContent.toLowerCase() === "all")
      btn.classList.add("active");
  });
}

function shareOnFacebook() {
  const url = encodeURIComponent(location.href);
  const title = encodeURIComponent(document.title);
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`,
    "_blank",
    "width=600,height=400"
  );
}

function shareOnTwitter() {
  const url = encodeURIComponent(location.href);
  const title = encodeURIComponent(document.title);
  window.open(
    `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    "_blank",
    "width=600,height=400"
  );
}

function shareOnWhatsapp() {
  const url = encodeURIComponent(location.href);
  const title = encodeURIComponent(document.title);
  window.open(
    `https://api.whatsapp.com/send?text=${title} ${url}`,
    "_blank",
    "width=600,height=400"
  );
}

function shareOnLinkedIn() {
  const url = encodeURIComponent(location.href);
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    "_blank",
    "width=600,height=400"
  );
}

function filterArticles() {
  const input = document.getElementById("search-input").value.toLowerCase();
  const articles = document.querySelectorAll(".article");
  articles.forEach((article) => {
    const title = article.querySelector("h2").textContent.toLowerCase();
    const description =
      article.querySelector("p")?.textContent.toLowerCase() || "";
    article.style.display =
      title.includes(input) || description.includes(input) ? "block" : "none";
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}
