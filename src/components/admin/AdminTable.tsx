import type { ReactNode } from 'react';
export function AdminTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty?: string;
}) {
  return (
    <div className="mx-admin-table-wrap">
      <table className="mx-admin-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
        {!children && (
          <tfoot>
            <tr>
              <td colSpan={headers.length}>{empty || 'داده‌ای وجود ندارد.'}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
