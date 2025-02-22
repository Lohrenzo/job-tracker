console.log = console.warn = console.error = function () {};

// Logic for navbar dropdown start
//
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
//
// Logic end

// Logic For Update Profile Form Disabling Submit Button start
//
const updateProfileForm = document.getElementById("update-profile-form");
const updateProfileSubmitBtn = document.getElementById(
  "update-profile-submit-btn"
);
const updateInputs = updateProfileForm.querySelectorAll("input");

// Store initial values of all inputs
const initialValues = {};
updateInputs.forEach((input) => {
  initialValues[input.name] = input.value;
});

function checkForChanges() {
  let hasChanges = false;

  updateInputs.forEach((input) => {
    if (input.type === "file") {
      if (input.files.length > 0) {
        hasChanges = true;
      }
    } else {
      if (input.value !== initialValues[input.name]) {
        hasChanges = true;
      }
    }
  });

  updateProfileSubmitBtn.disabled = !hasChanges;
}

// Attach event listeners to all inputs
updateInputs.forEach((input) => {
  input.addEventListener("input", checkForChanges);
  input.addEventListener("change", checkForChanges);
});

// Initially disable the button
updateProfileSubmitBtn.disabled = true;
//
// Logic end
