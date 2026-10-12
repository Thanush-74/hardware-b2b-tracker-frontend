// Layout.jsx — Main shell that wraps all authenticated pages
// Renders Sidebar + Topbar + page content side by side

import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';

function Layout({ children }) {
  return (
    <div className="app-layout">
      {/* Left sidebar navigation */}
      <Sidebar />

      {/* Right area: top bar + page content */}
      <div className="main-area">
        <Topbar />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
