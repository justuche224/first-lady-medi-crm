import { auth } from "@/lib/auth";
import "dotenv/config";
async function main() {
  try {
    console.log("seeding admin");
    const data = await auth.api.signUpEmail({
      body: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password1234",
        image: "https://example.com/image.png",
        role: "admin",
      },
    });
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

main();
