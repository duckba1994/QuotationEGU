import React, { useState } from 'react';

// รับ props ที่ชื่อ onSubmit (ซึ่งก็คือฟังก์ชัน handleAddItem จากแม่)
function TimelineForm({ onSubmit }) {
  // สร้าง state ภายในของฟอร์มเอง เพื่อเก็บค่าที่ผู้ใช้พิมพ์
  const [cardTitle, setCardTitle] = useState('');
  const [cardSubtitle, setCardSubtitle] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault(); // ป้องกันไม่ให้ฟอร์มโหลดหน้าใหม่

    // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
    if (!cardTitle || !cardSubtitle) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    // เรียกใช้ฟังก์ชัน onSubmit ที่ได้รับมาจากแม่ และส่งข้อมูลที่ผู้ใช้กรอกกลับไป
    onSubmit({ cardTitle, cardSubtitle });

    // ล้างฟอร์มให้ว่างหลังจากบันทึกสำเร็จ
    setCardTitle('');
    setCardSubtitle('');
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="card-title mb-0">เพิ่มสถานะใหม่</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="cardTitle" className="form-label">หัวข้อสถานะ (Card Title)</label>
            <input
              type="text"
              className="form-control"
              id="cardTitle"
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              placeholder="เช่น อนุมัติแล้ว, กำลังจัดส่ง"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="cardSubtitle" className="form-label">คำอธิบายย่อ (Card Subtitle)</label>
            <textarea
              className="form-control"
              id="cardSubtitle"
              rows="2"
              value={cardSubtitle}
              onChange={(e) => setCardSubtitle(e.target.value)}
              placeholder="ใส่รายละเอียดเพิ่มเติมของสถานะนี้"
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">
            <i className="bi bi-plus-circle-fill me-2"></i>
            เพิ่มสถานะ
          </button>
        </form>
      </div>
    </div>
  );
}

export default TimelineForm;