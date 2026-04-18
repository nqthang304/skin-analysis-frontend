import React, { useState } from 'react';
import './App.css'; 

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://skin-analysis-backend-mxo9.onrender.com';

function App() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image || !productName) {
      setError("Vui lòng chọn ảnh và nhập tên sản phẩm!");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", image);
    formData.append("product_name", productName);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-skin`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        let message = "Lỗi kết nối đến máy chủ AI";
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              message = errorData.message || message;
            } catch (jsonError) {
              message = errorText;
            }
          }
        } catch (readError) {
          message = "Lỗi kết nối đến máy chủ AI";
        }
        throw new Error(message);
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="wrapper">
        <h1 className="main-title">SkinAI Expert</h1>
        <p className="sub-title">Phân tích da chuyên sâu & Tư vấn mỹ phẩm</p>

        {/* Input Section */}
        <div className="card">
          <div className="input-grid">
            <div className="upload-box">
              {/* Nếu có ảnh từ Roboflow trả về (có vẽ bounding box), thì hiển thị nó. Nếu không thì hiện ảnh Preview gốc */}
              {result?.data?.raw_metrics?.output_image ? (
                <img src={`data:image/jpeg;base64,${result.data.raw_metrics.output_image}`} alt="Analyzed Skin" className="preview-img" />
              ) : previewUrl ? (
                <img src={previewUrl} alt="Preview" className="preview-img" />
              ) : (
                <div style={{ padding: '20px 0' }}>
                  <div style={{ fontSize: '40px' }}>📷</div>
                  <p style={{ color: '#9ca3af' }}>Tải ảnh mặt mộc</p>
                </div>
              )}
              {/* Ẩn nút chọn ảnh sau khi đã có kết quả để UI sạch hơn */}
              {!result && (
                <input type="file" onChange={handleImageChange} style={{marginTop: '10px'}}/>
              )}
            </div>

            <div className="form-group">
              <label style={{fontWeight: '600', marginBottom: '8px'}}>Sản phẩm đang dùng / cần kiểm tra</label>
              <input 
                type="text" 
                placeholder="VD: Sữa rửa mặt Cerave, BHA 1%..." 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="btn-analyze"
                style={{backgroundColor: loading ? '#9ca3af' : '#2563eb'}}
              >
                {loading ? "ĐANG PHÂN TÍCH..." : "PHÂN TÍCH NGAY"}
              </button>
              {error && <p style={{color: 'red', textAlign: 'center', fontSize: '14px', marginTop: '10px'}}>{error}</p>}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result?.data && (
          <div className="fade-in">
            
            {/* THẺ TỔNG QUÁT MỚI THÊM VÀO */}
            <div className="overall-score-card">
              <h2>ĐIỂM SỨC KHỎE LÀN DA</h2>
              <div className="score-circle">
                {result.data.scores.overall_score}<span style={{fontSize: '18px'}}>/10</span>
              </div>
              <p className="primary-issue">
                Vấn đề cấp bách nhất: <strong>{result.data.scores.primary_issue}</strong>
              </p>
            </div>

            {/* Thẻ chỉ số thành phần */}
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-label">ĐỘ SẠCH MỤN</div>
                <div className="metric-value" style={{color: result.data.scores.acne_score < 5 ? '#dc2626' : '#10b981'}}>{result.data.scores.acne_score}/10</div>
                <div className="metric-sub">({result.data.scores.raw_acne} nốt mụn)</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">LỖ CHÂN LÔNG</div>
                <div className="metric-value" style={{color: result.data.scores.pore_score < 5 ? '#ea580c' : '#10b981'}}>{result.data.scores.pore_score}/10</div>
                <div className="metric-sub">({result.data.scores.raw_pores} lcl to)</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">CÂN BẰNG</div>
                <div className="metric-value" style={{color: '#2563eb'}}>{result.data.scores.balance_score}/10</div>
                <div className="metric-sub">{result.data.scores.skin_text}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">SẮC TỐ</div>
                <div className="metric-value" style={{color: '#7c3aed'}}>{result.data.scores.pigment_score}/10</div>
                <div className="metric-sub">(Độ đều màu)</div>
              </div>
            </div>

            {/* Chẩn đoán */}
            <div className="card">
              <h2 style={{fontSize: '1.2rem', marginBottom: '15px'}}>🩺 Chẩn đoán từ Bác sĩ AI</h2>
              <div className="diagnosis-box">"{result.data.consultation.skin_analysis.status}"</div>
              
              <div style={{marginBottom: '15px'}}>
                <h3 style={{fontSize: '14px', color: '#4b5563', marginBottom: '8px'}}>Các mối quan tâm chính:</h3>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                  {result.data.consultation.skin_analysis.primary_concerns.map((concern, idx) => (
                    <span key={idx} className="tag-concern">{concern}</span>
                  ))}
                </div>
              </div>

              <div className="advice-box">
                <strong>💡 Lời khuyên Routine:</strong> {result.data.consultation.skin_analysis.expert_routine_advice}
              </div>
            </div>

            {/* Đánh giá sản phẩm */}
            <div className="card">
              <div className="check-grid">
                <div>
                  <p style={{fontWeight: 'bold', fontSize: '1.1rem'}}>Độ tương thích: <span style={{color: '#2563eb'}}>{result.data.consultation.product_check.name}</span></p>
                  <div style={{display: 'flex', alignItems: 'center', margin: '10px 0'}}>
                    <span style={{fontSize: '2.5rem', fontWeight: '900', color: result.data.consultation.product_check.is_compatible ? '#10b981' : '#ef4444', marginRight: '15px'}}>
                      {result.data.consultation.product_check.compatibility_score}%
                    </span>
                    <span style={{
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '13px', 
                      fontWeight: 'bold', 
                      backgroundColor: result.data.consultation.product_check.is_compatible ? '#d1fae5' : '#fee2e2', 
                      color: result.data.consultation.product_check.is_compatible ? '#059669' : '#dc2626'
                    }}>
                      {result.data.consultation.product_check.is_compatible ? '✅ Phù hợp' : '⚠️ Cần cẩn trọng'}
                    </span>
                  </div>
                  <p style={{fontSize: '14px', color: '#4b5563', lineHeight: '1.6'}}>{result.data.consultation.product_check.detailed_analysis}</p>
                </div>

                <div style={{background: '#f9fafb', padding: '15px', borderRadius: '12px'}}>
                  <p style={{fontSize: '12px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px'}}>THÀNH PHẦN CÓ LỢI</p>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
                    {(result.data.consultation.product_check.beneficial_ingredients ?? []).map((ing, i) => 
                      <span key={i} className="tag-benefit">{ing}</span>
                    )}
                  </div>
                  <p style={{fontSize: '12px', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px'}}>THÀNH PHẦN RỦI RO</p>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '15px'}}>
                    {(result.data.consultation.product_check.ingredients_of_concern ?? []).map((ing, i) => 
                      <span key={i} className="tag-risk">{ing}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sản phẩm gợi ý */}
            <h2 style={{margin: '20px 0'}}>🎁 Sản phẩm gợi ý bổ trợ</h2>
            <div className="recommend-grid">
              {(result.data.consultation.recommendations ?? []).map((item, idx) => (
                <div key={idx} className="recommend-card">
                  <div style={{fontSize: '11px', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase'}}>{item.brand}</div>
                  <h3 style={{fontSize: '16px', margin: '8px 0', color: '#1f2937'}}>{item.name}</h3>
                  <p style={{fontSize: '13px', color: '#6b7280', lineHeight: '1.5'}}>{item.reason}</p>
                </div>
              ))}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}

export default App;