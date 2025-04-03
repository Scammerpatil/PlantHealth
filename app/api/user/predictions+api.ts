import dbConfig from "@/middlewares/db.config";
import Prediction from "@/models/Predict";
import User from "@/models/User";

dbConfig();

export async function POST(req: Request) {
  const { email } = await req.json();
  console.log(email);
  if (!email) {
    return Response.json({ message: "Email is required" }, { status: 400 });
  }
  try {
    const user = await User.find({ email });
    const predictions = await Prediction.find({ user: user });
    if (!predictions) {
      return Response.json(
        { message: "No predictions found" },
        { status: 404 }
      );
    }
    return Response.json({ predictions }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { message: "Failed to get predictions" },
      { status: 500 }
    );
  }
}
