export class DogFacts {
  async fetch() {
    try {
      const response = await fetch("https://dog-api.kinduff.com/api/facts");
      const data = await response.json();
      return data.facts;
    } catch (error) {
      console.error("Error fetching dog facts:", error);
      return [];
    }
  }
}
