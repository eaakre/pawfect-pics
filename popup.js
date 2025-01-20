// Helper function to capitalize the first letter of each word
function capitalizeWords(str) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Function to format breed names like "mastiff-indian" into "Mastiff Indian"
function formatBreedName(breed) {
  return breed
    .split("-") // Split by hyphen
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each part
    .join(" "); // Join parts back with a space
}

const themeToggleCheckbox = document.getElementById("theme-toggle");
const body = document.body;

// Load saved theme from localStorage
const savedTheme = localStorage.getItem("theme") || "dark"; // Default to dark
body.setAttribute("data-theme", savedTheme);
themeToggleCheckbox.checked = savedTheme === "dark"; // Reverse logic here

themeToggleCheckbox.addEventListener("change", () => {
  const newTheme = themeToggleCheckbox.checked ? "dark" : "light"; // Reverse logic here
  body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

// Populate the breeds dropdown
async function populateBreeds() {
  const breedSelect = document.getElementById("breed-select");
  try {
    const response = await fetch("https://dog.ceo/api/breeds/list/all");
    const data = await response.json();

    const breeds = data.message; // Object containing breeds and sub-breeds
    for (const breed in breeds) {
      if (breeds[breed].length > 0) {
        // Add sub-breeds as options
        breeds[breed].forEach((subBreed) => {
          const option = document.createElement("option");
          option.value = `${breed}/${subBreed}`;
          option.textContent = capitalizeWords(`${subBreed} ${breed}`); // Capitalize the breed/sub-breed
          breedSelect.appendChild(option);
        });
      } else {
        // Add breed as an option
        const option = document.createElement("option");
        option.value = breed;
        option.textContent = capitalizeWords(breed); // Capitalize the breed
        breedSelect.appendChild(option);
      }
    }
  } catch (error) {
    console.error("Error fetching breeds:", error);
  }
}

// Function to fetch dog facts (same as before)
async function fetchDogFacts() {
  try {
    const response = await fetch("https://dog-api.kinduff.com/api/facts");
    const data = await response.json();
    return data.facts;
  } catch (error) {
    console.error("Error fetching dog facts:", error);
    return [];
  }
}

// Function to load the favorites list and allow removal from the dog-image div
function loadFavorites() {
  chrome.storage.local.get("favorites", (data) => {
    const favorites = data.favorites || [];
    const favoritesList = document.getElementById("favorites-list");
    favoritesList.innerHTML = ""; // Clear the current list

    favorites.forEach((favorite) => {
      let imgSrc, breed;

      // Handle both formats
      if (favorite.src) {
        imgSrc = favorite.src;
        breed = favorite.breed || "Unknown";
      } else if (favorite.imageSrc) {
        imgSrc = favorite.imageSrc;
        breed = favorite.breedName || "Unknown";
      }

      // Create image element
      const imgElement = document.createElement("img");
      imgElement.src = imgSrc;
      imgElement.alt = "Favorite Dog Image";
      imgElement.onclick = () => {
        showFavorite(imgSrc, breed); // Pass the image and breed
      };
      favoritesList.appendChild(imgElement);
    });
  });
}

// Function to display the dog image and show the remove button
async function showFavorite(imageUrl, breed = "Unknown") {
  const dogImage = document.getElementById("dog-image");
  const removeButton = document.getElementById("remove-favorite");
  const breedNameElement = document.getElementById("breed-name");
  const saveButton = document.getElementById("save-favorite");

  // Show the image
  dogImage.src = imageUrl;
  dogImage.style.display = "block";

  // Show the breed name
  breedNameElement.textContent = breed;

  // Show the remove button
  removeButton.style.display = "block";

  // Check if the image is already a favorite
  const favoriteStatus = await isFavorite(imageUrl);

  // Show or hide the save button based on whether it's already a favorite
  if (!favoriteStatus) {
    saveButton.style.display = "block"; // Show the save button if it's not already a favorite
  } else {
    saveButton.style.display = "none"; // Hide the save button if it's already a favorite
  }

  // Set up the event listener for removing the favorite
  removeButton.onclick = () => removeFavorite(imageUrl);
}

// Function to remove the image from favorites
function removeFavorite(imageUrl) {
  chrome.storage.local.get("favorites", (data) => {
    let favorites = data.favorites || [];

    // Remove the image by matching its URL
    favorites = favorites.filter((favorite) => {
      // Handle both formats
      if (favorite.src) {
        return favorite.src !== imageUrl;
      } else if (favorite.imageSrc) {
        return favorite.imageSrc !== imageUrl;
      }
      return false; // Exclude invalid entries
    });

    // Save the updated list back to chrome storage
    chrome.storage.local.set({ favorites }, () => {
      console.log("Favorite removed!");
      loadFavorites(); // Reload the favorites list
      clearDogImage(); // Clear the dog image and hide the remove button
    });
  });
}

// Function to clear the displayed dog image and hide the remove button
function clearDogImage() {
  const dogImage = document.getElementById("dog-image");
  const removeButton = document.getElementById("remove-favorite");
  const saveButton = document.getElementById("save-favorite");

  dogImage.src = ""; // Clear the image
  dogImage.style.display = "none"; // Hide the image
  removeButton.style.display = "none"; // Hide the remove button
  saveButton.style.display = "none"; // Hide the save button
}

// Function to check if the image is already a favorite
async function isFavorite(imageUrl) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("favorites", (data) => {
      const favorites = data.favorites || [];
      const isFavorite = favorites.some(
        (favorite) =>
          favorite.src === imageUrl || favorite.imageSrc === imageUrl
      );
      resolve(isFavorite);
    });
  });
}

