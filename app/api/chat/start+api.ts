export async function GET() {
  return Response.json(
    { message: "Hello! How can I assist you?" },
    { status: 200 }
  );
}
