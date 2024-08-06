import CollaborativeRoom from "@/components/CollaborativeRoom"
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";

const Document = async ({ params: { id } }: SearchParamProps) => {
  const clerkUser = await currentUser();
  if(!clerkUser) redirect('/sign-in');

  const room = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });

  if(!room) redirect('/');

  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers({ userIds });

  // const usersData = users.map((user: User) => ({
  //   ...user,
  //   userType: room.usersAccesses[user.email]?.includes('room:write')
  //     ? 'editor'
  //     : 'viewer'
  // }))
  const usersData = users.map((user: User) => {
    if (!user) {
      return null; // or you can handle it differently, e.g., returning an empty object
    }
    
    return {
      ...user,
      userType: room.usersAccesses[user.email] && room.usersAccesses[user.email].includes('room:write')
        ? 'editor'
        : 'viewer'
    };
  }).filter((user: null) => user !== null); // To remove any null values from the result array if you choose to return null
  
  

  const currentUserType = room.usersAccesses[clerkUser.emailAddresses[0].emailAddress]?.includes('room:write') ? 'editor' : 'viewer';

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom 
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
      />
    </main>
  )
}

export default Document