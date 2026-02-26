import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Checkbox, Row, Col } from 'antd';
import dayjs from 'dayjs';
import type { Application } from '../../types';

interface ApplicationFormProps {
    app: Application | null;
    isOpen?: boolean;
    onClose: () => void;
    onSave: (app: Application) => void;
}

const STATUS_OPTIONS = [
    'Saved',
    'Applied',
    'Phone Screen',
    'Interview',
    'Offer',
    'Rejected'
];

const SEASON_OPTIONS = [
    'Spring',
    'Summer',
    'Fall',
    'Winter'
];

const ApplicationForm: React.FC<ApplicationFormProps> = ({ app, isOpen = false, onClose, onSave }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (isOpen) {
            if (app) {
                form.setFieldsValue({
                    ...app,
                    dateApplied: app.dateApplied ? dayjs(app.dateApplied) : undefined,
                    deadline: app.deadline ? dayjs(app.deadline) : undefined,
                });
            } else {
                form.setFieldsValue({
                    status: 'Applied',
                    type: 'Internship',
                    dateApplied: dayjs(),
                    isRolling: false
                });
            }
        }
    }, [app, isOpen, form]);

    const handleFinish = (values: any) => {
        const formattedValues: Application = {
            ...values,
            id: app?.id, // keep existing ID if editing
            dateApplied: values.dateApplied ? values.dateApplied.format('YYYY-MM-DD') : undefined,
            deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : undefined,
        };
        onSave(formattedValues);
        form.resetFields();
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={
                <h2 style={{ margin: 0, color: '#2d1f1a' }}>
                    {app ? 'Edit Application' : 'New Application'}
                </h2>
            }
            open={isOpen}
            onCancel={handleCancel}
            onOk={() => form.submit()}
            okText={app ? "Save Changes" : "Save Application"}
            cancelText="Cancel"
            okButtonProps={{ style: { background: '#e8604c', borderColor: '#e8604c' } }}
            width={700}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                style={{ marginTop: 24 }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label={<span style={{ color: '#917b71', fontSize: 13, fontWeight: 500 }}>Company Name <span style={{ color: 'red' }}>*</span></span>}
                            name="company"
                            rules={[{ required: true, message: 'Company name is required' }]}
                        >
                            <Input placeholder="e.g. Google" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={<span style={{ color: '#917b71', fontSize: 13, fontWeight: 500 }}>Role Title <span style={{ color: 'red' }}>*</span></span>}
                            name="role"
                            rules={[{ required: true, message: 'Role title is required' }]}
                        >
                            <Input placeholder="e.g. Frontend Engineer" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label={<span style={{ color: '#917b71', fontSize: 13, fontWeight: 500 }}>Job URL</span>}
                            name="url"
                        >
                            <Input type="url" placeholder="https://careers.example.com/job/123" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label={<span style={{ color: '#917b71', fontSize: 13, fontWeight: 500 }}>Location</span>}
                            name="location"
                        >
                            <Input placeholder="e.g. San Francisco, CA" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={<span style={{ color: '#917b71', fontSize: 13, fontWeight: 500 }}>Salary</span>}
                            name="salary"
                        >
                            <Input placeholder="e.g. $120k – $150k" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label={<span style={{ color: '#917b71', fontSize: 13, fontWeight: 500 }}>Date Applied</span>}
                            name="dateApplied"
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={<span style={{ color: '#917b71', fontSize: 13, fontWeight: 500 }}>Status</span>}
                            name="status"
                        >
                            <Select>
                                {STATUS_OPTIONS.map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ marginTop: 8, padding: 16, background: 'rgba(232, 96, 76, 0.04)', borderRadius: 8, border: '1px solid #f0e4df' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 16, color: '#e8604c', fontSize: 15 }}>Internship Details</h3>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label={<span style={{ color: '#917b71', fontSize: 13, fontWeight: 500 }}>Type</span>}
                                name="type"
                            >
                                <Select>
                                    <Select.Option value="Internship">Internship</Select.Option>
                                    <Select.Option value="Full-time">Full-time</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={<span style={{ color: '#917b71', fontSize: 13, fontWeight: 500 }}>Season</span>}
                                name="season"
                            >
                                <Select placeholder="Select season" allowClear>
                                    {SEASON_OPTIONS.map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16} align="middle">
                        <Col span={12}>
                            <Form.Item
                                label={<span style={{ color: '#917b71', fontSize: 13, fontWeight: 500 }}>Application Deadline</span>}
                                name="deadline"
                                style={{ marginBottom: 0 }}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="isRolling" valuePropName="checked" style={{ marginBottom: 0 }}>
                                <Checkbox><span style={{ color: '#2d1f1a', fontWeight: 500 }}>Rolling Deadline</span></Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <Row gutter={16} style={{ marginTop: 24 }}>
                    <Col span={24}>
                        <Form.Item
                            label={<span style={{ color: '#917b71', fontSize: 13, fontWeight: 500 }}>Notes</span>}
                            name="notes"
                        >
                            <Input.TextArea rows={4} placeholder="Any additional details…" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ApplicationForm;
