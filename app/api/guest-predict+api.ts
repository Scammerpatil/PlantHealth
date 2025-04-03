import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const suggestions = {
  "Early Blight": [
    "Remove affected leaves and dispose of them properly.",
    "Apply fungicides as per the manufacturer's instructions.",
    "Ensure proper air circulation around plants to reduce humidity.",
    "Rotate crops to prevent recurrence in the next planting season.",
    "Consider using resistant varieties in future plantings.",
  ],
  "Late Blight": [
    "Remove and destroy infected plants immediately.",
    "Apply fungicides specifically designed for late blight.",
    "Ensure proper spacing between plants to improve airflow.",
    "Avoid overhead watering to reduce humidity around the plants.",
    "Consider planting resistant potato varieties in the future.",
  ],
  Healthy: [
    "No action needed. Your potato plants are healthy!",
    "Continue regular monitoring and care for your plants.",
    "Maintain good agricultural practices to ensure plant health.",
  ],
};

const execAsync = promisify(exec);

export async function POST(req: Request) {
  const { image } = await req.json();
  if (!image) {
    return Response.json({ message: "No image provided" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(image, "base64");
    const imagePath = "python/guest.jpg";
    fs.writeFileSync(imagePath, buffer);

    const { stdout, stderr } = await execAsync(
      `py -3.12 python/run.py ${imagePath}`
    );
    fs.unlinkSync(imagePath);
    if (stdout.includes("No leaf detected in the image.")) {
      return Response.json(
        { message: "No leaf detected in the image." },
        { status: 500 }
      );
    }
    const prediction = JSON.parse(stdout.trim().split("\n").pop()!);
    const confidence = prediction.confidence * 100;
    let response = {
      prediction: prediction.class,
      confidence: prediction.confidence,
      interpretation: "",
      textClass: "",
      suggestions: [],
    };

    if (confidence >= 80) {
      response.interpretation = `We are confident this is ${prediction.class}.`;
      response.suggestions = suggestions[prediction.class] || [
        "No suggestions available for this prediction.",
      ];
      response.textClass = "green";
    } else if (confidence >= 50) {
      response.interpretation = `We think this might be ${prediction.class}, but consider a second opinion or re-capture the image.`;
      response.suggestions = suggestions[prediction.class] || [
        "No suggestions available for this prediction.",
      ];
      response.textClass = "orange";
    } else {
      response.interpretation = `We are unsure about the result but we are assuming ${prediction.class}. Try uploading a clearer image or consult an expert.`;
      response.suggestions = suggestions[prediction.class] || [
        "No suggestions available for this prediction.",
      ];
      response.textClass = "red";
    }

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in prediction:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
