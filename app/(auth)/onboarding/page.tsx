import AccountProfile from '@/components/forms/AccountProfile'
import { currentUser } from '@clerk/nextjs/server'
import { userInfo } from 'os';



async function Page() {

  const user = await currentUser();
  const userInfo = {}

  const userData = {
    id: user?.id || '',  // fallback to empty string if user.id is undefined
    objectId: userInfo?._id || '',  // fallback to empty string if userInfo._id is undefined
    username: userInfo?.username || user?.username || '',  // fallback to empty string if both are undefined
    name: userInfo?.name || user?.firstName || '',  // fallback to empty string if both are undefined
    bio: userInfo?.bio || '',  // fallback to empty string if bio is undefined
    image: userInfo?.image || user.imageUrl || '',  // fallback to empty string if image is undefined
  };
  
// console.log({userData})
// console.log({user})
// console.log(user.imageUrl)

  return (
    <main className='mx-auto flex max-w-3xl flex-col justify-start px-10 py-20'>
      <h1 className='head-text'>Onboarding</h1>
      <p className='mt-3 text-base-regular text-light-2'>
        Complete your profile now, to use Threds.
      </p>

      <section className='mt-9 bg-dark-2 p-10'>
        <AccountProfile user={userData} btnTitle='Continue' />
      </section>
    </main>
  );
}

export default Page;












// import { currentUser } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";

// // import { fetchUser } from "@/lib/actions/user.actions";
// import AccountProfile from "@/components/forms/AccountProfile";

// async function Page() {
//   const user = await currentUser();
//   if (!user) return null; // to avoid typescript warnings

//   const userInfo = await fetchUser(user.id);
//   if (userInfo?.onboarded) redirect("/");

//   const userData = {
//     id: user.id,
//     objectId: userInfo?._id,
//     username: userInfo ? userInfo?.username : user.username,
//     name: userInfo ? userInfo?.name : user.firstName ?? "",
//     bio: userInfo ? userInfo?.bio : "",
//     image: userInfo ? userInfo?.image : user.imageUrl,
//   };

//   return (
//     <main className='mx-auto flex max-w-3xl flex-col justify-start px-10 py-20'>
//       <h1 className='head-text'>Onboarding</h1>
//       <p className='mt-3 text-base-regular text-light-2'>
//         Complete your profile now, to use Threds.
//       </p>

//       <section className='mt-9 bg-dark-2 p-10'>
//         <AccountProfile user={userData} btnTitle='Continue' />
//       </section>
//     </main>
//   );
// }

// export default Page;