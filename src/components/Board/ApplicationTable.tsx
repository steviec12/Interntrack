import React from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Application } from "../../types";
import { STATUS_STYLES } from "./ApplicationCard";

interface ApplicationTableProps {
    applications: Application[];
    onRowClick: (app: Application) => void;
}

export const getApplicationTableColumns = (applications: Application[]): ColumnsType<Application> => [
    {
        title: "Company",
        dataIndex: "company",
        key: "company",
        sorter: (a, b) => a.company.localeCompare(b.company),
        render: (text) => <span className="font-semibold text-text">{text}</span>,
    },
    {
        title: "Role",
        dataIndex: "role",
        key: "role",
        sorter: (a, b) => a.role.localeCompare(b.role),
        render: (text) => <span className="text-text-muted">{text}</span>,
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        filters: [
            { text: "Saved", value: "Saved" },
            { text: "Applied", value: "Applied" },
            { text: "Phone Screen", value: "Phone Screen" },
            { text: "Interview", value: "Interview" },
            { text: "Offer", value: "Offer" },
            { text: "Rejected", value: "Rejected" },
        ],
        onFilter: (value, record) => record.status === value,
        sorter: (a, b) => a.status.localeCompare(b.status),
        render: (status: string) => {
            const style = STATUS_STYLES[status] || STATUS_STYLES.Saved;
            return (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium ${style.bg} ${style.text}`}>
                    {status}
                </span>
            );
        },
    },
    {
        title: "Date Applied",
        dataIndex: "dateApplied",
        key: "dateApplied",
        sorter: (a, b) => {
            if (!a.dateApplied && !b.dateApplied) return 0;
            if (!a.dateApplied) return -1;
            if (!b.dateApplied) return 1;
            return new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime();
        },
        render: (date) =>
            date ? (
                <span className="text-text">
                    {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                </span>
            ) : (
                <span className="text-text-muted italic">---</span>
            ),
    },
    {
        title: "Deadline",
        dataIndex: "deadline",
        key: "deadline",
        sorter: (a, b) => {
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return -1;
            if (!b.deadline) return 1;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        },
        render: (date) =>
            date ? (
                <span className="text-warning font-medium">
                    {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                </span>
            ) : (
                <span className="text-text-muted italic">---</span>
            ),
    },
    {
        title: "Type",
        dataIndex: "type",
        key: "type",
        filters: [
            { text: "Internship", value: "Internship" },
            { text: "Full-time", value: "Full-time" },
        ],
        onFilter: (value, record) => record.type === value,
        render: (type) => (
            <span className="text-text">{type}</span>
        )
    },
    {
        title: "Season",
        dataIndex: "season",
        key: "season",
        filters: Array.from(new Set(applications.map(app => app.season).filter(Boolean))).map(s => ({ text: s as string, value: s as string })),
        onFilter: (value, record) => record.season === value,
        render: (season) => (
            <span className="text-text">{season || <span className="text-text-muted italic">---</span>}</span>
        )
    },
];

export default function ApplicationTable({ applications, onRowClick }: ApplicationTableProps) {
    const columns = getApplicationTableColumns(applications);

    return (
        <div className="w-full h-full overflow-auto rounded-xl border border-border bg-surface custom-antd-table">
            <Table
                columns={columns}
                dataSource={applications}
                rowKey="id"
                pagination={false}
                tableLayout="auto"
                scroll={{ y: 'calc(100vh - 220px)' }} // Responsive height mapping
                onRow={(record) => ({
                    onClick: () => onRowClick(record),
                    className: "cursor-pointer hover:bg-surface-hover transition-colors",
                })}
            />
        </div>
    );
}
