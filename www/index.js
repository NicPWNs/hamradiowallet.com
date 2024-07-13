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
      var request = new XMLHttpRequest();
      request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          window.alert(request.responseText);
        }
      };
      request.open("GET", "filename", true);
      request.send();
    }
  }
}
