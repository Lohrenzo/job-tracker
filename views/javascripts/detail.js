console.log = console.warn = console.error = function () {};

// Logic for edit job details popup start
// Select elements
const editBtn = document.getElementById("edit-btn");
const editPopup = document.getElementById("edit-popup");
const closeEditBtn = document.getElementById("close-edit-btn");

// Function to toggle popup visibility
const togglePopup = () => {
  const isHidden = editPopup.classList.toggle("hidden");
  editBtn.setAttribute("aria-expanded", !isHidden);
};

// Toggle popup when clicking the edit button
editBtn?.addEventListener("click", (event) => {
  event.stopPropagation(); // Prevents bubbling issues
  togglePopup();
});

// Close popup when clicking the close button
closeEditBtn?.addEventListener("click", () => {
  togglePopup();
});

// Close popup when clicking outside of it
document.addEventListener("click", (event) => {
  if (
    !editPopup.classList.contains("hidden") &&
    !editPopup.contains(event.target) &&
    event.target !== editBtn
  ) {
    togglePopup();
  }
});
//
// Logic end
