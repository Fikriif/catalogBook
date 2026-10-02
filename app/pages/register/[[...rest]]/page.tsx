import { SignUp } from '@clerk/nextjs'

const page = () => {
  return (
    <div>
        <SignUp forceRedirectUrl={"/pages/dashboard"} signInUrl='/pages/login' />
    </div>
  )
}

export default page