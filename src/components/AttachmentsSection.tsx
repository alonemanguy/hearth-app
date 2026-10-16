import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import Card from './Card';
import Toast from './Toast';
import { easings } from '../lib/motion';
import { Icon } from '../lib/icons';
import {
  ApplianceFile,
  listApplianceFiles,
  uploadApplianceFile,
  deleteApplianceFile,
  getSignedUrl,
  formatFileSize,
  isImage,
} from '../lib/uploads';

type Props = {
  applianceId: string;
  editable?: boolean;
};

export default function AttachmentsSection({
  applianceId,
  editable = true,
}: Props) {
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<ApplianceFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    void load();
  }, [applianceId]);

  const load = async () => {
    setLoading(true);
    const list = await listApplianceFiles(applianceId);
    setFiles(list);
    setLoading(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    const { file: uploaded, error } = await uploadApplianceFile(
      applianceId,
      file
    );
    setUploading(false);

    if (error || !uploaded) {
      showToast(error ?? 'Upload failed');
      return;
    }

    showToast('File added');
    await load();
  };

  const handleOpen = async (file: ApplianceFile) => {
    const url = await getSignedUrl(file.path, 3600);
    if (!url) {
      showToast('Could not open file');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async (file: ApplianceFile) => {
    if (deleting) return;
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return;

    setDeleting(file.path);
    const { error } = await deleteApplianceFile(file.path);
    setDeleting(null);

    if (error) {
      showToast('Could not delete');
      return;
    }

    setFiles((prev) => prev.filter((f) => f.path !== file.path));
    showToast('File removed');
  };

  return (
    <div className="section">
      <div className="section-header-row">
        <h3 className="section-title" style={{ marginBottom: 0 }}>
          Files &amp; photos
        </h3>
        {editable && (
          <button
            className="section-action"
            onClick={handlePick}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Add file'}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {loading && (
        <Card>
          <p className="input-hint">Loading files...</p>
        </Card>
      )}

      {!loading && files.length === 0 && (
        <Card className="attachments-empty" onClick={editable ? handlePick : undefined}>
          <div className="attachments-empty-icon">
            <Icon name="camera" size={24} />
          </div>
          <div className="attachments-empty-text">
            <div className="attachments-empty-title">
              No files yet
            </div>
            <div className="attachments-empty-sub">
              Add a photo of the nameplate, a warranty PDF, or a receipt.
            </div>
          </div>
        </Card>
      )}

      <AnimatePresence initial={false}>
        {files.map((file, i) => (
          <motion.div
            key={file.path}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              duration: 0.35,
              ease: easings.easeOutExpo,
              delay: reduce ? 0 : i * 0.04,
            }}
            style={{ marginTop: 8 }}
          >
            <Card className="attachment-card">
              <button
                type="button"
                className="attachment-main"
                onClick={() => handleOpen(file)}
              >
                <div className="attachment-icon">
                  <Icon
                    name={isImage(file.mimeType) ? 'camera' : 'documents'}
                    size={18}
                  />
                </div>
                <div className="attachment-info">
                  <div className="attachment-name">{file.name}</div>
                  <div className="attachment-meta">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              </button>
              {editable && (
                <button
                  type="button"
                  className="attachment-delete"
                  onClick={() => handleDelete(file)}
                  disabled={deleting === file.path}
                  aria-label="Delete file"
                >
                  <Icon name="trash" size={16} />
                </button>
              )}
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </div>
  );
}