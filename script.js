console.log("Healthy Food Reviews JavaScript is connected");

// =====================================
// DOM ELEMENTS
// =====================================

// Review form elements
const nameInput = document.getElementById("name");
const ratingInput = document.getElementById("rating");
const reviewInput = document.getElementById("review");
const reviewsList = document.getElementById("reviews-list");
const reviewForm = document.getElementById("reviewform");

// Review statistics
const averageRatingElement = document.getElementById("average-rating");
const buyAgainPercentageElement = document.getElementById(
  "buy-again-percentage"
);
const reviewCountElement = document.getElementById("review-count");

// Product search elements
const productSearchInput = document.getElementById("product-search");
const productSearchResults = document.getElementById("product-search-results");
const searchButton = document.getElementById("search-button");

// Selected product display elements
const selectedProductElement = document.getElementById("selected-product");
const selectedProductBrand = document.getElementById("selected-product-brand");

// Track the currently selected product
let selectedProduct = null;

// =====================================
// LOAD SAVED REVIEWS
// =====================================

const savedReviews = localStorage.getItem("reviews");
const reviews = savedReviews ? JSON.parse(savedReviews) : [];

// =====================================
// REVIEW FUNCTIONS
// =====================================

function displayReview(review) {
  const reviewElement = document.createElement("div");
  const reviewText = document.createElement("p");

  reviewText.textContent = `Name: ${review.name},
Rating: ${review.rating},
Review: ${review.review},
Buy Again: ${review.buyAgain}`;

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";

  deleteButton.addEventListener("click", function () {
    const reviewIndex = reviews.indexOf(review);

    if (reviewIndex !== -1) {
      reviews.splice(reviewIndex, 1);

      localStorage.setItem("reviews", JSON.stringify(reviews));

      // Refresh the selected product's reviews and statistics
      displayProductReviews();
    }
  });

  reviewElement.appendChild(reviewText);
  reviewElement.appendChild(deleteButton);

  reviewsList.appendChild(reviewElement);
}

function calculateAverageRating(reviews) {
  if (reviews.length === 0) {
    return 0;
  }

  let totalRating = 0;

  for (const review of reviews) {
    totalRating += review.rating;
  }

  return totalRating / reviews.length;
}

function calculateBuyAgainPercentage(reviews) {
  if (reviews.length === 0) {
    return 0;
  }

  let yesCount = 0;

  for (const review of reviews) {
    if (review.buyAgain === "yes") {
      yesCount++;
    }
  }

  return (yesCount / reviews.length) * 100;
}

function updateReviewCount(reviews) {
  const reviewCount = reviews.length;

  reviewCountElement.textContent =
    reviewCount === 1 ? "1 Review" : `${reviewCount} Reviews`;
}

function updateReviewSummary(productReviews) {
  const averageRating = calculateAverageRating(productReviews);
  const buyAgainPercentage = calculateBuyAgainPercentage(productReviews);

  averageRatingElement.textContent =
    productReviews.length === 0
      ? "Not yet rated"
      : `⭐ ${averageRating.toFixed(2)} / 5`;

  buyAgainPercentageElement.textContent =
    productReviews.length === 0
      ? "No responses yet"
      : `💚 ${buyAgainPercentage.toFixed(0)}%`;

  updateReviewCount(productReviews);
}

// =====================================
// DISPLAY REVIEWS FOR SELECTED PRODUCT
// =====================================

function displayProductReviews() {
  // Do nothing if no product has been selected
  if (!selectedProduct) {
    return;
  }

  // Find reviews for the selected product
  const matchingReviews = reviews.filter((review) => {
    return review.productCode === selectedProduct.code;
  });

  // Clear previously displayed reviews
  reviewsList.textContent = "";

  // Display matching reviews or an empty-state message
  if (matchingReviews.length === 0) {
    reviewsList.textContent = "Be the first to review this product!";
  } else {
    for (const review of matchingReviews) {
      displayReview(review);
    }
  }

  // Update statistics for this product only
  updateReviewSummary(matchingReviews);
}

// Start with empty statistics until a product is selected
updateReviewSummary([]);

// =====================================
// SEARCH PRODUCTS USING OPEN FOOD FACTS
// =====================================

async function searchProducts(searchTerm) {
  const url =
    "https://world.openfoodfacts.org/cgi/search.pl?" +
    `search_terms=${encodeURIComponent(searchTerm)}` +
    "&search_simple=1" +
    "&action=process" +
    "&json=1" +
    "&page_size=10" +
    "&fields=code,product_name,brands";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  return data.products || [];
}

// =====================================
// DISPLAY MATCHING PRODUCTS
// =====================================

function displayMatchingProduct(product) {
  const productElement = document.createElement("p");

  const productName = product.product_name || "Unnamed product";
  const productBrand = product.brands || "Unknown brand";

  productElement.textContent = `${productName} — ${productBrand}`;

  productElement.addEventListener("click", function () {
    // Remember the selected product
    selectedProduct = product;

    // Display its name and brand
    selectedProductElement.textContent = productName;
    selectedProductBrand.textContent = productBrand;

    // Display reviews belonging to this product
    displayProductReviews();
  });

  productSearchResults.appendChild(productElement);
}

// =====================================
// SEARCH BUTTON EVENT LISTENER
// =====================================

if (productSearchInput && productSearchResults && searchButton) {
  searchButton.addEventListener("click", async function () {
    const searchTerm = productSearchInput.value.trim();

    productSearchResults.textContent = "";

    if (searchTerm === "") {
      productSearchResults.textContent = "Please enter a product name.";
      return;
    }

    productSearchResults.textContent = "Searching...";
    searchButton.disabled = true;

    try {
      const matchingProducts = await searchProducts(searchTerm);

      productSearchResults.textContent = "";

      if (matchingProducts.length === 0) {
        productSearchResults.textContent = "No products found.";
      } else {
        for (const product of matchingProducts) {
          displayMatchingProduct(product);
        }
      }
    } catch (error) {
      console.error("API search error:", error);

      productSearchResults.textContent =
        "Unable to search products right now. Please try again later.";
    } finally {
      searchButton.disabled = false;
    }
  });
} else {
  console.error(
    "Search input, search button, or results container is missing."
  );
}

// =====================================
// REVIEW FORM EVENT LISTENER
// =====================================

if (reviewForm) {
  reviewForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!selectedProduct) {
      alert("Please select a product before submitting a review.");
      return;
    }

    const buyAgainInput = document.querySelector(
      'input[name="buyAgain"]:checked'
    );

    if (!buyAgainInput) {
      alert("Please select whether you would buy this product again.");
      return;
    }

    const newReview = {
      name: nameInput.value.trim(),
      rating: Number(ratingInput.value),
      review: reviewInput.value.trim(),
      buyAgain: buyAgainInput.value,
      productCode: selectedProduct.code,
    };

    // Save the new review
    reviews.push(newReview);

    // Update localStorage
    localStorage.setItem("reviews", JSON.stringify(reviews));

    // Refresh reviews and statistics
    displayProductReviews();

    // Clear the form
    reviewForm.reset();
  });
}

// =====================================
// TEMPORARY TEST PRODUCT
// =====================================

displayMatchingProduct({
  code: "123456789",
  product_name: "Test Strawberry Cereal",
  brands: "Test Brand",
});
