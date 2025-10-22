// src/pages/QuotationAdjustForm.js
import React, { useState, Fragment, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUserId } from '../../../SupaBaseApi/supabaseClient';

// --- Component Definition ---
function QuotationAdjustForm() {
    const navigate = useNavigate();
    
    // --- States ---
    const [selectedQuotationId, setSelectedQuotationId] = useState(null);
    const isEditing = Boolean(selectedQuotationId); // isEditing is true if an item is LOADED

    const [quotationList, setQuotationList] = useState([]);
    const [items, setItems] = useState([]); // Main items list
    const [docInfo, setDocInfo] = useState({
        // Supplier fields
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
        user_id: null,
        // Customer fields
        customerName: '',
        customerCode: '',
        customerTax: '',
        customerPhone: '',
        customerEmail: '',
        customerAddress: '',
        contactName: '',
        contactPhone: '',
        quotationNo: '',
        quotationDT: '',
        quotationExpDT: '',
        customerpayment: '30',
        customervalidity: '30 วัน',
        customerdelivery: '30 วัน',
        customerwarranty: '1 ปี',
        AdjustPercent: '', 
    });
    const [summary, setSummary] = useState({ subtotal: 0, vat: 0, grandTotal: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Helper Functions ---
    const parseNumeric = (value) => parseFloat(value) || 0;
    const parseIntStrict = (value) => parseInt(value, 10) || 0;

    // --- Reusable resetForm function ---
    const resetForm = useCallback((userId) => {
        console.log("Resetting form for new entry.");
        setSelectedQuotationId(null);
        setItems([]);
        setDocInfo({
            user_id: userId,
            // Reset Supplier fields
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
            // Reset Customer fields
            customerName: '',
            customerCode: '',
            customerTax: '',
            customerPhone: '',
            customerEmail: '',
            customerAddress: '',
            contactName: '',
            contactPhone: '',
            quotationNo: `QT-C-${Date.now().toString().slice(-6)}`, 
            quotationDT: new Date().toISOString().split('T')[0],
            quotationExpDT: '',
            customerpayment: '30',
            customervalidity: '30 วัน',
            customerdelivery: '30 วัน',
            customerwarranty: '1 ปี',
            AdjustPercent: '',
        });
        setSummary({ subtotal: 0, vat: 0, grandTotal: 0 });
        setError(null);
    }, []);

    // --- Reusable loadQuotationData function ---
    const loadQuotationData = async (idToLoad) => {
        if (!idToLoad) {
            resetForm(docInfo.user_id);
            return;
        }
        console.log("Loading data for ID:", idToLoad);
        setIsLoading(true);
        setError(null);

        try {
            // 1. Fetch Header
            const { data: headerData, error: headerError } = await supabase
                .from('QuotaionSupplier')
                .select('*')
                .eq('id', idToLoad)
                .single();

            if (headerError) throw headerError;
            if (!headerData) throw new Error(`Quotation with ID ${idToLoad} not found.`);

            // 2. Fetch Items
            const { data: itemData, error: itemError } = await supabase
                .from('QuotaionSupplierItem')
                .select('*')
                .eq('id_quotaionsupplier', idToLoad);
            if (itemError) throw itemError;
            const currentItemData = itemData || [];

            // 3. Fetch Scopes
            const itemIds = currentItemData.map(item => item.id);
            let scopeData = [];
            if (itemIds.length > 0) {
                const { data: fetchedScopes, error: scopeError } = await supabase
                    .from('QuotaionSupplierScope')
                    .select('*')
                    .in('id_quotaionsupplieritem', itemIds);
                if (scopeError) throw scopeError;
                scopeData = fetchedScopes || [];
            }

            // 4. Map DB data to React State
            const formattedHeader = {
                ...docInfo, 
                quotationNumber: headerData.quotationNo || '',
                quotationDate: headerData.quotationDT ? headerData.quotationDT.split('T')[0] : '',
                supplierCode: headerData.supplierCode || '',
                supplierName: headerData.supplierName || '',
                supplierAddress: headerData.supplierAddress || '',
                supplierPhone: headerData.supplierPhone || '',
                supplierTax: headerData.supplierTax || '',
                supplierEmail: headerData.supplierEmail || '',
                supplierSalesName: headerData.supplierSalerName || '',
                supplierSalesPhone: headerData.supplierSalerPhone || '',
                delivery: headerData.delivery || '30 วัน',
                validity: headerData.validity || '30 วัน',
                warranty: headerData.warranty || '1 ปี',
                payment: headerData.payment?.toString() ?? '30',
                user_id: headerData.user_id,
                // PRE-FILL Customer fields
                customerName: '', 
                customerCode: '',
                customerTax: '',
                customerPhone: '',
                customerEmail: '',
                customerAddress: '',
                contactName: '',
                contactPhone: '',
                quotationNo: `QT-C-${Date.now().toString().slice(-6)}`, 
                quotationDT: new Date().toISOString().split('T')[0],
                quotationExpDT: '',
                customerpayment: '30',
                customervalidity: '30 วัน',
                customerdelivery: '30 วัน',
                customerwarranty: '1 ปี',
                AdjustPercent: '',
            };

            // Map Item Data
            const formattedItems = currentItemData.map(item => {
                const itemScopes = scopeData
                    .filter(scope => scope.id_quotaionsupplieritem === item.id)
                    .map(scope => ({
                        id: scope.id,
                        description: scope.scopeOfwork || ''
                    }));
                
                const originalAmount = item.amount || 0; 

                return {
                    id: item.id,
                    itemNo: item.itemNo || '',
                    itemName: item.itemName || '',
                    qty: item.qty || 1,
                    warranty: item.warranty || '',
                    price: item.price || 0,
                    amount: originalAmount, 
                    subItems: itemScopes,
                    adjustpercent: 0,
                    adjustedAmount: originalAmount, 
                    profit: 0, 
                };
            });

            setDocInfo(formattedHeader);
            setItems(formattedItems);
            updateSummary(formattedItems);

        } catch (err) {
            console.error("Error loading quotation data:", err);
            setError(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${err.message}`);
            resetForm(docInfo.user_id);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Effect for Initial Page Load ---
    useEffect(() => {
        const initializePage = async () => {
            setIsLoading(true);
            let currentUserId = null;
            try {
                currentUserId = await getCurrentUserId();
                setDocInfo(prev => ({ ...prev, user_id: currentUserId }));

                const { data, error } = await supabase
                    .from('QuotaionSupplier')
                    .select('id, quotationNo')
                    .eq('isDelete', false)
                    .order('quotationDT', { ascending: false });

                if (error) throw error;
                
                setQuotationList(data || []);
                resetForm(currentUserId); 

            } catch (err) {
                console.error("Error initializing page:", err);
                setError(`เกิดข้อผิดพลาดในการโหลดรายการใบเสนอราคา: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        initializePage();
    }, [resetForm]); 

    // --- Effect to handle selection changes ---
    useEffect(() => {
        if (selectedQuotationId) {
            loadQuotationData(selectedQuotationId);
        } else {
            resetForm(docInfo.user_id);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedQuotationId]);


    // --- Handlers ---
    const handleDocInfoChange = (e) => {
        const { id, value } = e.target;
        setDocInfo(prevInfo => ({ ...prevInfo, [id]: value }));
    };

    // updateSummary now sums 'adjustedAmount'
    const updateSummary = (currentItems) => {
        const subtotal = currentItems.reduce((sum, mainItem) => sum + (mainItem.adjustedAmount || 0), 0);
        const vat = subtotal * 0.07;
        const grandTotal = subtotal + vat;
        setSummary({ subtotal, vat, grandTotal });
    };

    // HANDLER: For the Adjust % column (SINGLE ROW)
    const handleAdjustPercentChange = (mainId, value) => {
        setItems(prevItems => {
            const newItems = prevItems.map(item => {
                if (item.id === mainId) {
                    const newPercent = parseNumeric(value);
                    const originalAmount = item.amount;
                    const newAdjustedAmount = originalAmount * (1 + newPercent / 100);
                    const newProfit = newAdjustedAmount - originalAmount;
                    
                    return { 
                        ...item, 
                        adjustpercent: newPercent, 
                        adjustedAmount: newAdjustedAmount, 
                        profit: newProfit 
                    };
                }
                return item;
            });
            updateSummary(newItems);
            return newItems;
        });
    };

    // Handler for GLOBAL Adjust % (Averaged)
    const handleGlobalAdjustPercentChange = (e) => {
        const newPercentValue = e.target.value;
        const newPercentNumeric = parseNumeric(newPercentValue);

        // 1. Update the input field's state
        setDocInfo(prev => ({ ...prev, AdjustPercent: newPercentValue }));

        // 2. Apply this percentage to all items
        setItems(prevItems => {
            const itemCount = prevItems.length;
            // Calculate the averaged percent. Handle 0 items to avoid division by zero.
            const averagedPercent = (itemCount > 0) ? (newPercentNumeric / itemCount) : 0;

            const newItems = prevItems.map(item => {
                const originalAmount = item.amount; // Base price
                // Apply the AVERAGED percent
                const newAdjustedAmount = originalAmount * (1 + averagedPercent / 100); 
                const newProfit = newAdjustedAmount - originalAmount;
                
                return { 
                    ...item, 
                    adjustpercent: averagedPercent, // Apply the averaged percent
                    adjustedAmount: newAdjustedAmount, 
                    profit: newProfit 
                };
            });
            
            // 3. Update the grand total summary
            updateSummary(newItems); 
            
            // 4. Return the new items array to state
            return newItems;
        });
    };


    // --- Original handlers for CREATE mode ---
    const handleAddMainItem = () => {
        const newMainItem = {
            id: `new-${Date.now()}`,
            itemNo: (items.length + 1).toString(),
            itemName: '',
            qty: 1,
            warranty: docInfo.customerwarranty, 
            price: 0,
            amount: 0,
            subItems: [],
            adjustpercent: 0,
            adjustedAmount: 0,
            profit: 0,
        };
        setItems(prevItems => [...prevItems, newMainItem]);
    };

    const handleMainItemChange = (mainId, field, value) => {
         setItems(prevItems => {
             const newItems = prevItems.map(item => {
                 if (item.id === mainId) {
                     const updatedItem = { ...item, [field]: value };
                     if (field === 'qty' || field === 'price') {
                         const qty = parseIntStrict(updatedItem.qty);
                         const price = parseNumeric(updatedItem.price);
                         const originalAmount = qty * price;
                         
                         const percent = updatedItem.adjustpercent || 0; 
                         const adjustedAmount = originalAmount * (1 + percent / 100);
                         const profit = adjustedAmount - originalAmount;

                         updatedItem.amount = originalAmount;
                         updatedItem.adjustedAmount = adjustedAmount;
                         updatedItem.profit = profit;
                     }
                     if (field === 'itemNo') {
                         updatedItem.itemNo = value.toString();
                     }
                     return updatedItem;
                 }
                 return item;
             });
             updateSummary(newItems);
             return newItems;
         });
    };

    const handleAddSubItem = (mainId) => {
        const newSubItem = { id: `new-${Date.now()}`, description: '' };
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

    const handleRemoveMainItem = (mainId) => {
        let itemCounter = 1;
        setItems(prevItems => {
             const newItems = prevItems.filter(item => item.id !== mainId).map(item => ({
                ...item,
                itemNo: (itemCounter++).toString()
             }));
             updateSummary(newItems);
             return newItems;
        });
    };
    // --- END OF handlers ---

    // Handler for the Quotation Selector
    const handleQuotationSelect = (e) => {
        const id = e.target.value;
        setSelectedQuotationId(id ? id : null);
    };


    // --- MODIFICATION: Real Save Handler (Using RPC Function) ---
    const handleSave = async () => {
        setIsLoading(true);
        setError(null);
        
        // --- 1. Validation ---
        if (!docInfo.customerName || !docInfo.quotationNo || !docInfo.quotationDT) {
             alert("กรุณากรอกข้อมูล ลูกค้า, เลขที่ และวันที่ใบเสนอราคา (ลูกค้า)");
             setIsLoading(false);
             return;
        }
        if (items.length === 0) {
             alert("กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ");
             setIsLoading(false);
             return;
        }

        // --- 2. Prepare Header Payload (Matching your table) ---
        const customerHeaderPayload = {
            quotationNo: docInfo.quotationNo,
            quotationDT: docInfo.quotationDT,
            qutationExpDt: docInfo.quotationExpDT, // Key 'qutationExpDt'
            customerName: docInfo.customerName,
            customerAddress: docInfo.customerAddress,
            customerPhone: docInfo.customerPhone,
            customerTax: docInfo.customerTax,
            supplierEmail: docInfo.customerEmail, // Key 'supplierEmail' (using customerEmail)
            contactName: docInfo.contactName,
            contactPhone: docInfo.contactPhone,
            delivery: docInfo.customerdelivery,
            validity: docInfo.customervalidity,
            warranty: docInfo.customerwarranty,
            payment: parseNumeric(docInfo.customerpayment),
            subtotal: summary.subtotal, 
            vat: summary.vat,
            total: summary.grandTotal,
            id_supplier_quotation: selectedQuotationId, // Link to QT Supplier
            user_id: docInfo.user_id // Send user_id for RLS
        };

        // --- 3. Prepare Items Payload (Matching your tables) ---
        const customerItemsPayload = items.map(item => ({
            // --- QuotaionAdjustItem ---
            itemNo: item.itemNo,
            itemName: item.itemName,
            qty: parseIntStrict(item.qty),
            warranty: item.warranty,
            price: parseNumeric(item.price), 
            amount: parseNumeric(item.amount), 
            adjustpercent: parseNumeric(item.adjustpercent),
            adjustamount: parseNumeric(item.adjustedAmount), // Key 'adjustamount'
            profit: parseNumeric(item.profit),
            
            // --- QuotaionAdjustScope (nested) ---
            scopes: item.subItems.map(scope => ({
                scopeOfwork: scope.description // Key 'scopeOfwork'
            }))
        }));

        console.log("--- Calling RPC save_quotation_adjust ---");
        console.log("Header:", customerHeaderPayload);
        console.log("Items:", customerItemsPayload);
        
        // --- 4. Call the RPC function ---
        try {
            // This is the function you created in Supabase
            const { data, error: rpcError } = await supabase.rpc('save_quotation_adjust', {
                p_header_data: customerHeaderPayload,
                p_items_data: customerItemsPayload
            });

            if (rpcError) {
                throw rpcError; // Throw error to be caught by catch block
            }

            console.log('Supabase function executed successfully:', data);
            // data is the returned header ID
            alert(`ใบเสนอราคา (ลูกค้า) บันทึกสำเร็จ! (ID: ${data})`);
            navigate('/quotation-customer-list'); // (Change to your customer list page)

        } catch (err) {
             console.error("Error saving customer quotation:", err);
             // Provide user-friendly error messages
             let userMessage = `เกิดข้อผิดพลาดในการบันทึก: ${err.message || 'Unknown RPC error'}`;
             if (err.message?.includes('function public.save_quotation_adjust') && err.message?.includes('does not exist')) {
                 userMessage = 'เกิดข้อผิดพลาด: ไม่พบฟังก์ชันสำหรับบันทึกในฐานข้อมูล (save_quotation_adjust) กรุณาติดต่อผู้ดูแลระบบ';
             } else if (err.message?.includes('unique constraint')) {
                 userMessage = 'เกิดข้อผิดพลาด: เลขที่ใบเสนอราคานี้ซ้ำ';
             } else if (err.code === 'P0001') { // Explicit RAISE from function
                 userMessage = `เกิดข้อผิดพลาดจากระบบ: ${err.message}`;
             }
             setError(userMessage);
             alert(userMessage);
        } finally {
             setIsLoading(false);
        }
    };
    // --- END OF MODIFICATION ---


    // --- JSX Rendering ---
    return (
        <main className="app-main">
            {/* Header */}
            <div className="app-content-header">
                <h1 className="fs-3">สร้างใบเสนอราคา (Adjust)</h1>
                <ol className="breadcrumb float-sm-end">
                    <li className="breadcrumb-item"><a href="#" onClick={(e) => {e.preventDefault(); navigate('/')}}>Home</a></li>
                    <li className="breadcrumb-item"><a href="#" onClick={(e) => {e.preventDefault(); navigate('/quotation-supplier')}}>ใบเสนอราคา Supplier</a></li>
                    <li className="breadcrumb-item active" aria-current="page">สร้างใหม่</li>
                </ol>
            </div>

            {/* Content */}
            <div className="app-content">
                <div className="container-fluid">
                    {isLoading && (
                        <div className="alert alert-info d-flex align-items-center" role="alert">
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            กำลังโหลด / บันทึกข้อมูล...
                        </div>
                    )}
                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* QUOTATION SELECTOR */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <div className="row g-3 align-items-center">
                                <div className="col-auto">
                                    <label htmlFor="quotationSelect" className="form-label mb-0 fw-bold">เลือกใบเสนอราคา (Supplier):</label>
                                </div>
                                <div className="col-md-5">
                                    <select 
                                        id="quotationSelect" 
                                        className="form-select" 
                                        value={selectedQuotationId || ''}
                                        onChange={handleQuotationSelect}
                                        disabled={isLoading}
                                    >
                                        <option value="">-- สร้างใบเสนอราคาใหม่ (ไม่อ้างอิง) --</option>
                                        {quotationList.map(qt => (
                                            <option key={qt.id} value={qt.id}>
                                                {qt.quotationNo}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-auto">
                                    <button 
                                        className="btn btn-outline-secondary" 
                                        onClick={() => setSelectedQuotationId(null)}
                                        disabled={isLoading}
                                    >
                                        <i className="bi bi-file-earmark-plus me-1"></i> สร้างใหม่
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form sections are disabled while loading */}
                    <fieldset disabled={isLoading}>
                        
                        {/* Document Info Card (SUPPLIER) - READ ONLY */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-header"><h5 className="card-title mb-0">ข้อมูลเอกสารSupplier (อ้างอิง)</h5></div>
                            <fieldset disabled>
                            <div className="card-body">
                                <div className="row g-3">
                                    {/* Left Column */}
                                    <div className="col-md-6">
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label htmlFor="supplierName" className="form-label">ชื่อ Supplier</label>
                                                <input type="text" className="form-control" id="supplierName" value={docInfo.supplierName} readOnly />
                                            </div>
                                             <div className="col-md-6">
                                                <label htmlFor="supplierCode" className="form-label">รหัส Supplier</label>
                                                <input type="text" className="form-control" id="supplierCode" value={docInfo.supplierCode} readOnly />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="supplierTax" className="form-label">เลขประจำตัวผู้เสียภาษี</label>
                                                <input type="text" className="form-control" id="supplierTax" value={docInfo.supplierTax} readOnly />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="supplierPhone" className="form-label">เบอร์โทร Supplier</label>
                                                <input type="tel" className="form-control" id="supplierPhone" value={docInfo.supplierPhone} readOnly />
                                            </div>
                                             <div className="col-md-6">
                                                <label htmlFor="supplierEmail" className="form-label">Email Supplier</label>
                                                <input type="email" className="form-control" id="supplierEmail" value={docInfo.supplierEmail} readOnly />
                                            </div>
                                            <div className="col-12">
                                                <label htmlFor="supplierAddress" className="form-label">ที่อยู่ Supplier</label>
                                                <textarea className="form-control" id="supplierAddress" rows="2" value={docInfo.supplierAddress} readOnly></textarea>
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="supplierSalesName" className="form-label">ชื่อผู้ติดต่อ (Sales)</label>
                                                <input type="text" className="form-control" id="supplierSalesName" value={docInfo.supplierSalesName} readOnly />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="supplierSalesPhone" className="form-label">เบอร์โทรผู้ติดต่อ</label>
                                                <input type="tel" className="form-control" id="supplierSalesPhone" value={docInfo.supplierSalesPhone} readOnly />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Right Column */}
                                    <div className="col-md-6">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label htmlFor="quotationNumber" className="form-label">เลขที่ใบเสนอราคา</label>
                                                <input type="text" className="form-control" id="quotationNumber" value={docInfo.quotationNumber} readOnly />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="quotationDate" className="form-label">วันที่</label>
                                                <input type="date" className="form-control" id="quotationDate" value={docInfo.quotationDate} readOnly />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="payment" className="form-label">Payment Term (Days)</label>
                                                <input type="number" min="0" className="form-control" id="payment" value={docInfo.payment} readOnly />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="validity" className="form-label">Validity (ยืนราคา)</label>
                                                <input type="text" className="form-control" id="validity" value={docInfo.validity} readOnly />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="delivery" className="form-label">Delivery Term</label>
                                                <input type="text" className="form-control" id="delivery" value={docInfo.delivery} readOnly />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="warranty" className="form-label">Default Warranty</label>
                                                <input type="text" className="form-control" id="warranty" value={docInfo.warranty} readOnly />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </fieldset>
                        </div>


                        {/* Customer Info Card (EDITABLE) */}
                         <div className="card shadow-sm mb-4">
                            <div className="card-header"><h5 className="card-title mb-0">ข้อมูลลูกค้า (สำหรับสร้างใบเสนอราคาใหม่)</h5></div>
                            <div className="card-body">
                                <div className="row g-3">
                                    {/* Left Column */}
                                    <div className="col-md-6">
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label htmlFor="customerName" className="form-label">ชื่อ ลูกค้า <span className="text-danger">*</span></label>
                                                <input required type="text" className="form-control" id="customerName" value={docInfo.customerName} onChange={handleDocInfoChange} />
                                            </div>
                                             <div className="col-md-6">
                                                <label htmlFor="customerCode" className="form-label">รหัส ลูกค้า</label>
                                                <input type="text" className="form-control" id="customerCode" value={docInfo.customerCode} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="customerTax" className="form-label">เลขประจำตัวผู้เสียภาษี</label>
                                                <input type="text" className="form-control" id="customerTax" value={docInfo.customerTax} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="customerPhone" className="form-label">เบอร์โทร ลูกค้า</label>
                                                <input type="tel" className="form-control" id="customerPhone" value={docInfo.customerPhone} onChange={handleDocInfoChange} />
                                            </div>
                                             <div className="col-md-6">
                                                <label htmlFor="customerEmail" className="form-label">Email ลูกค้า</label>
                                                <input type="email" className="form-control" id="customerEmail" value={docInfo.customerEmail} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-12">
                                                <label htmlFor="customerAddress" className="form-label">ที่อยู่ ลูกค้า</label>
                                                <textarea className="form-control" id="customerAddress" rows="2" value={docInfo.customerAddress} onChange={handleDocInfoChange}></textarea>
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="contactName" className="form-label">ชื่อผู้ติดต่อ</label>
                                                <input type="text" className="form-control" id="contactName" value={docInfo.contactName} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="contactPhone" className="form-label">เบอร์โทรผู้ติดต่อ</label>
                                                <input type="tel" className="form-control" id="contactPhone" value={docInfo.contactPhone} onChange={handleDocInfoChange} />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Right Column */}
                                    <div className="col-md-6">
                                        <div className="row g-3">
                                            <div className="col-md-12">
                                                <label htmlFor="quotationNo" className="form-label">เลขที่ใบเสนอราคา (ลูกค้า) <span className="text-danger">*</span></label>
                                                <input required type="text" className="form-control" id="quotationNo" value={docInfo.quotationNo} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="quotationDT" className="form-label">วันที่ <span className="text-danger">*</span></label>
                                                <input required type="date" className="form-control" id="quotationDT" value={docInfo.quotationDT} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="quotationExpDT" className="form-label">วันที่หมดอายุ <span className="text-danger">*</span></label>
                                                <input required type="date" className="form-control" id="quotationExpDT" value={docInfo.quotationExpDT} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="customerpayment" className="form-label">Payment Term (Days)</label>
                                                <input type="number" min="0" className="form-control" id="customerpayment" value={docInfo.customerpayment} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="customervalidity" className="form-label">Validity (ยืนราคา)</label>
                                                <input type="text" className="form-control" id="customervalidity" value={docInfo.customervalidity} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="customerdelivery" className="form-label">Delivery Term</label>
                                                <input type="text" className="form-control" id="customerdelivery" value={docInfo.customerdelivery} onChange={handleDocInfoChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="customerwarranty" className="form-label">Default Warranty</label>
                                                <input type="text" className="form-control" id="customerwarranty" value={docInfo.customerwarranty} onChange={handleDocInfoChange} placeholder="Default for new items"/>
                                            </div>

                                             <div className="col-md-12">
                                                
                                            </div>
                                              <div className="col-md-6">
                                                <label htmlFor="AdjustPercent" className="form-label fw-bold">Adjust All Items (%)</label>
                                                <input 
                                                    type="number" 
                                                    step="0.01"
                                                    className="form-control" 
                                                    id="AdjustPercent" 
                                                    value={docInfo.AdjustPercent}  
                                                    onChange={handleGlobalAdjustPercentChange} // Handler is set
                                                    disabled={!isEditing} // Disabled if not in adjust mode
                                                    placeholder={isEditing ? "เช่น 10 (หารเฉลี่ย)" : "กรุณาเลือก QT Supplier ก่อน"}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Items and Services Card (ADJUST / CREATE MODE) */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-header"><h5 className="card-title mb-0">รายการสินค้าและบริการ</h5></div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table mb-0 table-vcenter">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: '5%' }}>ItemNo</th>
                                                <th style={{ width: '25%' }}>ItemName / Scope of Work</th>
                                                <th style={{ width: '5%' }}>QTY</th>
                                                <th style={{ width: '10%' }}>Warranty</th>
                                                <th style={{ width: '10%' }}>Price (ทุน/หน่วย)</th>
                                                <th style={{ width: '10%' }}>Amount (ทุนรวม)</th>
                                                <th style={{ width: '10%' }}>Adjust (%)</th>
                                                <th style={{ width: '10%' }}>Adjusted Amount (ราคาขาย)</th>
                                                <th style={{ width: '10%' }}>Profit (กำไร)</th>
                                                <th style={{ width: '5%' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((mainItem) => (
                                                <Fragment key={mainItem.id}>
                                                    {/* Parent Row */}
                                                    <tr className="table-secondary" style={{ verticalAlign: 'middle' }}>
                                                        <td><input type="text" className="form-control form-control-sm fw-bold text-center" value={mainItem.itemNo} readOnly={isEditing} onChange={(e) => handleMainItemChange(mainItem.id, 'itemNo', e.target.value)} /></td>
                                                        <td><input type="text" className="form-control form-control-sm fw-bold" placeholder="ชื่อรายการหลัก" value={mainItem.itemName} readOnly={isEditing} onChange={(e) => handleMainItemChange(mainItem.id, 'itemName', e.target.value)} /></td>
                                                        <td><input type="number" min="0" className="form-control form-control-sm fw-bold text-end" value={mainItem.qty} readOnly={isEditing} onChange={(e) => handleMainItemChange(mainItem.id, 'qty', e.target.value)} /></td>
                                                        <td><input type="text" className="form-control form-control-sm fw-bold" value={mainItem.warranty} readOnly={isEditing} onChange={(e) => handleMainItemChange(mainItem.id, 'warranty', e.target.value)} /></td>
                                                        <td><input type="number" min="0" step="0.01" className="form-control form-control-sm fw-bold text-end" value={mainItem.price} readOnly={isEditing} onChange={(e) => handleMainItemChange(mainItem.id, 'price', e.target.value)} /></td>
                                                        <td><input type="text" className="form-control form-control-sm fw-bold text-end" readOnly disabled value={(mainItem.amount || 0).toFixed(2)} /></td>
                                                        
                                                        {/* --- ADJUST COLUMN (SINGLE ROW) --- */}
                                                        <td>
                                                            <input 
                                                                type="number" 
                                                                step="0.01" 
                                                                className="form-control form-control-sm fw-bold text-end" 
                                                                value={mainItem.adjustpercent} 
                                                                onChange={(e) => handleAdjustPercentChange(mainItem.id, e.target.value)} 
                                                                disabled={!isEditing} 
                                                            />
                                                        </td>
                                                        {/* --- NEW READONLY COLUMNS --- */}
                                                        <td>
                                                            <input 
                                                                type="text" 
                                                                className="form-control form-control-sm fw-bold text-end text-success" 
                                                                readOnly 
                                                                disabled 
                                                                value={(mainItem.adjustedAmount || 0).toFixed(2)} 
                                                            />
                                                        </td>
                                                        <td>
                                                            <input 
                                                                type="text" 
                                                                className="form-control form-control-sm fw-bold text-end text-info" 
                                                                readOnly 
                                                                disabled 
                                                                value={(mainItem.profit || 0).toFixed(2)} 
                                                            />
                                                        </td>

                                                        <td className="text-center">
                                                            {!isEditing && (
                                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveMainItem(mainItem.id)}>
                                                                    <i className="bi bi-trash-fill"></i>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    
                                                    {/* Sub-Items (Scopes) */}
                                                    {mainItem.subItems.map(subItem => (
                                                        <tr key={subItem.id}>
                                                            <td></td>
                                                            <td style={{ paddingLeft: '2rem' }}>
                                                                <input 
                                                                    type="text" 
                                                                    className="form-control form-control-sm" 
                                                                    value={subItem.description} 
                                                                    readOnly={isEditing} 
                                                                    onChange={(e) => handleSubItemChange(mainItem.id, subItem.id, e.target.value)} 
                                                                    placeholder="ระบุขอบเขตงาน..." 
                                                                />
                                                            </td>
                                                            <td colSpan={7}></td> 
                                                            <td className="text-center">
                                                                {!isEditing && (
                                                                    <button className="btn btn-sm btn-link text-danger" onClick={() => handleRemoveSubItem(mainItem.id, subItem.id)}>
                                                                        <i className="bi bi-x-circle-fill"></i>
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {/* Add Scope Button Row */}
                                                    <tr>
                                                        <td></td>
                                                        <td style={{ paddingLeft: '2rem' }}>
                                                            {!isEditing && (
                                                                <button className="btn btn-sm btn-outline-primary" onClick={() => handleAddSubItem(mainItem.id)}>
                                                                    <i className="bi bi-plus-lg"></i> เพิ่มขอบเขตงาน
                                                                </button>
                                                            )}
                                                        </td>
                                                        <td colSpan={8}></td> 
                                                    </tr>
                                                    
                                                </Fragment>
                                            ))}
                                            
                                            {items.length === 0 && (
                                                <tr>
                                                    <td colSpan={10} className="text-center text-muted p-4"> 
                                                        <i>{isEditing ? 'ไม่มีรายการในใบเสนอราคานี้' : 'กรุณาเลือกใบเสนอราคา Supplier เพื่อเริ่มการ Adjust หรือ คลิก "เพิ่มรายการหลัก" เพื่อสร้างใหม่'}</i>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="card-footer">
                                {!isEditing && (
                                    <button className="btn btn-primary" onClick={handleAddMainItem}>
                                        <i className="bi bi-plus-circle me-2"></i>เพิ่มรายการหลัก
                                    </button>
                                )}
                                {isEditing && (
                                    <span className="text-muted"><i>โหมด Adjust: ไม่สามารถเพิ่ม/ลบรายการจากใบเสนอราคาอ้างอิงได้</i></span>
                                )}
                            </div>
                        </div>

                        {/* Summary Section (Now reflects ADJUSTED total) */}
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
                                            <span>ยอดรวมสุทธิ (ราคาขาย)</span>
                                            <span>{summary.grandTotal.toFixed(2)} บาท</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    {/* Action Buttons */}
                    <div className="text-end mt-4 mb-4">
                        <button className="btn btn-secondary me-2" onClick={() => navigate('/quotation-supplier')} disabled={isLoading}>
                           <i className="bi bi-x-circle me-2"></i> ยกเลิก
                        </button>
                        <button className="btn btn-success btn-lg" onClick={handleSave} disabled={isLoading}>
                            {isLoading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : <i className="bi bi-save-fill me-2"></i>}
                            บันทึกใบเสนอราคา (ลูกค้า)
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default QuotationAdjustForm;a