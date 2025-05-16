import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SignIn
        appearance={{
          baseTheme: dark,
          elements: {
            formButtonPrimary: 
              "bg-primary-600 hover:bg-primary-700 text-sm normal-case",
            card: "bg-white shadow-xl",
          },
        }}
      />
    </div>
  );
} 