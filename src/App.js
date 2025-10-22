import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';
import Header1 from '../src/Components/Header'
import Menu from '../src/Components/Menu'
import Content from '../src/Components/Content'
import Footer from '../src/Components/Footer'

import T1 from '../src/Components/Layout'
import T2 from '../src/Components/DashboardPage'
import T3 from '../src/Components/SalesOrderPage'
import QuotationSupplierListPage from './Components/pages/QuotationSupplier/QuotationSupplierListPage'; 
import QuotationSupplierPage from './Components/pages/QuotationSupplier/QuotationSupplierForm';

import QuotationAdjustListPage from './Components/pages/QuotationAdjust/QuotationAdjustListPage'; 
import QuotationAdjustPage from './Components/pages/QuotationAdjust/QuotationAdjustForm';

function App() {

  // 1. สร้าง state เพื่อควบคุมการแสดงผลของเมนู (เริ่มต้นให้แสดง)
  const [isMenuVisible, setMenuVisible] = useState(true);

  // 2. สร้างฟังก์ชันเพื่อสลับค่า true/false ของ state
  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  // สร้าง class แบบไดนามิกสำหรับ wrapper หลัก
  // ถ้า isMenuVisible เป็น false จะเพิ่ม class 'sidebar-collapse' เข้าไป
  // ซึ่งเป็น class ของ AdminLTE ที่ใช้ในการย่อเมนูด้านข้าง
  const wrapperClass = `app-wrapper ${!isMenuVisible ? 'sidebar-collapse' : ''}`;


  return (
    // <div className={wrapperClass}>
    //   <Header1 toggleMenu={toggleMenu} />
    //   <Menu></Menu>
    //   <Content></Content>

    // </div>

    <Routes>
      <Route path="/" element={<T1  />}>
        <Route index element={<T2 />} /> 
        <Route path="sales-order" element={<T3 />} />

        <Route 
            path="/quotation-supplier/new" 
            element={<QuotationSupplierPage />} 
          />

       

          <Route 
            path="quotation-supplier" 
            element={<QuotationSupplierListPage />} 
          />


              <Route 
            path="/quotation-adjust" 
            element={<QuotationAdjustListPage />} 
          />

             <Route 
            path="/quotation-adjustNew" 
            element={<QuotationAdjustPage />} 
          />

        {/* เพิ่มหน้าอื่นๆ ที่นี่ */}
      </Route>
    </Routes>


    // <BrowserRouter>
    //   <Routes>
    //     {/* Route หลักจะใช้ Layout component ที่มี Header และ Menu อยู่เสมอ */}
    //     <Route path="/" element={<page11></page11>}>

    //       {/* Nested Routes: คือหน้าที่จะเปลี่ยนไปมาในส่วน Content */}
    //       {/* `index` หมายถึง route เริ่มต้นเมื่อเข้ามาที่ "/" */}
    //       {/* <Route index element={<page2 />} /> */}

    //       {/* Route สำหรับหน้าใบจองสินค้า */}
    //       {/* <Route path="sales-order" element={<page3 />} /> */}

    //       {/* คุณสามารถเพิ่มหน้าอื่นๆ ได้ที่นี่ */}
    //       {/* <Route path="delivery-note" element={<DeliveryNotePage />} /> */}

    //     </Route>
    //   </Routes>
    // </BrowserRouter>
  );
}

export default App;
