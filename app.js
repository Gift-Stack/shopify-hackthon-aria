const informationPopup = document.querySelector(".pop-up");
const accordionToggle = document.getElementById("accordion-toggle");
const accordionBody = document.querySelector(".accordion-body");
const accordionItems = document.querySelectorAll(".accordion-item");
const accordionProgress = document.querySelector(".accordion-progress");
const buttons = document.querySelectorAll('[role="button"]');
const profileTrigger = document.getElementById("profile");
const notificationTrigger = document.getElementById("notification");
const profileMenu = document.getElementById("profile-popup");
const notificationMenu = document.getElementById("notification-popup");
const allMenuItems = document.querySelectorAll('[role="menuitem"]');

let activeGuide = 1;
const completedGuides = new Set();
const totalAccordionCount = 5;

const handleMenuEscapeKeyPress = ($event, _) => {
  if ($event.key === "Escape") {
    handleMenuToggle(_);
  }
};

const handleButtonRolesKeyPress = ($event, button) => {
  if (
    $event.key === "Enter" ||
    $event.key === "Spacebar" ||
    $event.key === " "
  ) {
    button.click();
  }
};

const handleMenuItemArrowKeyPress = ($event, menuIndex) => {
  const isFirstMenuItem = menuIndex === 0;
  const isLastMenuItem = menuIndex === allMenuItems.length - 1;
  const nextMenuItem = allMenuItems.item(menuIndex + 1);
  const prevMenuItem = allMenuItems.item(menuIndex - 1);

  if ($event.key === "Escape") {
    notificationMenu.classList.add("hidden");
    notificationMenu.ariaExpanded = false;
    profileMenu.classList.add("hidden");
    profileMenu.ariaExpanded = false;
  }

  if ($event.key === "ArrowLeft" || $event.key === "ArrowUp") {
    if (isFirstMenuItem) {
      allMenuItems.item(allMenuItems.length - 1).focus();
      return;
    }
    prevMenuItem.focus();
  }

  if ($event.key === "ArrowRight" || $event.key === "ArrowDown") {
    if (isLastMenuItem) {
      allMenuItems.item(0).focus();
      return;
    }
    nextMenuItem.focus();
  }
};

for (const button of buttons) {
  button.addEventListener("keydown", (e) =>
    handleButtonRolesKeyPress(e, button)
  );
}

const openMenu = ($event) => {
  $event.target.ariaExpanded = true;
  $event.target.addEventListener("keyup", (e) =>
    handleMenuEscapeKeyPress(e, $event)
  );

  allMenuItems.forEach((menu, index) => {
    menu.addEventListener("keyup", (e) =>
      handleMenuItemArrowKeyPress(e, index)
    );
  });
};

const closeMenu = ($event) => {
  $event.target.ariaExpanded = false;
};

const handleMenuToggle = ($event) => {
  if ($event.target === notificationTrigger) {
    handleMenuNotificationTrigger($event);
  } else {
    handleProfileMenuTrigger($event);
  }
};

const handleMenuNotificationTrigger = ($event) => {
  if (notificationMenu.classList.contains("hidden")) {
    profileMenu.classList.add("hidden");
    notificationMenu.classList.remove("hidden");
    openMenu($event);
  } else {
    notificationMenu.classList.add("hidden");
    closeMenu($event);
  }
};

const handleProfileMenuTrigger = ($event) => {
  if (profileMenu.classList.contains("hidden")) {
    notificationMenu.classList.add("hidden");
    profileMenu.classList.remove("hidden");
    openMenu($event);
  } else {
    profileMenu.classList.add("hidden");
    closeMenu($event);
  }
};

const handleHideInformationPopup = () => {
  informationPopup.remove();
};

const handleToggleAccordion = ($event) => {
  const isActive = accordionToggle.classList.value.includes("active");

  if (isActive) {
    accordionToggle.classList.remove("active");
    accordionBody.classList.remove("active");
    $event.target.ariaExpanded = false;
  } else {
    accordionToggle.classList.add("active");
    accordionBody.classList.add("active");
    $event.target.ariaExpanded = true;
  }
};

const handleChangeActiveGuide = (id) => {
  if (id === activeGuide) return;
  accordionItems[activeGuide - 1]?.classList.remove("active");
  accordionItems[id - 1].classList.add("active");
  activeGuide = id;

  const button = document.querySelector(`[aria-controls="guide-${id}"]`);
  const expanded = button.getAttribute("aria-expanded") === "true";

  button.setAttribute("aria-expanded", !expanded);
};

const handleCompleteGuide = ($event, id) => {
  const status = $event.target.classList.value;
  const accordionProgressText = accordionProgress.children[0];
  const accordionProgressSVG = accordionProgress.children[1];
  if (status === "loading-static") {
    $event.target.classList.remove("loading-static");
    $event.target.classList.add("loading");
    completedGuides.add(id);
  }
  if (status === "loading") {
    $event.target.classList.remove("loading");
    $event.target.classList.add("loading-inverse");
    completedGuides.delete(id);
  }
  if (status === "loading-inverse") {
    $event.target.classList.remove("loading-inverse");
    $event.target.classList.add("loading");
    completedGuides.add(id);
  }

  if (status !== "loading") {
    // Close the current accordion
    accordionItems[id - 1].classList.remove("active");
    if (completedGuides.has(activeGuide)) {
      //   accordionItems[activeGuide - 1].classList.remove("active");
      activeGuide = -1;

      // Open the next incomplete guide accordion
      const nextAccordionId = getNextIncompleteAccordionId(id);
      if (nextAccordionId) {
        handleChangeActiveGuide(nextAccordionId);
      }
    }
  }
  accordionProgressText.textContent = `${completedGuides.size} / 5 completed`;
  accordionProgressSVG.children[1].attributes.width.value =
    completedGuides.size * 14.4;
};

// Function to get the next incomplete accordion ID based on the current ID
const getNextIncompleteAccordionId = (currentAccordionId) => {
  // Loop through accordions from the next one after the current to the end
  for (let i = currentAccordionId + 1; i <= totalAccordionCount; i++) {
    const nextAccordionCompleted = completedGuides.has(i);

    if (!nextAccordionCompleted) {
      return i;
    }
  }

  // If no incomplete accordion is found, loop from 1 to the current ID
  for (let i = 1; i <= currentAccordionId; i++) {
    const nextAccordionCompleted = completedGuides.has(i);

    if (!nextAccordionCompleted) {
      return i;
    }
  }

  // If all remaining accordions are complete, return null or handle accordingly
  return null;
};
