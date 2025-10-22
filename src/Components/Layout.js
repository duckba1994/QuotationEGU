import { useState } from 'react';
import { Outlet } from 'react-router-dom'; // Outlet คือตำแหน่งที่จะแสดงเนื้อหาของแต่ละหน้า
import Headerss from '../Components/Header';
import Menu from '../Components/Menu';
// import Footer from '../Components/Footer';







function Layout() {
  const [isMenuVisible, setMenuVisible] = useState(true);

  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  const wrapperClass = `app-wrapper ${!isMenuVisible ? 'sidebar-collapse' : ''}`;

  return (
    <div className={wrapperClass}>
      <Headerss toggleMenu={toggleMenu} />
      <Menu />
      
      {/* <Outlet /> คือหัวใจสำคัญ! */}
      {/* เนื้อหาจาก DashboardPage หรือ SalesOrderPage จะถูกแสดงตรงนี้ */}
      <Outlet /> 
      
      {/* <Footer /> */}
    </div>
  );
}

export default Layout;