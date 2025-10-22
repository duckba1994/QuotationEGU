import { useState } from 'react';

import React from 'react';
import { Chrono } from 'react-chrono';
import './Style/SalesOrderPage.css';
import TimelineForm from './TimelineForm'; // 1. Import ฟอร์มที่เราจะสร้าง


const initialItems = [
  {
    title: 'สร้างใบจอง',
    cardTitle: 'สร้างใบจองสินค้า',
    cardSubtitle: 'ลูกค้า A ทำการจองสินค้า Widget Pro จำนวน 10 ชิ้น',
    cardDetailedText: 'รหัสอ้างอิง #SO-00123',
  },
  {
    title: 'ต้นสังกัดตรวจสอบ/อนุมัติ',
    cardTitle: 'รอการอนุมัติ',
    cardSubtitle: 'เอกสารกำลังรอการตรวจสอบจากฝ่ายขาย',
    cardDetailedText: 'ผู้ตรวจสอบ: คุณสมชาย',
  },
  {
    title: 'CR ตรวจสอบ',
    cardTitle: 'รอการอนุมัติ',
    cardSubtitle: 'เอกสารกำลังรอการตรวจสอบจากฝ่ายขาย',
    cardDetailedText: 'ผู้ตรวจสอบ: คุณสมชาย',
  }, {
    title: 'CR Mgr. ตรวจสอบ/อนุมัติ',
    cardTitle: 'รอการอนุมัติ',
    cardSubtitle: 'เอกสารกำลังรอการตรวจสอบจากฝ่ายขาย',
    cardDetailedText: 'ผู้ตรวจสอบ: คุณสมชาย',
  },
  {
    title: 'PL ตรวจสอบ',
    cardTitle: 'รอการอนุมัติ',
    cardSubtitle: 'เอกสารกำลังรอการตรวจสอบจากฝ่ายขาย',
    cardDetailedText: 'ผู้ตรวจสอบ: คุณสมชาย',
  }, {
    title: 'PL Mgr. ตรวจสอบ/อนุมัติ',
    cardTitle: 'รอการอนุมัติ',
    cardSubtitle: 'เอกสารกำลังรอการตรวจสอบจากฝ่ายขาย',
    cardDetailedText: 'ผู้ตรวจสอบ: คุณสมชาย',
  },
  {
    title: 'SV ตรวจสอบ',
    cardTitle: 'รอการอนุมัติ',
    cardSubtitle: 'เอกสารกำลังรอการตรวจสอบจากฝ่ายขาย',
    cardDetailedText: 'ผู้ตรวจสอบ: คุณสมชาย',
  }, {
    title: 'SV Mgr. ตรวจสอบ/อนุมัติ',
    cardTitle: 'รอการอนุมัติ',
    cardSubtitle: 'เอกสารกำลังรอการตรวจสอบจากฝ่ายขาย',
    cardDetailedText: 'ผู้ตรวจสอบ: คุณสมชาย',
  },
  {
    title: 'ต้นสังกัดยืนยันการจอง',
    cardTitle: 'รอการอนุมัติ',
    cardSubtitle: 'เอกสารกำลังรอการตรวจสอบจากฝ่ายขาย',
    cardDetailedText: 'ผู้ตรวจสอบ: คุณสมชาย',
  },
];

function SalesOrderPage() {
  

  // 2. ย้ายข้อมูลมาเก็บใน State เพื่อให้เปลี่ยนแปลงได้
  const [items, setItems] = useState(initialItems);

  // 1. สร้าง State ใหม่เพื่อเก็บ Index ของรายการที่ต้องการให้ Active
  //    เราจะให้มันเริ่มต้นที่รายการสุดท้ายของข้อมูลเริ่มต้น
  const [activeIndex, setActiveIndex] = useState(initialItems.length - 1);

  // 3. สร้างฟังก์ชันสำหรับรับข้อมูลใหม่จากฟอร์ม แล้วนำไปเพิ่มใน State
  const handleAddItem = (newItem) => {
    // สร้าง object ใหม่สำหรับรายการใน timeline
    const itemToAdd = {
      title: new Date().toLocaleDateString('th-TH'), // ใช้วันที่ปัจจุบัน
      ...newItem, // นำข้อมูลจากฟอร์ม (cardTitle, cardSubtitle) มาใส่
    };
    // อัปเดต state โดยการสร้าง array ใหม่ที่มีข้อมูลเดิมทั้งหมด (...items) และเพิ่มข้อมูลใหม่เข้าไป
    setItems([...items, itemToAdd]);
    // 2. เมื่อเพิ่มข้อมูลใหม่เข้าไป ให้ทำการอัปเดต activeIndex
    //    ให้ชี้ไปที่ Index ของรายการสุดท้ายใน Array ใหม่เสมอ
    setActiveIndex(items.length - 1);
  };

  return (
    // ใช้โครงสร้างเหมือน Content เดิม เพื่อให้หน้าตาเว็บสอดคล้องกัน
    <main className="app-main">
      <div className="app-content-header">
        <h1 className="fs-3">ใบจองสินค้า</h1>
      </div>
      <div className="app-content">
        <div className="container-fluid">
          {/* เนื้อหาของคุณอยู่ที่นี่ */}
          {/* 4. แสดงฟอร์ม และส่งฟังก์ชัน handleAddItem ไปให้ */}


          <hr className="my-4" />

          {/* 5. แสดง Timeline โดยใช้ข้อมูลจาก State */}
          <div className="custom-timeline">
            {items.length > 0 ? (
              <Chrono
                items={items}
                mode="HORIZONTAL" // เปลี่ยนเป็นแนวตั้งสลับซ้ายขวาเพื่อความสวยงาม
                cardHeight={150}
                 itemWidth={130}
                disableToolbar={true}
                // 3. ส่ง State ของ activeIndex ไปให้ Chrono
                //    เพื่อให้มันรู้ว่าต้องเลื่อนไปแสดงรายการไหน
                activeItemIndex={activeIndex}
                theme={{
                  
                  primary: '#0d6efd',
                  secondary: '#6c757d',
                  cardBgColor: '#ffffff',
                  cardForeColor: '#333333',
                  titleColor: '#0d6efd',
                }}
              />
            ) : (
              <p>ยังไม่มีข้อมูลสถานะ</p>
            )}
          </div>
          <TimelineForm onSubmit={handleAddItem} />
        </div>
      </div>
    </main>
  );




}

export default SalesOrderPage;