import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full overflow-auto">
      <table 
        className={`w-full caption-bottom text-sm ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const TableHeader: React.FC<TableHeaderProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <thead className={`border-b ${className}`} {...props}>
      {children}
    </thead>
  );
};

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const TableBody: React.FC<TableBodyProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <tbody className={`${className}`} {...props}>
      {children}
    </tbody>
  );
};

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

const TableRow: React.FC<TableRowProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <tr className={`border-b transition-colors hover:bg-muted/50 ${className}`} {...props}>
      {children}
    </tr>
  );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <td className={`p-4 align-middle ${className}`} {...props}>
      {children}
    </td>
  );
};

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

const TableHead: React.FC<TableHeadProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${className}`} {...props}>
      {children}
    </th>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead
}; 