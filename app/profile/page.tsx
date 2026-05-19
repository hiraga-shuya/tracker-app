import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";

import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const userId = await getUserId();

  if (!userId) {
    return <div>ユーザー情報がありません</div>;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return (
    <ProfileForm
      initialName={user?.name ?? ""}
      initialImage={user?.image ?? ""}
    />
  );
}
