console.log("Healthy Food Reviews Javascript is connected");

// DOM ELEMENTS + APP DATA
const productSearchInput = document.getElementById("product-name");
const productSearchResults = document.getElementById("product-search-results");

const nameInput = document.getElementById("name");
const ratingInput = document.getElementById("rating");
const reviewInput = document.getElementById("review");
const reviewsList = document.getElementById("reviews-list");
const reviewForm = document.getElementById("reviewform");
const averageRatingElement = document.getElementById("average-rating");
const buyAgainPercentageElement = document.getElementById(
  "buy-again-percentage"
);
const reviewCountElement = document.getElementById("review-count");

const savedReviews = localStorage.getItem("reviews");

const reviews = savedReviews ? JSON.parse(savedReviews) : [];

// FUNCTIONS

function displayReview(review) {
  const reviewElement = document.createElement("p");

  reviewElement.textContent = `Name: ${review.name},
  Rating: ${review.rating},
  Review: ${review.review},
  Buy Again: ${review.buyAgain}`;

  const deleteButton = document.createElement("button");

  deleteButton.textContent = "Delete";

  reviewsList.appendChild(reviewElement);
  reviewsList.appendChild(deleteButton);
}

function calculateAverageRating(reviews) {
  let totalRating = 0;

  for (const review of reviews) {
    totalRating = totalRating + review.rating;
  }

  const averageRating = totalRating / reviews.length;

  return averageRating;
}

function calculateBuyAgainPercentage(reviews) {
  let yesCount = 0;

  for (const review of reviews) {
    if (review.buyAgain === "yes") {
      yesCount++;
    }
  }

  const buyAgainPercentage = (yesCount / reviews.length) * 100;

  return buyAgainPercentage;
}

function updateReviewCount(reviews) {
  const reviewCount = reviews.length;
  reviewCountElement.textContent =
    reviewCount === 1 ? "1 Review" : `${reviewCount} Reviews`;
}
for (const review of reviews) {
  displayReview(review);
}

if (reviews.length > 0) {
  const averageRating = calculateAverageRating(reviews);

  averageRatingElement.textContent = `⭐ ${averageRating.toFixed(2)} / 5`;

  const buyAgainPercentage = calculateBuyAgainPercentage(reviews);

  buyAgainPercentageElement.textContent = `💚 ${buyAgainPercentage.toFixed(
    0
  )}%`;

  updateReviewCount(reviews);
}

// EVENT LISTENER

reviewForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const buyAgainInput = document.querySelector(
    'input[name="buyAgain"]:checked'
  );

  const newReview = {
    name: nameInput.value.trim(),
    rating: Number(ratingInput.value),
    review: reviewInput.value.trim(),
    buyAgain: buyAgainInput.value,
  };

  // Add new review to reviews array
  reviews.push(newReview);

  //Local Storage Stringify
  localStorage.setItem("reviews", JSON.stringify(reviews));

  // Display new review
  displayReview(newReview);

  const averageRating = calculateAverageRating(reviews);
  averageRatingElement.textContent = `⭐ ${averageRating.toFixed(2)} / 5`;

  const buyAgainPercentage = calculateBuyAgainPercentage(reviews);
  buyAgainPercentageElement.textContent = `💚 ${buyAgainPercentage.toFixed(
    0
  )}%`;

  updateReviewCount(reviews);

  reviewForm.reset();
});
