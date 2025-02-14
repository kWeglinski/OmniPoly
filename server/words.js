import fs from "fs";
import path from "path";

const dirname = new URL(".", import.meta.url).pathname;

// Function to ensure the 'data' directory exists
function ensureDataDirectory() {
  const dataDir = path.join(dirname, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
    console.log("Created directory: data");
  }
}

// Function to ensure words.json exists and is an empty array if it doesn't
function ensureWordsJson() {
  const wordsFilePath = path.join(dirname, "data", "words.json");
  if (!fs.existsSync(wordsFilePath)) {
    fs.writeFileSync(wordsFilePath, JSON.stringify([]));
    console.log("Created file: data/words.json with empty array");
  }
}

// Function to add a string to the words.json array
function addStringToWordsJson(str) {
  const wordsFilePath = path.join(dirname, "data", "words.json");
  let wordsArray = JSON.parse(fs.readFileSync(wordsFilePath, "utf8"));
  wordsArray.push(str);
  fs.writeFileSync(wordsFilePath, JSON.stringify(wordsArray, null, 2));
  console.log(`Added string "${str}" to data/words.json`);
}

// Main function
export const addWord = (inputString) => {
  ensureDataDirectory();
  ensureWordsJson();
  addStringToWordsJson(inputString);
};

export const lookupWords = () => {
  const filePath = path.join(dirname, "data", "words.json");
  if (fs.existsSync(filePath)) {
    try {
      // Read the file content
      const data = fs.readFileSync(filePath, "utf-8");
      // Parse the JSON content into an array
      const wordsArray = JSON.parse(data);
      return new Set(wordsArray);
    } catch (error) {
      return new Set([]);
    }
  } else {
    return new Set([]);
  }
};

export const lookupWord = (word) => {
  const wordsArray = lookupWords();
  return wordsArray.has(word.toLowerCase());
};
