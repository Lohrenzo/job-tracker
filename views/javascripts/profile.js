console.log = console.warn = console.error = function () {};

// Logic for delete profile popup start
// Select elements
const deleteBtn = document.getElementById("delete-btn");
const deletePopup = document.getElementById("delete-popup");
const closeDeleteBtn = document.getElementById("close-delete-btn");

// Function to toggle popup visibility
const togglePopup = () => {
  const isHidden = deletePopup.classList.toggle("hidden");
  deleteBtn.setAttribute("aria-expanded", !isHidden);
};

// Toggle popup
deleteBtn?.addEventListener("click", (event) => {
  event.stopPropagation(); // Prevents bubbling issues
  togglePopup();
});

// Close popup
closeDeleteBtn?.addEventListener("click", () => {
  togglePopup();
});

// Close popup when clicking outside of it
document.addEventListener("click", (event) => {
  if (
    !deletePopup.classList.contains("hidden") &&
    !deletePopup.contains(event.target) &&
    event.target !== deleteBtn
  ) {
    togglePopup();
  }
});
//
// Logic end
