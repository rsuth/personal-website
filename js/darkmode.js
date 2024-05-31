document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("dark-mode-toggle");
  const htmlElement = document.documentElement;

  // Check for saved user preference and apply it
  if (localStorage.getItem("theme") === "dark") {
    htmlElement.setAttribute("data-theme", "dark");
    toggleButton.textContent = "light mode";
  } else {
    toggleButton.textContent = "dark mode";
  }

  // Toggle dark mode on button click
  toggleButton.addEventListener("click", function () {
    if (htmlElement.getAttribute("data-theme") === "dark") {
      htmlElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      toggleButton.textContent = "dark mode";
    } else {
      htmlElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      toggleButton.textContent = "light mode";
    }
  });
});

function replaceGithubMark() {}
