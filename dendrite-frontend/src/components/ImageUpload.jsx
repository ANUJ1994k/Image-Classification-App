import React, { useState } from 'react';

function ImageUpload() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!image) {
      alert("Please upload an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      alert(`Prediction: ${data.label} (${data.confidence * 100}%)`);
    } catch (err) {
      console.error(err);
      setError("Prediction failed. Showing dummy result.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '500px' }}>
        <h3 className="text-center mb-4">Image Classifier</h3>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="form-control mb-3"
        />

        {preview && (
          <div className="mb-3 text-center">
            <img
              src={preview}
              alt="Preview"
              className="img-thumbnail"
              style={{ maxWidth: '300px', maxHeight: '300px' }}
            />
          </div>
        )}

        <div className="d-grid gap-2 mb-3">
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Predicting...
              </>
            ) : (
              'Predict Image'
            )}
          </button>
        </div>

        {error && (
          <div className="alert alert-warning text-center" role="alert">
            {error} <br /> Dummy Prediction: Cat (98%)
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;
