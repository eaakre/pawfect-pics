export class MemeGenerator {
  constructor() {
    this.memeDisplay = document.getElementById("meme-display");
    this.bindEvents();
  }

  bindEvents() {
    document
      .getElementById("generate-meme")
      .addEventListener("click", () => this.generate());
    document
      .getElementById("close-meme")
      .addEventListener("click", () => this.close());
    document
      .getElementById("save-meme")
      .addEventListener("click", () => this.save());
  }

  generate() {
    const dogImage = document.getElementById("dog-image");
    if (!dogImage.src || !dogImage.complete) {
      alert("Please select a dog image first!");
      return;
    }

    this.memeDisplay.style.display = "inline-block";
    const topText = document.getElementById("top-text").value.toUpperCase();
    const bottomText = document
      .getElementById("bottom-text")
      .value.toUpperCase();

    const memeImage = document.getElementById("dog-meme-image");
    memeImage.src = dogImage.src;

    this.updateMemeText(topText, bottomText);
  }

  updateMemeText(topText, bottomText) {
    const memeTextElement = document.getElementById("meme-text");
    const memeImage = document.getElementById("dog-meme-image");

    memeTextElement.textContent = topText;
    memeTextElement.classList.remove("bottom");

    const existingBottomText = this.memeDisplay.querySelector(".bottom");
    if (existingBottomText) {
      existingBottomText.remove();
    }

    if (bottomText) {
      const bottomTextElement = document.createElement("p");
      bottomTextElement.textContent = bottomText;
      bottomTextElement.classList.add("bottom");
      memeImage.parentNode.appendChild(bottomTextElement);
    }
  }

  close() {
    this.memeDisplay.style.display = "none";
    document.getElementById("top-text").value = "";
    document.getElementById("bottom-text").value = "";

    const bottomText = this.memeDisplay.querySelector(".bottom");
    if (bottomText) {
      bottomText.remove();
    }
  }

  async save() {
    const memeImage = document.getElementById("dog-meme-image");
    try {
      const canvas = await this.createMemeCanvas(memeImage);
      this.downloadMeme(canvas);
    } catch (error) {
      console.error("Error saving meme:", error);
      alert("Failed to save the meme. Please try again.");
    }
  }

  async createMemeCanvas(memeImage) {
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
    this.configureMemeText(ctx, canvas);

    URL.revokeObjectURL(objectUrl);
    return canvas;
  }

  configureMemeText(ctx, canvas) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.textAlign = "center";
    ctx.letterSpacing = "2px";

    const fontSize = 24;
    ctx.font = `bold ${fontSize}px Impact, Arial`;

    const topText = document.getElementById("top-text").value.toUpperCase();
    const bottomText = document
      .getElementById("bottom-text")
      .value.toUpperCase();

    if (topText) {
      this.drawText(ctx, topText, canvas.width / 2, fontSize + 5);
    }
    if (bottomText) {
      this.drawText(
        ctx,
        bottomText,
        canvas.width / 2,
        canvas.height - fontSize - 5
      );
    }
  }

  drawText(ctx, text, x, y) {
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  }

  downloadMeme(canvas) {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "dog-meme.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    }, "image/png");
  }
}
