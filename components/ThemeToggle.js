export class ThemeToggle {
  constructor() {
    this.checkbox = document.getElementById("theme-toggle");
    this.body = document.body;
    this.initialize();
  }

  initialize() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    this.body.setAttribute("data-theme", savedTheme);
    this.checkbox.checked = savedTheme === "dark";

    this.checkbox.addEventListener("change", () => {
      const newTheme = this.checkbox.checked ? "dark" : "light";
      this.body.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }
}
