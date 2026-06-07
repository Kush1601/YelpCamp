import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center py-12">
      <SignIn
        appearance={{
          variables: { colorPrimary: "#2d6a4f", borderRadius: "0.75rem" },
          elements: {
            card: "backdrop-blur-xl",
            formButtonPrimary:
              "bg-gradient-to-r from-emerald-700 to-teal-500 hover:brightness-105",
          },
        }}
      />
    </div>
  );
}
