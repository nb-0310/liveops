document.getElementById("loginBtn").addEventListener("click", function () {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  axios
    .post("Localhost:8080/api/login", { username: username, password: password })
    .then(function (response) {
      var token = response.data.token;
      fetchOffers(token);
    })
    .catch(function (error) {
      var errorMessage = error.response.data.error;
      showError(errorMessage);
    });
});

function fetchOffers(token) {
  axios
    .get("Localhost:8080/api/offers", { headers: { Authorization: token } })
    .then(function (response) {
      var offers = response.data;
      showOffers(offers);
    })
    .catch(function (error) {
      var errorMessage = error.response.data.error;
      showError(errorMessage);
    });
}

function showOffers(offers) {
  var offerList = document.getElementById("offerList");
  offerList.innerHTML = "";

  offers.forEach(function (offer) {
    var offerCard = document.createElement("div");
    offerCard.classList.add("offer-card");

    var image = document.createElement("img");
    image.src = offer.offer_image;
    offerCard.appendChild(image);

    var title = document.createElement("h3");
    title.textContent = offer.offer_title;
    offerCard.appendChild(title);

    var description = document.createElement("p");
    description.textContent = offer.offer_description;
    offerCard.appendChild(description);

    offerList.appendChild(offerCard);
  });
}

function showError(error) {
  var errorDiv = document.createElement("div");
  errorDiv.classList.add("error");
  errorDiv.textContent = error;

  var container = document.querySelector(".container");
  container.appendChild(errorDiv);
}