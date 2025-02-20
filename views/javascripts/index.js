const dropdownButton = document.getElementById("menu-button");
const profileDropdown = document.getElementById("dropdown");

const toggleDropdown = () => {
  const isOpen = profileDropdown.classList.toggle("hidden");
  dropdownButton.setAttribute("aria-expanded", !isOpen);
};

// Toggle dropdown when clicking the button
dropdownButton.addEventListener("click", (event) => {
  event.stopPropagation(); // Prevent click from bubbling up
  toggleDropdown();
});

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
  if (
    !profileDropdown.contains(event.target) &&
    !dropdownButton.contains(event.target)
  ) {
    profileDropdown.classList.add("hidden");
    dropdownButton.setAttribute("aria-expanded", "false");
  }
});

// Close dropdown on "Escape" key press
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !profileDropdown.classList.contains("hidden")) {
    profileDropdown.classList.add("hidden");
    dropdownButton.setAttribute("aria-expanded", "false");
  }
});
