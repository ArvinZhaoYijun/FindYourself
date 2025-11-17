import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { UsersTable } from "@/features/admin/components/users-table";
import { sql } from "drizzle-orm";

export default async function AdminUsersPage() {
  // 获取所有用户
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      credits: user.credits,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      planKey: user.planKey,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .orderBy(sql`${user.createdAt} desc`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          用户管理
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            共 {users.length} 个用户
          </div>
        </div>
      </div>

      <UsersTable users={users} />
    </div>
  );
}