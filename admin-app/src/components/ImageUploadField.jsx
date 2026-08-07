import { useState } from 'react';
import { fetchApiAuth } from '../utils/authClient.js';

function ImageUploadField({ label, folder, valueUrl, onUploaded, previewAlt = 'Uploaded image preview' }) {
    const [previewUrl, setPreviewUrl] = useState(valueUrl || '');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const isImageFile = (file) => file && typeof file.type === 'string' && file.type.startsWith('image/');

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (!isImageFile(file)) {
            setError('Only image files are allowed.');
            setPreviewUrl(valueUrl || '');
            return;
        }

        setError('');
        setUploading(true);
        setPreviewUrl(URL.createObjectURL(file));

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('folder', folder);

            const media = await fetchApiAuth('/api/admin/media/images', {
                method: 'POST',
                body: formData,
            });

            setPreviewUrl(media.url);
            onUploaded(media);
        } catch (err) {
            setError(err.message || 'Image upload failed');
            setPreviewUrl(valueUrl || '');
        } finally {
            setUploading(false);
        }
    };

    return (
        <label className="admin-upload-field">
            {label}
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            {previewUrl ? (
                <span className="admin-upload-preview">
                    <img src={previewUrl} alt={previewAlt} loading="lazy" />
                </span>
            ) : null}
            {uploading ? <span className="admin-help-text">Uploading image...</span> : null}
            {error ? <span className="admin-field-error">{error}</span> : null}
        </label>
    );
}

export default ImageUploadField;
