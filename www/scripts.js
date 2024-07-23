if (!window.matchMedia("(prefers-color-scheme:dark)").matches) {
  document.body.style.background = "white";
}

const card = document.getElementById("card");
const buttonClick = document.getElementById("buttonFlip");

buttonClick.addEventListener("click", function (e) {
  card.classList.add("card_hover");
});

card.addEventListener("click", function () {
  card.classList.add("card_hover");
});

function validateForm() {
  const callsign = document.getElementById("callsign").value;
  const zipcode = document.getElementById("zipcode").value;
  const callError = document.getElementById("callError");
  const zipError = document.getElementById("zipError");
  error = false;
  if (!/^(?:[KNW]|A[A-L]|[KNW][A-Z])[0-9][A-Z]{1,3}$/.test(callsign)) {
    callError.style.display = "block";
    error = true;
  } else {
    callError.style.display = "none";
  }

  if (!/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipcode)) {
    zipError.style.display = "block";
    error = true;
  } else {
    zipError.style.display = "none";
  }

  if (error) {
    return false;
  }
  return true;
}

async function submitForm() {
  if (card.classList.contains("card_hover")) {
    if (validateForm()) {
      const callsign = document.getElementById("callsign").value;
      const zipcode = document.getElementById("zipcode").value;

      const request = new Request(
        "https://gwoysu5u27.execute-api.us-east-1.amazonaws.com/hamradiowallet?callsign=" +
          callsign +
          "&zipcode=" +
          zipcode
      );

      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            throw new Error("API Gateway Error");
          }
        })
        .then((response) => {
          window.alert(response);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
}
