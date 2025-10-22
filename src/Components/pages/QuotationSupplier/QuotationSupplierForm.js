// src/pages/QuotationSupplierForm.js
import React, { useState, Fragment, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// ❗️ Ensure this import path is correct
import { supabase, getCurrentUserId } from '../../../SupaBaseApi/supabaseClient';

// --- Component Definition ---
function QuotationSupplierForm() {
    const { quotationId } = useParams(); // Get ID from URL for editing
    const navigate = useNavigate();
    const isEditing = Boolean(quotationId);

    // --- States ---
    const [items, setItems] = useState([]); // Main items list { id, itemNo, ..., subItems: [{id, description}] }
    const [docInfo, setDocInfo] = useState({ // Header/Document information
        quotationNumber: `QT-${Date.now().toString().slice(-6)}`, // quotationNo
        quotationDate: new Date().toISOString().split('T')[0],   // quotationDT
        supplierCode: '',       // supplierCode (NEW)
        supplierName: '',       // supplierName
        supplierAddress: '',    // supplierAddress
        supplierPhone: '',      // supplierPhone
        supplierTax: '',        // supplierTax
        supplierEmail: '',      // supplierEmail
        supplierSalesName: '',  // supplierSalerName
        supplierSalesPhone: '', // supplierSalerPhone
        delivery: '30 วัน',      // delivery
        validity: '30 วัน',      // validity
        warranty: '1 ปี',       // warranty (Default)
        payment: '30',          // payment (string for input, will convert to number)
        user_id: null           // Optional: For RLS
    });
    const [summary, setSummary] = useState({ subtotal: 0, vat: 0, grandTotal: 0 }); // Calculated summary: subtotal, vat, total
    const [isLoading, setIsLoading] = useState(false); // Loading state indicator
    const [error, setError] = useState(null);       // Error message state

    // --- Helper Functions ---
    const parseNumeric = (value) => parseFloat(value) || 0; // Convert to float, default 0
    const parseIntStrict = (value) => parseInt(value, 10) || 0; // Convert to integer, default 0

    // --- Effect for Loading Data (Edit Mode) & User ID ---
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const initializeForm = async () => {
            try {
                // Fetch current user ID for potential RLS use
                const userId = await getCurrentUserId();
                setDocInfo(prev => ({ ...prev, user_id: userId }));
                // if (!userId) console.warn("No user logged in.");

                if (isEditing) {
                    console.log("Editing mode, loading data for ID:", quotationId);

                    // 1. Fetch Header from QuotaionSupplier table
                    const { data: headerData, error: headerError } = await supabase
                        .from('QuotaionSupplier') // <<< VERIFY TABLE NAME
                        .select('*')
                        .eq('id', quotationId)
                        .maybeSingle(); // Handles not found without erroring immediately

                    if (headerError) throw headerError;
                    if (!headerData) throw new Error(`Quotation with ID ${quotationId} not found or permission denied.`);

                    // 2. Fetch Items from QuotaionSupplierItem table
                    const { data: itemData, error: itemError } = await supabase
                        .from('QuotaionSupplierItem') // <<< VERIFY TABLE NAME
                        .select('*')
                        .eq('id_quotaionsupplier', quotationId); // <<< VERIFY FOREIGN KEY NAME

                    if (itemError) throw itemError;
                    const currentItemData = itemData || []; // Ensure it's an array

                    // 3. Fetch Scopes from QuotaionSupplierScope table
                    const itemIds = currentItemData.map(item => item.id);
                    let scopeData = [];
                    if (itemIds.length > 0) {
                        const { data: fetchedScopes, error: scopeError } = await supabase
                            .from('QuotaionSupplierScope') // <<< VERIFY TABLE NAME
                            .select('*')
                            .in('id_quotaionsupplieritem', itemIds); // <<< VERIFY FOREIGN KEY NAME

                        if (scopeError) throw scopeError;
                        scopeData = fetchedScopes || []; // Ensure it's an array
                    }

                    // 4. Map DB data to React State (matching DB columns)
                    const formattedHeader = {
                        quotationNumber: headerData.quotationNo || '',
                        quotationDate: headerData.quotationDT ? headerData.quotationDT.split('T')[0] : '', // Format date YYYY-MM-DD
                        supplierCode: headerData.supplierCode || '',
                        supplierName: headerData.supplierName || '',
                        supplierAddress: headerData.supplierAddress || '',
                        supplierPhone: headerData.supplierPhone || '',
                        supplierTax: headerData.supplierTax || '',
                        supplierEmail: headerData.supplierEmail || '',
                        supplierSalesName: headerData.supplierSalerName || '', // DB: supplierSalerName
                        supplierSalesPhone: headerData.supplierSalerPhone || '', // DB: supplierSalerPhone
                        delivery: headerData.delivery || '30 วัน',
                        validity: headerData.validity || '30 วัน',
                        warranty: headerData.warranty || '1 ปี',
                        payment: headerData.payment?.toString() ?? '30', // Convert DB number to string for input
                        user_id: headerData.user_id // Keep if RLS is used
                    };

                    const formattedItems = currentItemData.map(item => {
                        const itemScopes = scopeData
                            .filter(scope => scope.id_quotaionsupplieritem === item.id)
                            .map(scope => ({
                                id: scope.id, // Use scope's DB ID as key
                                description: scope.scopeOfwork || '' // DB: scopeOfwork
                            }));

                        return {
                            id: item.id, // Use item's DB ID as key
                            itemNo: item.itemNo || '', // DB: itemNo (varchar)
                            itemName: item.itemName || '', // DB: itemName
                            qty: item.qty || 1, // DB: qty (numeric) - Default to 1 if null?
                            warranty: item.warranty || '', // DB: warranty
                            price: item.price || 0, // DB: price (double)
                            amount: item.amount || 0, // DB: amount (double)
                            subItems: itemScopes,
                        };
                    });

                    setDocInfo(formattedHeader);
                    setItems(formattedItems);
                    updateSummary(formattedItems); // Calculate summary based on loaded data

                } else {
                     console.log("Create mode: Resetting form.");
                     // Reset form state for new entry, keep defaults and user_id
                    setItems([]);
                    setDocInfo(prev => ({
                        user_id: prev.user_id, // Keep user
                        quotationNumber: `QT-${Date.now().toString().slice(-6)}`,
                        quotationDate: new Date().toISOString().split('T')[0],
                        supplierCode: '',
                        supplierName: '',
                        supplierAddress: '',
                        supplierPhone: '',
                        supplierTax: '',
                        supplierEmail: '',
                        supplierSalesName: '',
                        supplierSalesPhone: '',
                        delivery: '30 วัน',
                        validity: '30 วัน',
                        warranty: '1 ปี',
                        payment: '30',
                    }));
                    setSummary({ subtotal: 0, vat: 0, grandTotal: 0 });
                }
            } catch (err) {
                console.error("Error initializing form:", err);
                setError(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${err.message}`);
                 // Clear form data on load error to prevent saving inconsistent state
                 setItems([]);
                 setDocInfo(prev => ({ // Keep only essential defaults maybe
                    quotationNumber: `QT-${Date.now().toString().slice(-6)}`,
                    quotationDate: new Date().toISOString().split('T')[0],
                    user_id: prev.user_id,
                    // Reset other fields to empty or default
                    supplierCode: '', supplierName: '', supplierAddress: '', supplierPhone: '',
                    supplierTax: '', supplierEmail: '', supplierSalesName: '', supplierSalesPhone: '',
                    delivery: '30 วัน', validity: '30 วัน', warranty: '1 ปี', payment: '30',
                 }));
                 setSummary({ subtotal: 0, vat: 0, grandTotal: 0 });
            } finally {
                setIsLoading(false);
            }
        };

        initializeForm();

    }, [quotationId, isEditing]); // Effect Dependencies

    // --- Handlers (Doc Info, Calculations, Add/Remove Items/Scopes) ---
    const handleDocInfoChange = (e) => {
        const { id, value } = e.target;
        setDocInfo(prevInfo => ({ ...prevInfo, [id]: value }));
    };

    const updateSummary = (currentItems) => {
        const subtotal = currentItems.reduce((sum, mainItem) => sum + (mainItem.amount || 0), 0);
        const vat = subtotal * 0.07; // Assuming 7% VAT
        const grandTotal = subtotal + vat;
        setSummary({ subtotal, vat, grandTotal });
    };

    const handleAddMainItem = () => {
        const newMainItem = {
            id: `new-${Date.now()}`, // Temp frontend ID
            itemNo: (items.length + 1).toString(), // String item number
            itemName: '',
            qty: 1,
            warranty: docInfo.warranty, // Default from header
            price: 0,
            amount: 0,
            subItems: [],
        };
        setItems(prevItems => [...prevItems, newMainItem]);
        // Summary doesn't change yet as amount is 0
    };

    const handleRemoveMainItem = (mainId) => {
        let itemCounter = 1;
        // Use functional update to ensure working with latest state
        setItems(prevItems => {
             const newItems = prevItems.filter(item => item.id !== mainId).map(item => ({
                ...item,
                itemNo: (itemCounter++).toString() // Renumber and ensure string
            }));
             updateSummary(newItems); // Calculate summary based on the NEW items array
             return newItems; // Return the updated state
        });
    };


    const handleMainItemChange = (mainId, field, value) => {
         // Use functional update
         setItems(prevItems => {
             const newItems = prevItems.map(item => {
                if (item.id === mainId) {
                    const updatedItem = { ...item, [field]: value };
                    // Recalculate amount if qty or price changes
                    if (field === 'qty' || field === 'price') {
                        const qty = parseIntStrict(updatedItem.qty);
                        const price = parseNumeric(updatedItem.price);
                        updatedItem.amount = qty * price;
                    }
                    // Ensure itemNo is always a string in state
                    if (field === 'itemNo') {
                        updatedItem.itemNo = value.toString();
                    }
                    return updatedItem;
                }
                return item;
            });
             updateSummary(newItems); // Calculate summary based on the NEW items array
             return newItems; // Return the updated state
         });
    };

    const handleAddSubItem = (mainId) => {
        const newSubItem = { id: `new-${Date.now()}`, description: '' }; // Temp frontend ID
        setItems(prevItems => prevItems.map(mainItem =>
            mainItem.id === mainId
                ? { ...mainItem, subItems: [...mainItem.subItems, newSubItem] }
                : mainItem
        ));
    };

    const handleRemoveSubItem = (mainId, subId) => {
         setItems(prevItems => prevItems.map(mainItem =>
            mainItem.id === mainId
                ? { ...mainItem, subItems: mainItem.subItems.filter(sub => sub.id !== subId) }
                : mainItem
        ));
    };

    const handleSubItemChange = (mainId, subId, value) => {
        setItems(prevItems => prevItems.map(mainItem => {
            if (mainItem.id === mainId) {
                const updatedSubItems = mainItem.subItems.map(subItem =>
                    subItem.id === subId ? { ...subItem, description: value } : subItem
                );
                return { ...mainItem, subItems: updatedSubItems };
            }
            return mainItem;
        }));
    };

    // --- Save Handler (Using RPC Function) ---
    const handleSave = async () => {
        setIsLoading(true);
        setError(null);
        console.log("Saving Quotation...");

        // --- Validation ---
        if (!docInfo.supplierName || !docInfo.quotationNumber || !docInfo.quotationDate) {
             alert("กรุณากรอกข้อมูล Supplier, เลขที่ และวันที่ใบเสนอราคา");
             setIsLoading(false);
             return;
        }
        if (items.length === 0) {
             alert("กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ");
             setIsLoading(false);
             return;
        }
        // Add more specific validations (e.g., check if numbers are valid)

        // --- Prepare Data for RPC matching DB columns ---
        const headerPayload = {
            quotationNo: docInfo.quotationNumber,
            quotationDT: docInfo.quotationDate, // Keep as 'YYYY-MM-DD' string, function casts
            supplierCode: docInfo.supplierCode || null, // Handle empty string
            supplierName: docInfo.supplierName,
            supplierAddress: docInfo.supplierAddress,
            supplierPhone: docInfo.supplierPhone,
            supplierTax: docInfo.supplierTax,
            supplierEmail: docInfo.supplierEmail,
            supplierSalerName: docInfo.supplierSalesName, // Match DB column
            supplierSalerPhone: docInfo.supplierSalesPhone, // Match DB column
            delivery: docInfo.delivery,
            validity: docInfo.validity,
            warranty: docInfo.warranty, // Default warranty from header
            payment: parseNumeric(docInfo.payment), // Convert payment term (days) to number
            subtotal: summary.subtotal,
            vat: summary.vat,
            total: summary.grandTotal,
        };

        const itemsPayload = items.map(item => ({
            // Map to QuotaionSupplierItem columns
            itemNo: item.itemNo, // String as per DB
            itemName: item.itemName,
            qty: parseIntStrict(item.qty), // Ensure numeric for DB
            warranty: item.warranty, // Item-specific warranty
            price: parseNumeric(item.price), // Ensure numeric for DB
            amount: parseNumeric(item.amount), // Ensure numeric for DB
            // Map scopes directly for the function to handle
            scopes: item.subItems.map(scope => ({
                 // Map to QuotaionSupplierScope column name
                scopeOfwork: scope.description // DB: scopeOfwork
            }))
        }));

        try {
            console.log("Calling Supabase function 'save_quotation_supplier'");
            const payload = {
                 p_is_editing: isEditing,
                 p_header_id: isEditing ? parseIntStrict(quotationId) : null,
                 p_header_data: headerPayload,
                 p_items_data: itemsPayload
            };
            console.log("Payload:", payload);

            // Call the PostgreSQL function via RPC
            const { data, error: rpcError } = await supabase.rpc('save_quotation_supplier', payload);

            if (rpcError) {
                // Throw error to be caught by catch block for unified handling
                throw rpcError;
            }

            console.log('Supabase function executed successfully:', data); // Log response from function if any
             // 'data' from RPC might be the returned header ID
            alert(`ใบเสนอราคา ${isEditing ? 'แก้ไข' : 'สร้าง'} สำเร็จ! (ID: ${data || quotationId})`);
            navigate('/quotation-supplier'); // Redirect to list page

        } catch (err) {
            console.error("Error saving quotation via RPC:", err);
            // Provide more user-friendly error messages
            let userMessage = `เกิดข้อผิดพลาดในการบันทึก: ${err.message || 'Unknown RPC error'}`;
             if (err.message?.includes('unique constraint') || err.details?.includes('duplicate key value violates unique constraint')) {
                 userMessage = 'เกิดข้อผิดพลาด: เลขที่ใบเสนอราคาซ้ำ';
             } else if (err.code === '42501' || err.message?.includes('security policy') || err.message?.includes('permission denied')) {
                 userMessage = 'เกิดข้อผิดพลาด: ไม่มีสิทธิ์บันทึกข้อมูล';
             } else if (err.code === '23503') { // Foreign key violation
                 userMessage = 'เกิดข้อผิดพลาด: ข้อมูลอ้างอิงไม่ถูกต้อง';
             } else if (err.code === 'P0001') { // Explicit RAISE EXCEPTION from function
                  userMessage = `เกิดข้อผิดพลาดจากระบบ: ${err.message}`;
             } else if (err.message?.includes('function public.save_quotation_supplier') && err.message?.includes('does not exist')) {
                  // This error means the SQL function wasn't created in Supabase
                 userMessage = 'เกิดข้อผิดพลาด: ไม่พบฟังก์ชันสำหรับบันทึกในฐานข้อมูล กรุณาติดต่อผู้ดูแลระบบ (Function Missing)';
             } else if (err.message?.includes('invalid input syntax for type')) {
                  userMessage = `เกิดข้อผิดพลาด: ข้อมูลบางอย่างมีรูปแบบไม่ถูกต้อง (${err.message})`;
             }
            setError(userMessage);
            alert(userMessage); // Show detailed error to user
        } finally {
            setIsLoading(false);
        }
    };

    // --- JSX Rendering ---
    return (
        <main className="app-main">
            {/* Header */}
            <div className="app-content-header">
                <h1 className="fs-3">{isEditing ? `แก้ไขใบเสนอราคา #${quotationId}` : 'สร้างใบเสนอราคา (Supplier)'}</h1>
                <ol className="breadcrumb float-sm-end">
                    <li className="breadcrumb-item"><a href="#" onClick={(e) => {e.preventDefault(); navigate('/')}}>Home</a></li>
                    <li className="breadcrumb-item"><a href="#" onClick={(e) => {e.preventDefault(); navigate('/quotation-supplier')}}>ใบเสนอราคา Supplier</a></li>
                    <li className="breadcrumb-item active" aria-current="page">{isEditing ? 'แก้ไข' : 'สร้างใหม่'}</li>
                </ol>
            </div>

            {/* Content */}
            <div className="app-content">
                <div className="container-fluid">
                    {/* Loading and Error Indicators */}
                    {isLoading && (
                        <div className="alert alert-info d-flex align-items-center" role="alert">
                           <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                           กำลังโหลด / บันทึกข้อมูล...
                         </div>
                    )}
                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* Form sections are disabled while loading */}
                    <fieldset disabled={isLoading}>
                        {/* Document Info Card */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-header"><h5 className="card-title mb-0">ข้อมูลเอกสาร</h5></div>
                            <div className="card-body">
                                <div className="row g-3">
                                    {/* Left Column */}
                                    <div className="col-md-6">
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label htmlFor="supplierName" className="form-label">ชื่อ Supplier <span className="text-danger">*</span></label>
                                                <input required type="text" className="form-control" id="supplierName" value={docInfo.supplierName} onChange={handleDocInfoChange} />
                                            </div>
                                             {/* supplierCode Field */}
                                             <div className="col-md-6">
                                                <label htmlFor="supplierCode" className="form-label">รหัส Supplier</label>
                                                <input type="text" className="form-control" id="supplierCode" value={docInfo.supplierCode} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="supplierTax" className="form-label">เลขประจำตัวผู้เสียภาษี</label>
                                                <input type="text" className="form-control" id="supplierTax" value={docInfo.supplierTax} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="supplierPhone" className="form-label">เบอร์โทร Supplier</label>
                                                <input type="tel" className="form-control" id="supplierPhone" value={docInfo.supplierPhone} onChange={handleDocInfoChange} />
                                            </div>
                                             <div className="col-md-6">
                                                <label htmlFor="supplierEmail" className="form-label">Email Supplier</label>
                                                <input type="email" className="form-control" id="supplierEmail" value={docInfo.supplierEmail} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-12">
                                                <label htmlFor="supplierAddress" className="form-label">ที่อยู่ Supplier</label>
                                                <textarea className="form-control" id="supplierAddress" rows="2" value={docInfo.supplierAddress} onChange={handleDocInfoChange}></textarea>
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="supplierSalesName" className="form-label">ชื่อผู้ติดต่อ (Sales)</label>
                                                <input type="text" className="form-control" id="supplierSalesName" value={docInfo.supplierSalesName} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="supplierSalesPhone" className="form-label">เบอร์โทรผู้ติดต่อ</label>
                                                <input type="tel" className="form-control" id="supplierSalesPhone" value={docInfo.supplierSalesPhone} onChange={handleDocInfoChange} />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Right Column */}
                                    <div className="col-md-6">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label htmlFor="quotationNumber" className="form-label">เลขที่ใบเสนอราคา <span className="text-danger">*</span></label>
                                                <input required type="text" className="form-control" id="quotationNumber" value={docInfo.quotationNumber} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="quotationDate" className="form-label">วันที่ <span className="text-danger">*</span></label>
                                                <input required type="date" className="form-control" id="quotationDate" value={docInfo.quotationDate} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                 {/* Changed type to number */}
                                                <label htmlFor="payment" className="form-label">Payment Term (Days)</label>
                                                <input type="number" min="0" className="form-control" id="payment" value={docInfo.payment} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="validity" className="form-label">Validity (ยืนราคา)</label>
                                                <input type="text" className="form-control" id="validity" value={docInfo.validity} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="delivery" className="form-label">Delivery Term</label>
                                                <input type="text" className="form-control" id="delivery" value={docInfo.delivery} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="warranty" className="form-label">Default Warranty</label>
                                                <input type="text" className="form-control" id="warranty" value={docInfo.warranty} onChange={handleDocInfoChange} placeholder="Default for new items"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items and Services Card */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-header"><h5 className="card-title mb-0">รายการสินค้าและบริการ</h5></div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table mb-0 table-vcenter">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: '5%' }}>ItemNo</th>
                                                <th style={{ width: '45%' }}>ItemName / Scope of Work</th>
                                                <th style={{ width: '8%' }}>QTY</th>
                                                <th style={{ width: '12%' }}>Warranty</th>
                                                <th style={{ width: '15%' }}>Price</th>
                                                <th style={{ width: '15%' }}>Amount</th>
                                                <th style={{ width: '5%' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((mainItem) => (
                                                <Fragment key={mainItem.id}>
                                                    {/* Parent Row */}
                                                    <tr className="table-secondary" style={{ verticalAlign: 'middle' }}>
                                                        {/* Item No Input (type="text") */}
                                                        <td><input type="text" className="form-control form-control-sm fw-bold text-center" value={mainItem.itemNo} onChange={(e) => handleMainItemChange(mainItem.id, 'itemNo', e.target.value)} /></td>
                                                        <td><input type="text" className="form-control form-control-sm fw-bold" placeholder="ชื่อรายการหลัก" value={mainItem.itemName} onChange={(e) => handleMainItemChange(mainItem.id, 'itemName', e.target.value)} /></td>
                                                        <td><input type="number" min="0" /* Allow 0 */ className="form-control form-control-sm fw-bold text-end" value={mainItem.qty} onChange={(e) => handleMainItemChange(mainItem.id, 'qty', e.target.value)} /></td>
                                                        <td><input type="text" className="form-control form-control-sm fw-bold" value={mainItem.warranty} onChange={(e) => handleMainItemChange(mainItem.id, 'warranty', e.target.value)} /></td>
                                                        <td><input type="number" min="0" step="0.01" className="form-control form-control-sm fw-bold text-end" value={mainItem.price} onChange={(e) => handleMainItemChange(mainItem.id, 'price', e.target.value)} /></td>
                                                        <td><input type="text" className="form-control form-control-sm fw-bold text-end" readOnly disabled value={mainItem.amount.toFixed(2)} /></td>
                                                        <td className="text-center"><button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveMainItem(mainItem.id)}><i className="bi bi-trash-fill"></i></button></td>
                                                    </tr>
                                                    {/* Sub-Items (Scopes) */}
                                                    {mainItem.subItems.map(subItem => (
                                                        <tr key={subItem.id}>
                                                            <td></td>
                                                            <td style={{ paddingLeft: '2rem' }}><input type="text" className="form-control form-control-sm" value={subItem.description} onChange={(e) => handleSubItemChange(mainItem.id, subItem.id, e.target.value)} placeholder="ระบุขอบเขตงาน..." /></td>
                                                            <td colSpan={4}></td>
                                                            <td className="text-center"><button className="btn btn-sm btn-link text-danger" onClick={() => handleRemoveSubItem(mainItem.id, subItem.id)}><i className="bi bi-x-circle-fill"></i></button></td>
                                                        </tr>
                                                    ))}
                                                    {/* Add Scope Button Row */}
                                                    <tr>
                                                        <td></td>
                                                        <td style={{ paddingLeft: '2rem' }}><button className="btn btn-sm btn-outline-primary" onClick={() => handleAddSubItem(mainItem.id)}><i className="bi bi-plus-lg"></i> เพิ่มขอบเขตงาน</button></td>
                                                        <td colSpan={5}></td>
                                                    </tr>
                                                </Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button className="btn btn-primary" onClick={handleAddMainItem}><i className="bi bi-plus-circle me-2"></i>เพิ่มรายการหลัก</button>
                            </div>
                        </div>

                        {/* Summary Section */}
                        <div className="row justify-content-end">
                            <div className="col-md-5">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="fw-bold">ราคารวม (Subtotal)</span>
                                            <span>{summary.subtotal.toFixed(2)} บาท</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="fw-bold">ภาษี 7% (VAT)</span>
                                            <span>{summary.vat.toFixed(2)} บาท</span>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between fs-5 fw-bold text-primary">
                                            <span>ยอดรวมสุทธิ</span>
                                            <span>{summary.grandTotal.toFixed(2)} บาท</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    {/* Action Buttons (outside fieldset to remain clickable) */}
                    <div className="text-end mt-4 mb-4">
                        <button className="btn btn-secondary me-2" onClick={() => navigate('/quotation-supplier')} disabled={isLoading}>
                           <i className="bi bi-x-circle me-2"></i> ยกเลิก
                        </button>
                       <button className="btn btn-success btn-lg" onClick={handleSave} disabled={isLoading}>
                           {isLoading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : <i className="bi bi-save-fill me-2"></i>}
                           {isEditing ? 'บันทึกการแก้ไข' : 'บันทึกใบเสนอราคา'}
                       </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default QuotationSupplierForm;