// Function to save a dog image as a favorite
function saveFavorite(imageUrl) {
  const breedName =
    document.getElementById("breed-name").textContent || "Unknown";

  chrome.storage.local.get("favorites", (data) => {
    let favorites = data.favorites || [];

    // Check for duplicates
    const isAlreadyFavorite = favorites.some(
      (favorite) => favorite.src === imageUrl || favorite.imageSrc === imageUrl
    );

    if (!isAlreadyFavorite) {
      const favorite = { src: imageUrl, breed: breedName }; // Use the consistent format
      favorites.push(favorite);
      chrome.storage.local.set({ favorites }, () => {
        console.log("Favorite saved!");
        loadFavorites(); // Reload the favorites list
      });
    }
  });
}

// Function to display a dog image in the main area
function showImage(imageUrl) {
  const img = document.getElementById("dog-image");
  img.src = imageUrl;
  img.style.display = "block";
}

// Event listener for the "Get Dog" button
document.getElementById("fetch-dog").addEventListener("click", async () => {
  const breedSelect = document.getElementById("breed-select");
  const container = document.getElementById("dog-container");
  const img = document.getElementById("dog-image");
  const fact = document.getElementById("dog-fact");

  // Hide the save button when a new dog is fetched
  const saveButton = document.getElementById("save-favorite");
  saveButton.style.display = "none"; // Hide the save button initially

  const breed = breedSelect.value; // Get selected breed (or empty for random)
  const breedName = breed === "" ? "Random" : formatBreedName(breed); // Format breed name for display

  const url = breed
    ? `https://dog.ceo/api/breed/${breed}/images/random`
    : "https://dog.ceo/api/breeds/image/random";

  try {
    // Fetch dog image
    const imageResponse = await fetch(url, {
      headers: {
        Accept: "image/*",
      },
      mode: "cors",
    });
    const imageData = await imageResponse.json();

    // Extract the breed name from the image URL (path before the image name)
    const breedFromUrl = imageData.message.split("/")[4]; // Extract "mastiff-indian" from the URL
    const formattedBreedName = formatBreedName(breedFromUrl);

    img.src = imageData.message;
    img.alt = `A ${breed || "random"} dog`;
    img.style.display = "block"; // Show the image

    // Fetch dog facts
    const facts = await fetchDogFacts();
    const breedFact = facts.find((fact) =>
      fact.toLowerCase().includes(breed.toLowerCase())
    );

    if (breedFact) {
      fact.textContent = breedFact; // Display the breed-specific fact
    } else {
      fact.textContent = "Here's a random dog fact: " + facts[0]; // If no match, show a random fact
    }

    // Display the breed name in the UI
    document.getElementById("breed-name").textContent = formattedBreedName;

    // After displaying the new dog, recheck if it's a favorite
    const favoriteStatus = await isFavorite(imageData.message);

    // Show or hide the save button based on whether it's already a favorite
    if (!favoriteStatus) {
      saveButton.style.display = "block"; // Show the save button if it's not already a favorite
    } else {
      saveButton.style.display = "none"; // Hide the save button if it's already a favorite
    }
  } catch (error) {
    container.textContent = "Failed to fetch dog picture or fact. Try again!";
    console.error(error);
  }
});

