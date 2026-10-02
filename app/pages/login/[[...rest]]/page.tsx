import { SignIn } from "@clerk/nextjs"

const page = () => {
  return (
    <div>
        <SignIn forceRedirectUrl={"/pages/dashboard"} signUpUrl="/pages/register" />
    </div>
  )
}

export default page