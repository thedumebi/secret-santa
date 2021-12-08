var backdrop = document.querySelector(".backdrop");
var selectLogoutButtons = document.querySelectorAll(".logout");
var modal = document.querySelector(".modal");
var closeModalButton = document.querySelector(".modal__action--negative");
var toggleButton = document.querySelector(".toggle-button");
var mobileNav = document.querySelector(".mobile-nav");
var ctaButton = document.querySelector(".main-nav__item--cta");

for (var i = 0; i < selectLogoutButtons.length; i++) {
  selectLogoutButtons[i].addEventListener("click", function () {
    // backdrop.style.display = "block";
    // modal.style.display = "block";
    // backdrop.className = "open"; //This would actually overwrite the complete class list
    backdrop.style.display = "block";
    setTimeout(() => {
      backdrop.classList.add("open");
    }, 10);
    modal.style.display = "block";
    setTimeout(() => {
      modal.classList.add("open");
    }, 10);
  });
}

if (closeModalButton) {
  closeModalButton.addEventListener("click", closeModal);
}

backdrop.addEventListener("click", function () {
  //   mobileNav.style.display = "none";
  mobileNav.classList.remove("open");
  closeModal();
});

function closeModal() {
  //   backdrop.style.display = "none";
  //   modal.style.display = "none";
  backdrop.classList.remove("open");
  setTimeout(() => {
    backdrop.style.display = "none";
  }, 200);
  if (modal) {
    modal.classList.remove("open");
    setTimeout(() => {
      modal.style.display = "none";
    }, 200);
  }
}

toggleButton.addEventListener("click", function () {
  //   mobileNav.style.display = "block";
  //   backdrop.style.display = "block";
  mobileNav.classList.add("open");
  backdrop.style.display = "block";
  setTimeout(() => {
    backdrop.classList.add("open");
  }, 10);
});

ctaButton.addEventListener("animationstart", (event) => {
  console.log("Animation started", event);
});

ctaButton.addEventListener("animationend", (event) => {
  console.log("Animation ended", event);
});

ctaButton.addEventListener("animationiteration", (event) => {
  console.log("Animation iteration", event);
});
