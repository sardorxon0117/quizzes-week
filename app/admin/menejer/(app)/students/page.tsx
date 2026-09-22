export const dynamic = "force-dynamic";
import { query } from "@/lib/db";
import StudentsManager from "@/components/admin/StudentsManager";

async function getStudents() {
  return query(
    `SELECT st.id, st.full_name, st.student_code, st.is_active, st.created_at,
            g.id AS group_id, g.name AS group_name,
            COUNT(s.id)::int AS found,
            COUNT(s.id) FILTER (WHERE s.status = 'CORRECT')::int AS correct
     FROM students st
     JOIN groups g ON g.id = st.group_id
     LEFT JOIN submissions s ON s.student_id = st.id
     GROUP BY st.id, g.id
     ORDER BY g.name ASC, st.full_name ASC`
  );
}

async function getGroups() {
  return query(`SELECT id, name FROM groups WHERE is_active = TRUE ORDER BY name ASC`);
}

export default async function StudentsPage() {
  const [students, groups] = await Promise.all([getStudents(), getGroups()]);
  return (
    <div className="p-6 sm:p-10">
      <StudentsManager initialStudents={students as any} groups={groups as any} />
    </div>
  );
}
