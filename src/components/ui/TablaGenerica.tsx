import React from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TablePagination
} from "@mui/material";

type ColumnConfig<T> = {
    key: keyof T | string;
    label: string;
    render?: (row: T) => React.ReactNode;
};

type GenericTableProps<T> = {
    columns: ColumnConfig<T>[];
    rows: T[];
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    totalCount: number;
};

export function GenericTable<T extends { id: string | number }>(
    {
        columns,
        rows,
        page,
        rowsPerPage,
        onPageChange,
        onRowsPerPageChange,
        totalCount,
    }: GenericTableProps<T>
) {
    return (
        <Paper className="bg-primary  text-white" sx={{ backgroundColor: 'transparent'}}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow className="bg-primary ">
                            {columns.map((col) => (
                                <TableCell
                                    key={col.key as string}
                                    sx={{ color: 'white'}}
                                >
                                    {col.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id}>
                                {columns.map((col) => (
                                    <TableCell
                                        key={col.key as string}
                                        sx={{ color: 'white', backgroundColor: 'transparent' }}
                                    >
                                        {col.render ? col.render(row) : (row as any)[col.key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={onPageChange} 
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25, 50]}
                className="bg-primary"
                sx={{
                    color: 'white',
                    '.MuiTablePagination-toolbar': { color: 'white' },
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows, .MuiTablePagination-select': { color: 'white' },
                    '.MuiSvgIcon-root': { color: 'white' }
                }}
            />
        </Paper>
    );
}