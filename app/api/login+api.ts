import User from "../../models/User";
import dbConfig from "../../middlewares/db.config";

dbConfig();
export async function POST(req: Request) {
  const { email, name, photo } = await req.json();
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json({ message: "User Found" }, { status: 200 });
    } else {
      const newUser = new User({ email, name, photo });
      await newUser.save();
      return Response.json({ message: "User Created" }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ message: "Error creating user" }, { status: 500 });
  }
}
