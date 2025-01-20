import { ThemeToggle } from "./components/ThemeToggle.js";
import { BreedSelector } from "./components/BreedSelector.js";
import { DogFacts } from "./components/DogFacts.js";
import { FavoritesManager } from "./components/FavoritesManager.js";
import { MemeGenerator } from "./components/MemeGenerator.js";

class App {
  constructor() {
    this.themeToggle = new ThemeToggle();
    this.breedSelector = new BreedSelector();
    this.dogFacts = new DogFacts();
    this.favoritesManager = new FavoritesManager();
    this.memeGenerator = new MemeGenerator();

    this.initialize();
  }

  initialize() {
    this.breedSelector.initialize();
    this.favoritesManager.load();
    this.setupDogFetching();
  }

  setupDogFetching() {
    document.getElementById("fetch-dog").addEventListener("click", async () => {
      await this.fetchNewDog();
      this.memeGenerator.close();
    });
  }

  async fetchNewDog() {
    const breed = this.breedSelector.breedSelect.value;
    const url = breed
      ? `https://dog.ceo/api/breed/${breed}/images/random`
      : "https://dog.ceo/api/breeds/image/random";

    try {
      const [imageData, facts] = await Promise.all([
        fetch(url).then((res) => res.json()),
        this.dogFacts.fetch(),
      ]);

      this.updateDogDisplay(imageData.message, breed, facts);
    } catch (error) {
      console.error("Error fetching dog:", error);
      document.getElementById("dog-container").textContent =
        "Failed to fetch dog picture or fact. Try again!";
    }
  }

  async updateDogDisplay(imageUrl, breed, facts) {
    const img = document.getElementById("dog-image");
    const factElement = document.getElementById("dog-fact");
    const saveButton = document.getElementById("save-favorite");

    img.src = imageUrl;
    img.alt = `A ${breed || "random"} dog`;
    img.style.display = "block";

    const breedFromUrl = imageUrl.split("/")[4];
    const breedName = this.breedSelector.capitalizeWords(breedFromUrl);
    document.getElementById("breed-name").textContent = breedName;

    const breedFact = facts.find((fact) =>
      fact.toLowerCase().includes(breed?.toLowerCase() || "")
    );
    factElement.textContent = breedFact
      ? breedFact
      : "Here's a random dog fact: " + facts[0];

    const isFav = await this.favoritesManager.isFavorite(imageUrl);
    saveButton.style.display = isFav ? "none" : "block";
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new App();
});
