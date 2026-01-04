import { auth, currentUser } from "@clerk/nextjs/server";
import { CollaborativeEditor } from "@/components/editor/CollaborativeEditor";
import { PageHeader } from "@/components/editor/PageHeader";
import { getPage, isFavoritePage } from "@/app/actions/page/actions";
import { redirect } from "next/navigation";
import { SignJWT } from "jose";
import { CoverImagePicker } from "@/components/editor/CoverImagePicker";
import { getWorkspaces } from "@/app/actions";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { prisma } from "@/lib/prisma";
import FavoritePage from "@/components/editor/Favorite-page";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate a short-lived token for WebSocket authentication
async function generateWsToken(
  userId: string,
  pageId: string
): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.CLERK_SECRET_KEY || "your-secret-key"
  );

  const token = await new SignJWT({ sub: userId, pageId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .setIssuedAt()
    .sign(secret);

  return token;
}

// Generate a random color for the user
function generateUserColor(): string {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B739",
    "#52B788",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const isFavorite = await isFavoritePage({ pageId: id });

  const workspacesData = await getWorkspaces();
  const workspaces = workspacesData?.data || [];
  // Fetch page data

  const userName =
    user?.fullName ||
    user?.username ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";

  const userEmail = user?.emailAddresses[0]?.emailAddress || "user@example.com";

  const result = await getPage(id);

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Page not found</h1>
          <p className="text-muted-foreground">
            {result.error || "The page you are looking for does not exist."}
          </p>
        </div>
      </div>
    );
  }

  const page = result.data;

  // Check user role in workspace
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: page.workspaceId,
        userId: user.id,
      },
    },
  });

  // Determine if user can edit (not a visitor)
  const isEditable = workspaceMember?.role !== "viewer";

  // Generate WebSocket token
  const wsToken = await generateWsToken(user.id, id);

  return (
    <div className="h-screen flex ">
      <WorkspaceSidebar
        workspaces={workspaces}
        userName={userName}
        userEmail={userEmail}
        userImage={user?.imageUrl}
      />
      {/* <PageHeader
        pageId={id}
        initialTitle={page.title}
        initialIcon={page.icon}
        isEditable={isEditable}
      /> */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="w-full  border-b flex items-center justify-end p-1 gap-2">
          <CoverImagePicker
            pageId={id}
            currentCover={page.cover}
            isEditable={isEditable}
          />
          <FavoritePage
            pageId={id}
            initialIsFavorite={isFavorite.data || false}
          />
        </div>
        <CollaborativeEditor
          pageId={id}
          userId={user.id}
          userName={userName}
          userColor={generateUserColor()}
          token={wsToken}
          initialTitle={page.title}
          initialIcon={page.icon}
          isEditable={isEditable}
          workspaceId={page.workspaceId}
          cover={page.cover}
        />
      </div>
    </div>
  );
}
