// src/components/Home.js

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { logout } from '../redux/authSlice'; // Import logout action

const Home = () => {
  const { token, isAuthenticated, userId } = useSelector(state => state.auth);
  const [userData, setUserData] = useState(null);
  const [file, setFile] = useState(null);
  const [ocrResult, setOcrResult] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [processMessage, setProcessMessage] = useState('');
  const [documentId, setDocumentId] = useState(null);
  const [inputDocumentId, setInputDocumentId] = useState('');
  const dispatch = useDispatch(); // Initialize dispatch
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
    } else {
      axios.get('http://localhost:8000/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        navigate('/login');
      });
    }
  }, [isAuthenticated, token, navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage('Vui lòng chọn một tệp để upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    try {
      const response = await axios.post('http://localhost:8000/uploadDocument', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201) {
        const id = response.data.documentId;
        setDocumentId(id);
        setUploadMessage(`Document uploaded successfully: ${id}`);
        setProcessMessage('');
        setOcrResult('');
        setInputDocumentId(id);
      } else {
        setUploadMessage('Lỗi khi upload tài liệu.');
      }
    } catch (error) {
      setUploadMessage('Lỗi khi upload tài liệu.');
    }
  };

  const handleProcess = async () => {
    const idToProcess = inputDocumentId || documentId;
  
    if (!idToProcess) {
      setProcessMessage('Không có ID tài liệu. Vui lòng upload tài liệu trước.');
      return;
    }
  
    try {
      const response = await axios.post(`http://localhost:8000/processDocument/${idToProcess}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      if (response.status === 200) {
        setOcrResult(response.data.ocrText);
        setProcessMessage('Tài liệu đã được xử lý thành công!');
      } else if (response.status === 403) {
        // Xử lý các trường hợp lỗi khi subscription hết hạn hoặc hết lượt yêu cầu
        if (response.data.message.includes('expired')) {
          setProcessMessage('Subscription expired, please re-subscribe.');
        } else if (response.data.message.includes('remaining uses')) {
          setProcessMessage("You're out of request, please buy more.");
        } else {
          setProcessMessage('Lỗi khi xử lý tài liệu.');
        }
      }
    } catch (error) {
      setProcessMessage('Lỗi khi xử lý tài liệu.');
    }
  };
  

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(ocrResult, 10, 10);
    doc.save('result.pdf');
  };

  const downloadDOCX = () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun(ocrResult),
              ],
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'result.docx');
    });
  };

  const downloadTXT = () => {
    const blob = new Blob([ocrResult], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'result.txt');
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      dispatch(logout()); // Dispatch logout action
      navigate('/login');
    }
  };

  return (
    <div>
      <header style={headerStyle}>
        <button style={logoutButtonStyle} onClick={handleLogout}>Logout</button>
        <Link to="/purchase" style={linkStyle}>
          <button style={buttonStyle}>Purchase Service</button>
        </Link>
        <div style={profileStyle}>
          <img 
            src="https://media.istockphoto.com/id/1451587807/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg?s=612x612&w=0&k=20&c=yDJ4ITX1cHMh25Lt1vI1zBn2cAKKAlByHBvPJ8gEiIg=" 
            alt="Profile" 
            style={imageStyle} 
            onClick={() => navigate('/account')} 
          />
          <div style={emailWrapperStyle}>
            <p style={emailStyle}>{userData ? userData.email : 'Loading...'}</p>
          </div>
        </div>
      </header>

      <div style={mainContentStyle}>
        <h2>WELCOME TO OCR PROCESSING SERVICE</h2>

        <div style={uploadSectionStyle}>
          <h3 >Upload Document</h3>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload Document</button>
          {uploadMessage && <p style={uploadMessageStyle}>{uploadMessage}</p>}
        </div>

        <div style={processSectionStyle}>
          <h3>Process Document</h3>
          <input 
            type="text" 
            placeholder="Enter Document ID" 
            value={inputDocumentId} 
            onChange={(e) => setInputDocumentId(e.target.value)} 
            style={{ display: 'none' }} 

          />
          <button onClick={handleProcess}>Process Document</button>
          {processMessage && <p style={processMessageStyle}>{processMessage}</p>}
          {ocrResult && (
            <div style={ocrResultStyle}>
              <h3>OCR Result:</h3>
              <p>{ocrResult}</p>
              <button onClick={downloadPDF}>Download PDF</button>
              <button onClick={downloadDOCX}>Download DOCX</button>
              <button onClick={downloadTXT}>Download TXT</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px',
  backgroundColor: '#f5f5f5',
  borderBottom: '1px solid #ddd',
};

const logoutButtonStyle = {
  padding: '8px 16px',
  fontSize: '14px',
  backgroundColor: '#dc3545',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginRight: 'auto',
};

const profileStyle = {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
};

const imageStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  marginRight: '10px',
};

const emailWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
};

const emailStyle = {
  margin: '0',
};

const mainContentStyle = {
  padding: '20px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  marginTop: '20px',
};

const uploadSectionStyle = {
  marginBottom: '20px',
  padding: '15px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  border: '1px solid #ddd',
};

const processSectionStyle = {
  padding: '15px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  border: '1px solid #ddd',
};

const ocrResultStyle = {
  marginTop: '20px',
  padding: '15px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  border: '1px solid #ddd',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const linkStyle = {
  textDecoration: 'none',
  marginLeft: '20px',
  marginRight:'60px'
};

const buttonStyle = {
  padding: '8px 16px',
  fontSize: '14px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const uploadMessageStyle = {
  color: '#28a745', // Green for success messages
  fontWeight: 'bold',
};

const processMessageStyle = {
  color: '#dc3545', // Red for error messages
  fontWeight: 'bold',
};

export default Home;




  // Handle file upload
  // const handleUpload = async () => {
  //   if (!file) {
  //     setUploadMessage('Vui lòng chọn một tệp để upload.');
  //     return;
  //   }
    
  //   if (!userId) {
  //     setUploadMessage('Không có user ID. Vui lòng đăng nhập lại.');
  //     return;
  //   }
  
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   formData.append('userId', userId);
  
  //   try {
  //     const response = await axios.post('http://localhost:8000/uploadDocument', formData, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'multipart/form-data'
  //       }
  //     });
  
  //     if (response.status === 201) {
  //       setUploadMessage(response.data.message);
  //       setProcessMessage('');
  //       setOcrResult('');
  //     } else {
  //       setUploadMessage('Lỗi khi upload tài liệu.');
  //     }
  //   } catch (error) {
  //     console.error('Error uploading document:', error.response?.data || error.message);
  //     setUploadMessage('Lỗi khi upload tài liệu.');
  //   }
  // };