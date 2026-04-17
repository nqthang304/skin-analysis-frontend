import React, { useState } from 'react';
import './App.css'; 

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
      const response = await fetch("https://skin-analysis-backend-mxo9.onrender.com/api/analyze-skin", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Lỗi kết nối đến máy chủ AI");
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
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="preview-img" />
              ) : (
                <div style={{ padding: '20px 0' }}>
                  <div style={{ fontSize: '40px' }}>📷</div>
                  <p style={{ color: '#9ca3af' }}>Tải ảnh mặt mộc</p>
                </div>
              )}
              <input type="file" onChange={handleImageChange} style={{marginTop: '10px'}}/>
            </div>

            <div className="form-group">
              <label style={{fontWeight: '600', marginBottom: '8px'}}>Sản phẩm kiểm tra</label>
              <input 
                type="text" 
                placeholder="Nhập tên mỹ phẩm..." 
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
              {error && <p style={{color: 'red', textAlign: 'center', fontSize: '14px'}}>{error}</p>}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="fade-in">
            {/* Thẻ chỉ số */}
            <div className="metrics-grid">
              <div className="metric-item"><div className="metric-label">MỤN</div><div className="metric-value" style={{color: '#dc2626'}}>{result.roboflow_metrics.acne_count}</div></div>
              <div className="metric-item"><div className="metric-label">LỖ CHÂN LÔNG</div><div className="metric-value" style={{color: '#ea580c'}}>{result.roboflow_metrics.pore_count}</div></div>
              <div className="metric-item"><div className="metric-label">LOẠI DA</div><div className="metric-value" style={{color: '#2563eb'}}>{result.roboflow_metrics.skin_type_index}</div></div>
              <div className="metric-item"><div className="metric-label">SẮC TỐ</div><div className="metric-value" style={{color: '#7c3aed'}}>{result.roboflow_metrics.pigment_index}</div></div>
            </div>

            {/* Chẩn đoán */}
            <div className="card">
              <h2 style={{fontSize: '1.2rem', marginBottom: '15px'}}>🩺 Chẩn đoán AI</h2>
              <div className="diagnosis-box">"{result.expert_advice.skin_analysis.status}"</div>
              
              <div className="check-grid">
                <div>
                  <p style={{fontWeight: 'bold'}}>Độ hợp sản phẩm: {result.expert_advice.product_check.name}</p>
                  <div style={{display: 'flex', alignItems: 'center', margin: '10px 0'}}>
                    <span style={{fontSize: '2rem', fontWeight: '900', color: '#2563eb', marginRight: '10px'}}>{result.expert_advice.product_check.compatibility_score}%</span>
                  </div>
                  <p style={{fontSize: '14px', color: '#4b5563'}}>{result.expert_advice.product_check.detailed_analysis}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', fontWeight: 'bold', color: '#ef4444'}}>RỦI RO ⚠️</p>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px'}}>
                    {result.expert_advice.product_check.ingredients_of_concern.map((ing, i) => <span key={i} style={{fontSize: '10px', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px'}}>{ing}</span>)}
                  </div>
                  <p style={{fontSize: '12px', fontWeight: 'bold', color: '#10b981'}}>CÓ LỢI ✨</p>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
                    {result.expert_advice.product_check.beneficial_ingredients.map((ing, i) => <span key={i} style={{fontSize: '10px', background: '#d1fae5', padding: '2px 6px', borderRadius: '4px'}}>{ing}</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Sản phẩm gợi ý */}
            <h2 style={{margin: '20px 0'}}>🎁 Sản phẩm gợi ý</h2>
            <div className="recommend-grid">
              {result.expert_advice.recommendations.map((item, idx) => (
                <div key={idx} className="recommend-card">
                  <div style={{fontSize: '10px', color: '#3b82f6', fontWeight: 'bold'}}>{item.brand}</div>
                  <h3 style={{fontSize: '15px', margin: '5px 0'}}>{item.name}</h3>
                  <p style={{fontSize: '12px', color: '#6b7280'}}>{item.reason}</p>
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