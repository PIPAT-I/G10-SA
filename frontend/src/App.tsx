import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import router from './routes';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'Kanit, sans-serif',
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
