import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// ❗️ Ensure this import path is correct for your project structure
import { supabase, getCurrentUserId } from '../../../SupaBaseApi/supabaseClient';

function QuotationAdjustListPage() {
    const navigate = useNavigate();
    const [quotations, setQuotations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // const [userId, setUserId] = useState(null); // Optional

    // --- Data Fetching from Supabase ---
    useEffect(() => {
        // Ensure state is reset when component mounts
        setQuotations([]); // Start with empty array
        setIsLoading(true);
        setError(null);

        const fetchQuotations = async () => {
            try {
                // const currentUserId = await getCurrentUserId();
                // setUserId(currentUserId);
                console.log("Fetching quotation list from Supabase...");

                // ❗️ CORRECTED: Order by 'id' descending as a safe default
                // let query = supabase
                //     .from('QuotaionSupplier') // Use actual table name
                //     .select('id, quotationNo, supplierName, quotationDT, total') // Select ONLY existing columns
                //     .order('id', { ascending: false }); // CHANGED order field to 'id' (more reliable)

                       let query = supabase
                    .from('QuotaionSupplier') // Use actual table name
                    .select('id, quotationNo, supplierName, quotationDT, total') // Select ONLY existing columns
                    .eq('isDelete', false) // <<< Filter for records that are NOT deleted
                    .order('id', { ascending: false }); // Order by ID descending

             

                const { data, error: fetchError } = await query;

                if (fetchError) {
                    throw fetchError; // Throw error to be caught below
                }

                // *** ADDED CHECK: Ensure data is an array before processing ***
                if (Array.isArray(data)) {
                    const formattedData = data.map(q => ({
                         id: q.id,
                         quotationNumber: q.quotationNo || 'N/A', // Add fallback
                         supplierName: q.supplierName || 'N/A',
                         quotationDate: q.quotationDT,
                         totalAmount: q.total || 0, // Default to 0 if null
                         // status field removed previously
                    }));
                    console.log("Fetched and formatted data:", formattedData);
                    setQuotations(formattedData); // Set state ONLY if data is valid
                } else {
                     // Handle unexpected data format
                     console.warn("Received non-array data from Supabase:", data);
                     setQuotations([]); // Set empty array
                     setError("ได้รับข้อมูลในรูปแบบที่ไม่คาดคิดจากเซิร์ฟเวอร์");
                }

            } catch (err) {
                console.error("Error fetching quotations:", err);
                 // Provide a more specific error message based on common issues
                 let userMessage = `เกิดข้อผิดพลาดในการโหลดรายการ: ${err.message}`;
                 if (err.message?.includes('column') && err.message?.includes('does not exist')) {
                     // Check select and order clauses
                     userMessage = `เกิดข้อผิดพลาด: ไม่พบคอลัมน์ที่ระบุ (${err.message}). กรุณาตรวจสอบโค้ดส่วน .select() หรือ .order()`;
                 } else if (err.code === '42P01' || err.message?.includes('relation') && err.message?.includes('does not exist')) {
                     // Check table name
                     userMessage = `เกิดข้อผิดพลาด: ไม่พบตาราง 'QuotaionSupplier' หรือตารางที่เกี่ยวข้อง (${err.message}).`;
                 } else if (err.code === '42501' || err.message?.includes('permission denied')) {
                     userMessage = `เกิดข้อผิดพลาด: ไม่มีสิทธิ์อ่านข้อมูล (${err.message})`;
                 } else if (err.code === '22P02') { // Invalid input syntax (e.g., for integer)
                     userMessage = `เกิดข้อผิดพลาด: ข้อมูลที่ส่งไป Supabase ไม่ถูกต้อง (${err.message})`;
                 }
                setError(userMessage);
                 setQuotations([]); // Ensure quotations is empty on error to prevent render errors
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuotations();
    }, []); // Runs once on mount

    // --- Navigation Handler ---
    const handleRowClick = (id) => {
        // Prevent navigation if ID is invalid or during loading
        if (!id || isLoading) return;
        navigate(`/quotation-supplier/edit/${id}`);
    };

    // --- Delete Handler ---
    const handleDelete = async (id, quotationNumber) => {
        if (!id || !window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบใบเสนอราคา ${quotationNumber}?`)) {
            return;
        }
        if (isLoading) return; // Prevent double clicks during other operations

        setIsLoading(true); // Indicate deleting activity specifically
        setError(null);
        try {
            console.log("Deleting quotation ID:", id);
            const { error: deleteError } = await supabase
                .from('QuotaionSupplier')
                .delete()
                .eq('id', id);
            if (deleteError) throw deleteError;
            // Update state immediately after successful deletion
            setQuotations(prevQuotations => prevQuotations.filter(q => q.id !== id));
            alert(`ลบใบเสนอราคา ${quotationNumber} สำเร็จ`);
        } catch (err) {
            console.error("Error deleting quotation:", err);
            let userMessage = `เกิดข้อผิดพลาดในการลบ: ${err.message}`;
             if (err.code === '42501' || err.message?.includes('security policy') || err.message?.includes('permission denied')) {
                 userMessage = 'เกิดข้อผิดพลาด: ไม่มีสิทธิ์ในการลบข้อมูลนี้';
             }
            setError(userMessage);
            alert(userMessage); // Show error to user
        } finally {
            setIsLoading(false);
        }
    };


    // --- JSX Rendering ---
    return (
        <main className="app-main">
            {/* Header Section */}
            <div className="app-content-header">
                 <div className="d-flex justify-content-between align-items-center">
                    <h1 className="fs-3">ใบเสนอราคา Adjust</h1>
                    {/* Button should be interactive unless loading */}
                    <Link to="/quotation-adjustNew" className={`btn btn-primary ${isLoading ? 'disabled' : ''}`} aria-disabled={isLoading}>
                        <i className="bi bi-plus-circle me-2"></i>สร้างใบเสนอราคาAdjustใหม่
                    </Link>
                </div>
                 <ol className="breadcrumb float-sm-start">
                    <li className="breadcrumb-item"><a href="#" onClick={(e) => {e.preventDefault(); navigate('/')}}>Home</a></li>
                    <li className="breadcrumb-item active" aria-current="page">ใบเสนอราคา Adjust</li>
                </ol>
            </div>

            {/* Content Section */}
            <div className="app-content">
                <div className="container-fluid">
                    {/* Loading & Error Indicators */}
                    {/* Show loading indicator ONLY when actively loading */}
                    {isLoading && !error && ( <div className="alert alert-info">กำลังโหลด...</div> )}
                    {/* Show error ONLY if there is an error */}
                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* Quotation List Card - Render card structure always, table content conditionally */}
                    <div className="card shadow-sm">
                        <div className="card-header"><h5 className="card-title mb-0">รายการใบเสนอราคา</h5></div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover table-striped mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>เลขที่ใบเสนอราคา</th>
                                            <th>ชื่อ Supplier</th>
                                            <th>วันที่</th>
                                            <th className="text-end">ยอดรวม (บาท)</th>
                                            {/* Status Header Removed */}
                                            <th style={{width: "15%"}}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Loading Row */}
                                        {isLoading && (
                                             <tr><td colSpan="5" className="text-center py-4"> <div className="spinner-border spinner-border-sm text-secondary"></div> </td></tr>
                                        )}
                                        {/* No Data Row (Show only if not loading and no error) */}
                                        {!isLoading && quotations.length === 0 && !error ? (
                                            <tr><td colSpan="5" className="text-center py-4">ไม่พบข้อมูลใบเสนอราคา</td></tr>
                                        ) : null}
                                        {/* Data Rows (Show only if not loading and data exists) */}
                                        {!isLoading && quotations.length > 0 && !error ? (
                                            quotations.map(q => (
                                                <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(q.id)}>
                                                    <td>{q.quotationNumber}</td>
                                                    <td>{q.supplierName}</td>
                                                    <td>{q.quotationDate ? new Date(q.quotationDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric'}) : '-'}</td>
                                                    <td className="text-end">{(q.totalAmount ?? 0).toFixed(2)}</td>
                                                    {/* Status Cell Removed */}
                                                     <td>
                                                         {/* Edit Button */}
                                                        <button
                                                            title="แก้ไข"
                                                            className="btn btn-sm btn-outline-primary me-1"
                                                            // Disable button during any loading state for safety
                                                            disabled={isLoading}
                                                            onClick={(e) => { e.stopPropagation(); handleRowClick(q.id); }}
                                                        ><i className="bi bi-pencil-fill"></i></button>
                                                         {/* Delete Button */}
                                                         <button
                                                            title="ลบ"
                                                            className="btn btn-sm btn-outline-danger"
                                                            // Disable button during any loading state for safety
                                                            disabled={isLoading}
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(q.id, q.quotationNumber); }}
                                                         ><i className="bi bi-trash-fill"></i></button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : null }
                                         {/* Error Row (Show only if not loading and error exists) */}
                                         {!isLoading && error ? (
                                             <tr><td colSpan="5" className="text-center py-4 text-danger">ไม่สามารถโหลดข้อมูลได้</td></tr>
                                         ) : null}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default QuotationAdjustListPage;

