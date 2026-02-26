import { useState } from 'react';
import { Button, ConfigProvider, Layout, Typography, theme } from 'antd';
import ApplicationForm from './components/Forms/ApplicationForm';
import type { Application } from './types';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  const [showForm, setShowForm] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);

  const handleSave = (app: Application) => {
    console.log('Saved Application:', app);
    setApplications([...applications, app]);
    setShowForm(false);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#e8604c',
          colorBgBase: '#faf7f5',
          colorTextBase: '#2d1f1a',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#faf7f5' }}>
        <Header style={{ background: '#ffffff', borderBottom: '1px solid #f0e4df', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
          <Title level={4} style={{ color: '#e8604c', margin: 0 }}>InternTrack</Title>
        </Header>
        <Content style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>Job Application Tracker</Title>
              <Text style={{ color: '#917b71' }}>Keep all your applications organized in one place.</Text>
            </div>
            <Button type="primary" size="large" onClick={() => setShowForm(true)}>
              + Add Application
            </Button>
          </div>

          <ApplicationForm
            app={null}
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            onSave={handleSave}
          />

          {/* Simple list of applications to verify it works */}
          {applications.length > 0 && (
            <div style={{ background: '#ffffff', padding: 24, borderRadius: 8, border: '1px solid #f0e4df' }}>
              <Title level={4}>Recent Additions</Title>
              {applications.map((app, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #f0e4df' }}>
                  <strong>{app.company}</strong> - {app.role} ({app.status})
                </div>
              ))}
            </div>
          )}
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
