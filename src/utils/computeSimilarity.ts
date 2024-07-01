import dot from "compute-dot";
import cosineSimilarity from "compute-cosine-similarity";
import { getSimilarityMeasure } from "../config";

const computeSimilarity = (x: number[], y: number[]): number => {
  const similarityMeasure = getSimilarityMeasure();

  if (similarityMeasure === "cosine") {
    return cosineSimilarity(x, y);
  } else if (similarityMeasure === "dot") {
    return dot(x, y);
  } else {
    console.log("Invalid similarity measure");
  }

  throw new Error("Invalid Similarity Measure");
};

export default computeSimilarity;
