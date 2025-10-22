import { useState } from 'react'; // 1. Import useState เข้ามาใช้งาน
import { Link } from 'react-router-dom'; // 1. Import Link เข้ามา
function Menu() {

    // 2. สร้าง state เพื่อเก็บสถานะการเปิด/ปิดของเมนู Dashboard
    //    - isDashboardOpen คือตัวแปรที่เก็บค่า true (เปิด) หรือ false (ปิด)
    //    - setDashboardOpen คือฟังก์ชันสำหรับอัปเดตค่า
    //    - เราให้ค่าเริ่มต้นเป็น true เพื่อให้เมนูเปิดอยู่ตอนแรก
    const [isDashboardOpen, setDashboardOpen] = useState(false);

    // 3. สร้างฟังก์ชันเพื่อสลับค่า state (จาก true เป็น false หรือกลับกัน)
    const toggleDashboardMenu = (event) => {
        event.preventDefault(); // ป้องกันไม่ให้หน้าเว็บเลื่อนขึ้นไปบนสุดเมื่อคลิกที่ลิงก์ #
        setDashboardOpen(!isDashboardOpen);
    };




    // ❗️ 2. (เพิ่มใหม่) สร้าง State สำหรับ "ใบเสนอราคา" แยกต่างหาก
    const [isQuotationOpen, setQuotationOpen] = useState(false);
    const toggleQuotationMenu = (event) => {
        event.preventDefault();
        // ❗️ 3. (เพิ่มใหม่) สั่ง set state ของตัวเอง
        setQuotationOpen(!isQuotationOpen); 
    };

    
    
    return (
        <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
            {/*begin::Sidebar Brand*/}
            <div className="sidebar-brand">
                {/*begin::Brand Link*/}
                <a href="./index.html" className="brand-link">
                    {/*begin::Brand Image*/}
                    {/* <img src="./assets/img/AdminLTELogo.png" alt="AdminLTE Logo" className="brand-image opacity-75 shadow" /> */}
                    {/*end::Brand Image*/}
                    {/*begin::Brand Text*/}
                    <span className="brand-text fw-light">EGU</span>
                    {/*end::Brand Text*/}
                </a>
                {/*end::Brand Link*/}
            </div>
            {/*end::Sidebar Brand*/}
            {/*begin::Sidebar Wrapper*/}
            <div className="sidebar-wrapper">
                <nav className="mt-2">
                    {/*begin::Sidebar Menu*/}
                    <ul className="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="navigation" aria-label="Main navigation" data-accordion="false" id="navigation">
                        {/* 4. ใช้ state กำหนด class แบบไดนามิก */}
                        <li className={`nav-item ${isDashboardOpen ? 'menu-open' : ''}`}>

                            {/* 5. เพิ่ม onClick เพื่อเรียกใช้ฟังก์ชัน toggleDashboardMenu */}
                           <Link to="#" className={`nav-link ${isDashboardOpen ? 'active' : ''}`} onClick={toggleDashboardMenu}>
                                <i className="nav-icon bi bi-speedometer" />
                                <p>
                                    Dashboard
                                    <i className={`nav-arrow bi ${isDashboardOpen ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
                                </p>
                            </Link>

                            {/* 6. ใช้ Conditional Rendering: ถ้า isDashboardOpen เป็น true เท่านั้น ถึงจะแสดง <ul> นี้ */}
                            {isDashboardOpen && (
                                <ul className="nav nav-treeview">
                                    <li className="nav-item">
                                        <a href="./index.html" className="nav-link active">
                                            <i className="nav-icon bi bi-circle" />
                                            <p>Dashboard v1</p>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a href="./index2.html" className="nav-link">
                                            <i className="nav-icon bi bi-circle" />
                                            <p>Dashboard v2</p>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a href="./index3.html" className="nav-link">
                                            <i className="nav-icon bi bi-circle" />
                                            <p>Dashboard v3</p>
                                        </a>
                                    </li>
                                </ul>
                            )}
                        </li>
                        {/* --- จบส่วนของ Dashboard --- */}






                            <li className={`nav-item ${isQuotationOpen ? 'menu-open' : ''}`}>
                            {/* 5. เพิ่ม onClick เพื่อเรียกใช้ฟังก์ชัน toggleDashboardMenu */}
                            <Link to="#" className={`nav-link ${isQuotationOpen ? 'active' : ''}`} onClick={toggleQuotationMenu}>
                                <i className="bi bi-file-earmark-diff-fill" />
                                <p>
                                    ใบเสนอราคา
                                {/* <i className={`nav-arrow bi ${isQuotationOpen ? 'bi-chevron-down' : 'bi-chevron-right'}`} />                                </p> */}
                                <i className={`nav-arrow bi ${isQuotationOpen ? 'bi-chevron-right' : 'bi-chevron-right'}`} />                                </p>

                            </Link>

                            {/* 6. ใช้ Conditional Rendering: ถ้า isDashboardOpen เป็น true เท่านั้น ถึงจะแสดง <ul> นี้ */}
                            {isQuotationOpen && (
                                <ul className="nav nav-treeview" style={{ paddingLeft: '1.1rem' }}>
                                    <li className="nav-item">
                                        <Link to="/quotation-supplier" className="nav-link">
                                            <i className="bi bi-arrow-bar-right" />
                                            <p>Quotaion Supplier</p>
                                        </Link>
                                    </li>
                                    <Link to="/quotation-adjust" className="nav-link">
                                            <i className="bi bi-arrow-bar-right" />
                                            <p>Quotaion Adjust</p>
                                        
                                    </Link>
                                    
                                </ul>
                            )}
                        </li>


                         {/* ปิดไว้ */}
                         
                        {/* <li className="nav-item">
                            <a href="./generate/theme.html" className="nav-link">
                                <i className="bi bi-calendar-week-fill" />
                                <p>แผนผลิต</p>
                            </a>
                        </li> */}

                        {/* <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="bi bi-graph-up-arrow" />
                                <p>
                                    แผนขาย
                                    <i className="nav-arrow bi bi-chevron-right" />
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="./widgets/small-box.html" className="nav-link">
                                        <i className="nav-icon bi bi-circle" />
                                        <p>Small Box</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="./widgets/info-box.html" className="nav-link">
                                        <i className="nav-icon bi bi-circle" />
                                        <p>info Box</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="./widgets/cards.html" className="nav-link">
                                        <i className="nav-icon bi bi-circle" />
                                        <p>Cards</p>
                                    </a>
                                </li>
                            </ul>
                        </li> */}
                        
                        {/* ปิดไว้ */}



                        {/* <li className="nav-item">
                            <Link to="/sales-order" className="nav-link">
                                <i className="bi bi-journal-check" />
                                <p>ใบจองสินค้า</p>
                            </Link>
                            
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="bi bi-truck" />
                                <p>
                                    ใบจัดส่งสินค้า
                                    <i className="nav-arrow bi bi-chevron-right" />
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="./UI/general.html" className="nav-link">
                                        <i className="nav-icon bi bi-circle" />
                                        <p>General</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="./UI/icons.html" className="nav-link">
                                        <i className="nav-icon bi bi-circle" />
                                        <p>Icons</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="./UI/timeline.html" className="nav-link">
                                        <i className="nav-icon bi bi-circle" />
                                        <p>Timeline</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="bi bi-file-earmark-diff-fill" />
                                <p>
                                    ใบเปลี่ยนแปลง
                                    <i className="nav-arrow bi bi-chevron-right" />
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="./forms/general.html" className="nav-link">
                                        <i className="nav-icon bi bi-circle" />
                                        <p>General Elements</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="bi bi-arrow-left-right" />
                                <p>
                                    ใบขอทดแทนรถเช่า
                                    <i className="nav-arrow bi bi-chevron-right" />
                                </p>
                            </a>
                        </li>


                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="bi bi-arrow-counterclockwise" />
                                <p>
                                    ใบขอตัดกลับ
                                    <i className="nav-arrow bi bi-chevron-right" />
                                </p>
                            </a>
                        </li>

                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="bi bi-tools" />
                                <p>
                                    ใบสั่งปล่อยรถช่าง
                                    <i className="nav-arrow bi bi-chevron-right" />
                                </p>
                            </a>
                        </li>

                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="bi bi-key-fill" />
                                <p>
                                    ใบสั่งปล่อยรถเช่า
                                    <i className="nav-arrow bi bi-chevron-right" />
                                </p>
                            </a>
                        </li>

                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="bi bi-box-seam-fill" />
                                <p>
                                    ใบเบิกทรัพย์สิน
                                    <i className="nav-arrow bi bi-chevron-right" />
                                </p>
                            </a>
                        </li>

                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="bi bi-fuel-pump-fill" />
                                <p>
                                    ใบเบิกน้ำมัน
                                    <i className="nav-arrow bi bi-chevron-right" />
                                </p>
                            </a>
                        </li> */}



                        {/* <li className="nav-header">EXAMPLES</li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon bi bi-box-arrow-in-right" />
                                <p>
                                    Auth
                                    <i className="nav-arrow bi bi-chevron-right" />
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="#" className="nav-link">
                                        <i className="nav-icon bi bi-box-arrow-in-right" />
                                        <p>
                                            Version 1
                                            <i className="nav-arrow bi bi-chevron-right" />
                                        </p>
                                    </a>
                                    <ul className="nav nav-treeview">
                                        <li className="nav-item">
                                            <a href="./examples/login.html" className="nav-link">
                                                <i className="nav-icon bi bi-circle" />
                                                <p>Login</p>
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="./examples/register.html" className="nav-link">
                                                <i className="nav-icon bi bi-circle" />
                                                <p>Register</p>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="nav-item">
                                    <a href="#" className="nav-link">
                                        <i className="nav-icon bi bi-box-arrow-in-right" />
                                        <p>
                                            Version 2
                                            <i className="nav-arrow bi bi-chevron-right" />
                                        </p>
                                    </a>
                                    <ul className="nav nav-treeview">
                                        <li className="nav-item">
                                            <a href="./examples/login-v2.html" className="nav-link">
                                                <i className="nav-icon bi bi-circle" />
                                                <p>Login</p>
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="./examples/register-v2.html" className="nav-link">
                                                <i className="nav-icon bi bi-circle" />
                                                <p>Register</p>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="nav-item">
                                    <a href="./examples/lockscreen.html" className="nav-link">
                                        <i className="nav-icon bi bi-circle" />
                                        <p>Lockscreen</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-header">DOCUMENTATIONS</li>
                        <li className="nav-item">
                            <a href="./docs/introduction.html" className="nav-link">
                                <i className="nav-icon bi bi-download" />
                                <p>Installation</p>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="./docs/layout.html" className="nav-link">
                                <i className="nav-icon bi bi-grip-horizontal" />
                                <p>Layout</p>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="./docs/color-mode.html" className="nav-link">
                                <i className="nav-icon bi bi-star-half" />
                                <p>Color Mode</p>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon bi bi-ui-checks-grid" />
                                <p>
                                    Components
                                    <i className="nav-arrow bi bi-chevron-right" />
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="./docs/components/main-header.html" className="nav-link">
                                        <i className="nav-icon bi bi-circle" />
                                        <p>Main Header</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="./docs/components/main-sidebar.html" className="nav-link">
                                        <i className="nav-icon bi bi-circle" />
                                        <p>Main Sidebar</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon bi bi-filetype-js" />
                                <p>
                                    Javascript
                                    <i className="nav-arrow bi bi-chevron-right" />
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="./docs/javascript/treeview.html" className="nav-link">
                                        <i className="nav-icon bi bi-circle" />
                                        <p>Treeview</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="./docs/browser-support.html" className="nav-link">
                                <i className="nav-icon bi bi-browser-edge" />
                                <p>Browser Support</p>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="./docs/how-to-contribute.html" className="nav-link">
                                <i className="nav-icon bi bi-hand-thumbs-up-fill" />
                                <p>How To Contribute</p>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="./docs/faq.html" className="nav-link">
                                <i className="nav-icon bi bi-question-circle-fill" />
                                <p>FAQ</p>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="./docs/license.html" className="nav-link">
                                <i className="nav-icon bi bi-patch-check-fill" />
                                <p>License</p>
                            </a>
                        </li>
                        <li className="nav-header">MULTI LEVEL EXAMPLE</li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon bi bi-circle-fill" />
                                <p>Level 1</p>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon bi bi-circle-fill" />
                                <p>
                                    Level 1
                                    <i className="nav-arrow bi bi-chevron-right" />
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="#" className="nav-link">
                                        <i className="nav-icon bi bi-circle" />
                                        <p>Level 2</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="#" className="nav-link">
                                        <i className="nav-icon bi bi-circle" />
                                        <p>
                                            Level 2
                                            <i className="nav-arrow bi bi-chevron-right" />
                                        </p>
                                    </a>
                                    <ul className="nav nav-treeview">
                                        <li className="nav-item">
                                            <a href="#" className="nav-link">
                                                <i className="nav-icon bi bi-record-circle-fill" />
                                                <p>Level 3</p>
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#" className="nav-link">
                                                <i className="nav-icon bi bi-record-circle-fill" />
                                                <p>Level 3</p>
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#" className="nav-link">
                                                <i className="nav-icon bi bi-record-circle-fill" />
                                                <p>Level 3</p>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="nav-item">
                                    <a href="#" className="nav-link">
                                        <i className="nav-icon bi bi-circle" />
                                        <p>Level 2</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon bi bi-circle-fill" />
                                <p>Level 1</p>
                            </a>
                        </li>
                        <li className="nav-header">LABELS</li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon bi bi-circle text-danger" />
                                <p className="text">Important</p>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon bi bi-circle text-warning" />
                                <p>Warning</p>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon bi bi-circle text-info" />
                                <p>Informational</p>
                            </a>
                        </li> */}




                    </ul>
                    {/*end::Sidebar Menu*/}
                </nav>
            </div>
            {/*end::Sidebar Wrapper*/}
        </aside>

    );
}

export default Menu;