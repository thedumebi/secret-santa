let backdrop = document.querySelector(".backdrop");
let selectLogoutButtons = document.querySelectorAll(".logout");
let modal = document.querySelector(".modal");
let closeModalButton = document.querySelector(".modal__action--negative");
let toggleButton = document.querySelector(".toggle-button");
let mobileNav = document.querySelector(".mobile-nav");
let ctaButton = document.querySelector(".main-nav__item--cta");
let user;

for (let i = 0; i < selectLogoutButtons.length; i++) {
  selectLogoutButtons[i].addEventListener("click", function () {
    // backdrop.style.display = "block";
    // modal.style.display = "block";
    // backdrop.className = "open"; //This would actually overwrite the complete class list
    backdrop.style.display = "block";
    setTimeout(() => {
      backdrop.classList.add("open");
    }, 10);
    modal.style.display = "block";
    mobileNav.classList.remove("open");
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

// ctaButton.addEventListener("animationstart", (event) => {
//   console.log("Animation started", event);
// });

// ctaButton.addEventListener("animationend", (event) => {
//   console.log("Animation ended", event);
// });

// ctaButton.addEventListener("animationiteration", (event) => {
//   console.log("Animation iteration", event);
// });

/**
 *  Frontend Logic for the application
 *
 */

// Container for frontend application
let app = {};

// config
app.config = {
  sessionToken: false,
};

// AJAX client (for RESTful API)
app.client = {};

// Interface for making API calls
app.client.request = function (
  headers,
  path,
  method,
  queryStringObject,
  payload,
  callback
) {
  // set defaults
  headers = typeof headers === "object" && headers !== null ? headers : {};
  path = typeof path === "string" ? path : "/";
  method =
    typeof method === "string" &&
    ["POST", "GET", "PATCH", "DELETE"].indexOf(method.toUpperCase()) > -1
      ? method.toUpperCase()
      : "GET";
  queryStringObject =
    typeof queryStringObject === "object" && queryStringObject !== null
      ? queryStringObject
      : {};
  payload = typeof payload === "object" && payload !== null ? payload : {};
  callback = typeof callback === "function" ? callback : false;

  // for each query string parameter sent, add it to the path
  let requestUrl = path + "?";
  let counter = 0;
  for (const queryKey in queryStringObject) {
    if (Object.hasOwnProperty.call(queryStringObject, queryKey)) {
      counter++;
      // if at least one query string param has been added, prepend new ones with ampersand
      if (counter > 1) {
        requestUrl += "&";
      }
      // add the key and value
      requestUrl += queryKey + "=" + queryStringObject[queryKey];
    }
  }

  // form the http request as a JSON type
  let xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  // For each header sent, add it to the request
  for (let headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey]);
    }
  }

  // If there is a current session token set, add that as a header
  if (app.config.sessionToken) {
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }

  // when the request comes back, handle the response
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      const statusCode = xhr.status;
      const responseReturned = xhr.responseText;

      // callback if requested
      if (callback) {
        try {
          const parsedResponse = JSON.parse(responseReturned);
          callback(statusCode, parsedResponse);
        } catch (err) {
          callback(statusCode, false);
        }
      }
    }
  };

  // send the payload as JSON
  const payloadString = JSON.stringify(payload);
  xhr.send(payloadString);
};

// bind the forms
app.bindForms = function () {
  if (document.querySelector("form")) {
    const allForms = document.querySelectorAll("form");

    for (let i = 0; i < allForms.length; i++) {
      allForms[i].addEventListener("submit", function (e) {
        // stop from submitting
        // e.preventDefault();
        const formId = this.id;
        const path = this.action;
        const method = this.method.toUpperCase();

        // turn the inputs into a payload
        let payload = {};
        let elements = this.elements;

        for (let i = 0; i < elements.length; i++) {
          if (elements[i].type !== "submit") {
            // determine the class of element and set value accordingly
            const classOfElement =
              typeof elements[i].classList.value === "string" &&
              elements[i].classList.value.length > 0
                ? elements[i].classList.value
                : "";
            const valueOfElement =
              elements[i].type === "checkbox" &&
              classOfElement.indexOf("multiselect") === -1
                ? elements[i].checked
                : classOfElement.indexOf("intval") === -1
                ? elements[i].value
                : parseInt(elements[i].value);

            // override the method of the form if the input's name is _method
            const nameOfElement = elements[i].name;
            if (nameOfElement === "_method") {
              method = valueOfElement.toUpperCase();
            } else {
              // create a payload field named "method" if the elements name is actually httpmethod
              if (nameOfElement == "httpmethod") {
                nameOfElement = "method";
              }
              // Create a payload field names "id" if the elements name is actually uid
              if (nameOfElement === "uid") {
                nameOfElement = "id";
              }
              payload[nameOfElement] = valueOfElement;
            }
          }
        }

        // if method is delete, the payload should be a queryStringObject instead
        let queryStringObject = method === "DELETE" ? payload : {};

        // call the API
        app.client.request(
          undefined,
          path,
          method,
          queryStringObject,
          payload,
          false
        );
      });
    }
  }
};

const addAddress = () => {
  if (userExists) {
    user = userExists;
  }
  const item = document.getElementById("item");
  const itemNodePosition = Array.from(item.parentNode.children).indexOf(item);

  let address = document.getElementById("address");
  if (!address) {
    const form = document.getElementById("register");
    const label = document.createElement("label");
    label.innerText = "Address";
    label.id = "address_label";
    const input = document.createElement("input");
    input.type = "text";
    input.name = "address";
    input.id = "address";
    input.placeholder = "213 Blvd";
    if (user)
      input.value =
        user.gift_choice?.address &&
        user.gift_choice?.address !== null &&
        user.gift_choice?.address !== undefined
          ? user.gift_choice?.address
          : "";

    form.insertBefore(input, form.children[itemNodePosition + 1]);
    form.insertBefore(label, form.children[itemNodePosition + 1]);
  }
};

