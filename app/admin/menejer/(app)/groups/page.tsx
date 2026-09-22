export const dynamic = "force-dynamic";
import { query } from "@/lib/db";
import GroupsManager from "@/components/admin/GroupsManager";

async function getGroups() {
  return query(`
    SELECT g.id, g.name, g.is_active,
      COUNT(s.id)::int AS found,
      COUNT(s.id) FILTER (WHERE s.status = 'CORRECT')::int AS correct,
      (SELECT COUNT(*)::int FROM students st WHERE st.group_id = g.id AND st.is_active = TRUE) AS student_count
    FROM groups g
    LEFT JOIN submissions s ON s.group_id = g.id
    GROUP BY g.id
    ORDER BY g.name ASC
  `);
}

export default async function GroupsPage() {
  const groups = await getGroups();
  return (
    <div className="p-6 sm:p-10">
      <GroupsManager initialGroups={groups as any} />
    </div>
  );
}
