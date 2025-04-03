import dbConfig from "@/middlewares/db.config";
import Prediction from "@/models/Predict";

dbConfig();

export async function DELETE(req: Request) {
  const id = req.url.split("?")[1];
  try {
    if (!id) {
      return Response.json({ message: "ID is required" }, { status: 400 });
    }
    const deletedPrediction = await Prediction.findByIdAndDelete(id);
    if (!deletedPrediction) {
      return Response.json(
        { message: "Prediction not found" },
        { status: 404 }
      );
    }
    return Response.json({ message: "Prediction deleted successfully" });
  } catch (error) {
    console.error("Error deleting prediction:", error);
    return Response.json(
      { message: "Error deleting prediction" },
      { status: 500 }
    );
  }
}
