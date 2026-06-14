const checkbox = document.getElementById('theme-toggle');

// deno-lint-ignore no-window
const prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const prefersDarkOs = () => prefersDarkQuery.matches;

function getCurrentTheme(checked) {
  if (prefersDarkOs()) {
    return checked ? 'light' : 'dark';
  } else {
    return checked ? 'dark' : 'light';
  }
}

checkbox.addEventListener('change', (event) => {
  const newTheme = getCurrentTheme(event.target.checked);
  localStorage.setItem('theme', newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
});

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (!savedTheme) return;

  if (prefersDarkOs()) {
    checkbox.checked = savedTheme === 'light';
  } else {
    checkbox.checked = savedTheme === 'dark';
  }
}

loadTheme();
