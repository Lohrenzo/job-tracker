console.log = console.warn = console.error = function () {};

// Logic for edit job details popup start
// Select elements
const editBtn = document.getElementById("edit-btn");
const editPopup = document.getElementById("edit-popup");
const closeEditBtn = document.getElementById("close-edit-btn");

// Function to toggle popup visibility
const togglePopup = () => {
  const isHidden = deletePopup.classList.toggle("hidden");
  deleteBtn.setAttribute("aria-expanded", !isHidden);
};

// Toggle popup when clicking the edit button
deleteBtn?.addEventListener("click", (event) => {
  event.stopPropagation(); // Prevents bubbling issues
  togglePopup();
});

// Close popup when clicking the close button
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
