export class FavoritesManager {
  constructor() {
    this.favoritesList = document.getElementById("favorites-list");
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById("save-favorite").addEventListener("click", () => {
      const imgSrc = document.getElementById("dog-image").src;
      const breedName = document.getElementById("breed-name").textContent;
      this.saveFavorite(imgSrc, breedName);
    });
  }

  async load() {
    const data = await this.getFavorites();
    this.renderFavorites(data.favorites || []);
  }

  async getFavorites() {
    return new Promise((resolve) => {
      chrome.storage.local.get("favorites", resolve);
    });
  }

  renderFavorites(favorites) {
    this.favoritesList.innerHTML = "";
    favorites.forEach((favorite) => {
      const imgSrc = favorite.src || favorite.imageSrc;
      const breed = favorite.breed || favorite.breedName || "Unknown";
      this.createFavoriteElement(imgSrc, breed);
    });
  }

  createFavoriteElement(imgSrc, breed) {
    const imgElement = document.createElement("img");
    imgElement.src = imgSrc;
    imgElement.alt = "Favorite Dog Image";
    imgElement.onclick = () => this.showFavorite(imgSrc, breed);
    this.favoritesList.appendChild(imgElement);
  }

  async showFavorite(imageUrl, breed) {
    const dogImage = document.getElementById("dog-image");
    const removeButton = document.getElementById("remove-favorite");
    const breedNameElement = document.getElementById("breed-name");
    const saveButton = document.getElementById("save-favorite");

    dogImage.src = imageUrl;
    dogImage.style.display = "block";
    breedNameElement.textContent = breed;
    removeButton.style.display = "block";

    const isFav = await this.isFavorite(imageUrl);
    saveButton.style.display = isFav ? "none" : "block";

    removeButton.onclick = () => this.removeFavorite(imageUrl);
  }

  async isFavorite(imageUrl) {
    const data = await this.getFavorites();
    const favorites = data.favorites || [];
    return favorites.some(
      (fav) => fav.src === imageUrl || fav.imageSrc === imageUrl
    );
  }

  async saveFavorite(imageUrl, breedName) {
    const data = await this.getFavorites();
    let favorites = data.favorites || [];

    const isAlreadyFavorite = await this.isFavorite(imageUrl);
    if (!isAlreadyFavorite) {
      favorites.push({ src: imageUrl, breed: breedName });
      await this.setFavorites(favorites);
      this.load();
    }
  }

  async removeFavorite(imageUrl) {
    const data = await this.getFavorites();
    let favorites = data.favorites || [];

    favorites = favorites.filter(
      (fav) => fav.src !== imageUrl && fav.imageSrc !== imageUrl
    );

    await this.setFavorites(favorites);
    this.load();
    this.clearDogImage();
  }

  setFavorites(favorites) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ favorites }, resolve);
    });
  }

  clearDogImage() {
    const dogImage = document.getElementById("dog-image");
    const removeButton = document.getElementById("remove-favorite");
    const saveButton = document.getElementById("save-favorite");

    dogImage.src = "";
    dogImage.style.display = "none";
    removeButton.style.display = "none";
    saveButton.style.display = "none";
  }
}