const addAccountDetails = () => {
  if (userExists) {
    user = userExists;
  }
  const amount = document.getElementById("amount");
  const amountNodePosition = Array.from(amount.parentNode.children).indexOf(
    amount
  );
  let accountNumber = document.getElementById("account_number");
  if (!accountNumber) {
    const form = document.getElementById("register");
    const accountLabel = document.createElement("label");
    accountLabel.innerText = "Account Number";
    accountLabel.id = "account_number_label";
    const accountInput = document.createElement("input");
    accountInput.type = "text";
    accountInput.name = "account_number";
    accountInput.id = "account_number";
    accountInput.placeholder = "2085202951";
    if (user)
      accountInput.value =
        user.gift_choice?.account_number &&
        user.gift_choice?.account_number !== null &&
        user.gift_choice?.account_number != undefined
          ? user.gift_choice?.account_number
          : "";

    const bankLabel = document.createElement("label");
    bankLabel.innerText = "Bank Name";
    bankLabel.id = "bank_name_label";
    const bankInput = document.createElement("input");
    bankInput.type = "text";
    bankInput.name = "bank_name";
    bankInput.id = "bank_name";
    bankInput.placeholder = "zenith";
    if (user)
      bankInput.value =
        user.gift_choice?.bank_name &&
        user.gift_choice?.bank_name != null &&
        user.gift_choice?.bank_name != undefined
          ? user.gift_choice?.bank_name
          : "";

    form.insertBefore(bankInput, form.children[amountNodePosition + 1]);
    form.insertBefore(bankLabel, form.children[amountNodePosition + 1]);
    form.insertBefore(accountInput, form.children[amountNodePosition + 1]);
    form.insertBefore(accountLabel, form.children[amountNodePosition + 1]);
  }
};

const loadChoice = () => {
  if (userExists) {
    user = userExists;
  }
  const item = document.getElementById("item_choice");
  const itemNodePosition = Array.from(item.parentNode.children).indexOf(item);
  const item_choice = item.value;
  const existingItem = document.getElementById("item");
  const existingItemLabel = document.getElementById("item_label");
  const existingAddress = document.getElementById("address");
  const existingAddressLabel = document.getElementById("address_label");
  const existingAmount = document.getElementById("amount");
  const existingAmountLabel = document.getElementById("amount_label");
  const existingAccountNumber = document.getElementById("account_number");
  const existingAccountNumberLabel = document.getElementById(
    "account_number_label"
  );
  const existingBankName = document.getElementById("bank_name");
  const existingBankNameLabel = document.getElementById("bank_name_label");

  const form = document.getElementById("register");

  if (item_choice === "item") {
    // remove amount if amount
    if (existingAmount) {
      existingAmount.parentNode.removeChild(existingAmount);
      existingAmountLabel.parentNode.removeChild(existingAmountLabel);
      if (existingAccountNumber)
        existingAccountNumber.parentNode.removeChild(existingAccountNumber);
      if (existingAccountNumberLabel)
        existingAccountNumberLabel.parentNode.removeChild(
          existingAccountNumberLabel
        );
      if (existingBankName)
        existingBankName.parentNode.removeChild(existingBankName);
      if (existingBankNameLabel)
        existingBankNameLabel.parentNode.removeChild(existingBankNameLabel);
    }
    if (!existingItem) {
      // add item input
      const label = document.createElement("label");
      label.innerText = "Gift Choice Item";
      label.id = "item_label";
      const input = document.createElement("input");
      input.type = "text";
      input.name = "item";
      input.id = "item";
      input.placeholder = "Enter a gift item you want";
      if (!user) {
        input.oninput = addAddress;
      }
      form.insertBefore(input, form.children[itemNodePosition + 1]);
      form.insertBefore(label, form.children[itemNodePosition + 1]);
      if (user) {
        input.value = user.gift_choice?.item ? user.gift_choice.item : "";
        addAddress();
      }
    }
  } else if (item_choice === "amount") {
    // remove item if item
    if (existingItem) {
      existingItem.parentNode.removeChild(existingItem);
      existingItemLabel.parentNode.removeChild(existingItemLabel);
      if (existingAddress)
        existingAddress.parentNode.removeChild(existingAddress);
      if (existingAddressLabel)
        existingAddressLabel.parentNode.removeChild(existingAddressLabel);
    }
    if (!existingAmount) {
      // add amount input
      const label = document.createElement("label");
      label.innerText = "Cash";
      label.id = "amount_label";
      const input = document.createElement("input");
      input.type = "text";
      input.name = "amount";
      input.id = "amount";
      input.placeholder = "Enter amount if you would like cash";
      if (!user) {
        input.oninput = addAccountDetails;
      }
      form.insertBefore(input, form.children[itemNodePosition + 1]);
      form.insertBefore(label, form.children[itemNodePosition + 1]);
      if (user) {
        input.value = user.gift_choice?.amount ? user.gift_choice.amount : "";
        addAccountDetails();
      }
    }
  }
};

// Init
app.init = () => {
  // bind all form submissions
  app.bindForms();
};

// call init after window loads
window.onload = () => {
  const profile = document.getElementById("profile");
  if (profile) {
    loadChoice();
  }
  app.init();
};