// Event listener for the "Save as Favorite" button
document.getElementById("save-favorite").addEventListener("click", () => {
  const imgSrc = document.getElementById("dog-image").src;
  const breedName = document.getElementById("breed-name").textContent;

  if (imgSrc) {
    saveFavorite(imgSrc, breedName); // Pass both the image URL and breed name
  }
});

// Function to generate meme
document.getElementById("generate-meme").addEventListener("click", () => {
  const memeDisplay = document.getElementById("meme-display");
  const dogImage = document.getElementById("dog-image");

  if (dogImage.src && dogImage.complete) {
    memeDisplay.style.display = "inline-block";

    const topText = document.getElementById("top-text").value.toUpperCase();
    const bottomText = document
      .getElementById("bottom-text")
      .value.toUpperCase();
    const imgSrc = dogImage.src;

    if (imgSrc) {
      const memeImage = document.getElementById("dog-meme-image");
      memeImage.src = imgSrc;

      const memeTextElement = document.getElementById("meme-text");
      memeTextElement.textContent = topText;
      memeTextElement.classList.remove("bottom");

      // Remove any existing bottom text before adding new
      const existingBottomText = memeDisplay.querySelector(".bottom");
      if (existingBottomText) {
        existingBottomText.remove();
      }

      // If there's bottom text, add it
      if (bottomText) {
        const bottomTextElement = document.createElement("p");
        bottomTextElement.textContent = bottomText;
        bottomTextElement.classList.add("bottom");
        memeImage.parentNode.appendChild(bottomTextElement);
      }
    }
  } else {
    alert("Please select a dog image first!");
  }
});

// Add a close button handler if you want to hide the meme display
document.getElementById("close-meme").addEventListener("click", () => {
  const memeDisplay = document.getElementById("meme-display");
  memeDisplay.style.display = "none";

  // Clear the text inputs
  document.getElementById("top-text").value = "";
  document.getElementById("bottom-text").value = "";

  // Remove any bottom text element
  const bottomText = memeDisplay.querySelector(".bottom");
  if (bottomText) {
    bottomText.remove();
  }
});

// Hide meme display when fetching new dog
document.getElementById("fetch-dog").addEventListener("click", () => {
  const memeDisplay = document.getElementById("meme-display");
  memeDisplay.style.display = "none";
});

// Function to save meme
async function saveMeme() {
  const memeImage = document.getElementById("dog-meme-image");

  try {
    const response = await fetch(memeImage.src);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const img = new Image();
    img.src = objectUrl;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);

    // Configure text style
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.textAlign = "center";
    ctx.letterSpacing = "4px";

    const fontSize = 24;
    ctx.font = `bold ${fontSize}px Impact, Arial`;

    const topText = document.getElementById("top-text").value.toUpperCase();
    const bottomText = document
      .getElementById("bottom-text")
      .value.toUpperCase();

    function drawText(text, y) {
      const x = canvas.width / 2;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    }

    if (topText) {
      drawText(topText, fontSize + 5);
    }

    if (bottomText) {
      drawText(bottomText, canvas.height - fontSize - 5);
    }

    canvas.toBlob((blob) => {
      URL.revokeObjectURL(objectUrl);

      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "dog-meme.png";

      document.body.appendChild(downloadLink);
      downloadLink.click();

      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    }, "image/png");
  } catch (error) {
    console.error("Error saving meme:", error);
    alert("Failed to save the meme. Please try again.");
  }
}

document.getElementById("save-meme").addEventListener("click", saveMeme);

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("favorites", (data) => {
    let favorites = data.favorites || [];
    let migrated = false;

    // Standardize all entries
    favorites = favorites.map((favorite) => {
      if (favorite.imageSrc) {
        migrated = true;
        return {
          src: favorite.imageSrc,
          breed: favorite.breedName || "Unknown",
        };
      }
      return favorite; // Already in the correct format
    });

    if (migrated) {
      chrome.storage.local.set({ favorites }, () => {
        console.log("Favorites migrated to a consistent format.");
      });
    }
  });

  populateBreeds();
  loadFavorites(); // Load the favorites from storage
});

// Initialize favorites list on page load
// document.addEventListener("DOMContentLoaded", () => {
//   populateBreeds();
//   loadFavorites(); // Load the favorites from storage
// });
