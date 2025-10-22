function DashboardPage() {
    return (
      <main className="app-main">
        <div className="app-content-header">
          <h1 className="fs-3">Dashboard</h1>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="#">Home</a></li>
            <li className="breadcrumb-item active" aria-current="page">
              Dashboard
            </li>
          </ol>
        </div>
        <div className="app-content">
          <div className="container-fluid">
              {/* เนื้อหาของ Dashboard */}
              <p>Welcome to the Dashboard!</p>
          </div>
        </div>
      </main>
    );
  }
  
  export default DashboardPage;