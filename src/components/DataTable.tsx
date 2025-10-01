import React from 'react';

type Align = 'left' | 'center' | 'right';

type Variant = 'text' | 'badge';

const classNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  accessor?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  align?: Align;
  variant?: Variant;
}

export interface DataTableActions<T> {
  header?: React.ReactNode;
  render: (row: T, index: number) => React.ReactNode;
  className?: string;
  align?: Align;
}

export interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  rowKey: (row: T, index: number) => string;
  emptyState: React.ReactNode;
  actions?: DataTableActions<T>;
  scrollClassName?: string;
}

const getAlignmentClass = (align?: Align) => {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  return 'text-left';
};

function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyState,
  actions,
  scrollClassName,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <div className="data-table-empty">{emptyState}</div>;
  }

  return (
    <div className="data-table-wrapper">
      <div className={classNames('data-table-scroll', scrollClassName)}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={classNames(
                    'data-table-head-cell',
                    getAlignmentClass(column.align),
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th
                  className={classNames(
                    'data-table-head-cell',
                    getAlignmentClass(actions.align),
                    actions.className,
                  )}
                >
                  {actions.header ?? 'Acciones'}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={rowKey(row, index)} className="data-table-row">
                {columns.map(column => {
                  const rawValue = column.accessor ? (row[column.accessor] as unknown) : undefined;
                  const content = column.render ? column.render(row, index) : rawValue;
                  const shouldUseBadge =
                    column.variant === 'badge' ||
                    (column.variant === undefined && typeof rawValue === 'number');

                  return (
                    <td
                      key={column.key}
                      className={classNames(
                        'data-table-cell',
                        getAlignmentClass(column.align),
                        column.className,
                      )}
                    >
                      {shouldUseBadge ? <span className="badge-soft">{content}</span> : content}
                    </td>
                  );
                })}
                {actions && (
                  <td
                    className={classNames(
                      'data-table-cell',
                      getAlignmentClass(actions.align),
                      actions.className,
                    )}
                  >
                    {actions.render(row, index)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
