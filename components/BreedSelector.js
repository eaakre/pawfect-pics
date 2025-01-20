export class BreedSelector {
  constructor() {
    this.breedSelect = document.getElementById("breed-select");
  }

  async initialize() {
    try {
      const response = await fetch("https://dog.ceo/api/breeds/list/all");
      const data = await response.json();
      this.populateBreeds(data.message);
    } catch (error) {
      console.error("Error fetching breeds:", error);
    }
  }

  populateBreeds(breeds) {
    for (const [breed, subBreeds] of Object.entries(breeds)) {
      if (subBreeds.length > 0) {
        this.addSubBreeds(breed, subBreeds);
      } else {
        this.addBreed(breed);
      }
    }
  }

  addSubBreeds(breed, subBreeds) {
    subBreeds.forEach((subBreed) => {
      const option = document.createElement("option");
      option.value = `${breed}/${subBreed}`;
      option.textContent = this.capitalizeWords(`${subBreed} ${breed}`);
      this.breedSelect.appendChild(option);
    });
  }

  addBreed(breed) {
    const option = document.createElement("option");
    option.value = breed;
    option.textContent = this.capitalizeWords(breed);
    this.breedSelect.appendChild(option);
  }

  capitalizeWords(str) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}
