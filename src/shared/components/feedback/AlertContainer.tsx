import { useRef } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import useAlertStore from '../../stores/alertStore';
import { Dialog, DialogBody, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';

const TITLE_ID = 'alert-dialog-title';
const DESCRIPTION_ID = 'alert-dialog-description';

function AlertContainer() {
  const { alert, hideAlert } = useAlertStore();
  const safestActionRef = useRef<HTMLButtonElement | null>(null);

  const handleConfirm = () => {
    if (alert?.onConfirm) alert.onConfirm();
    hideAlert();
  };

  const handleCancel = () => {
    if (alert?.onCancel) alert.onCancel();
    hideAlert();
  };

  return (
    <Dialog
      open={alert !== null}
      onClose={handleCancel}
      titleId={TITLE_ID}
      descriptionId={DESCRIPTION_ID}
      presentation="dialog"
      initialFocusRef={safestActionRef}
    >
      {alert && (
        <>
          <div className="px-4 pt-4 sm:px-6 sm:pt-5">
            <div className="flex items-center gap-4 mb-3">
              <span
                aria-hidden="true"
                className={`p-3 rounded-card ${
                  alert.type === 'danger' ? 'bg-danger/10 text-danger' :
                  alert.type === 'warning' ? 'bg-warning/10 text-warning' :
                  'bg-info/10 text-info'
                }`}
              >
                {alert.type === 'info' ? <Info size={24} /> : <AlertTriangle size={24} />}
              </span>
              <h2 id={TITLE_ID} className="text-xl font-bold text-text-primary tracking-tight font-display">
                {alert.title}
              </h2>
            </div>
          </div>
          <DialogBody>
            <p id={DESCRIPTION_ID} className="text-text-secondary leading-relaxed">
              {alert.message}
            </p>
          </DialogBody>
          <DialogFooter>
            <div className="flex justify-end gap-2">
              <Button
                ref={safestActionRef}
                variant="ghost"
                onClick={handleCancel}
              >
                {alert.cancelText || 'Hủy'}
              </Button>
              <Button
                variant={alert.type === 'danger' ? 'danger' : 'primary'}
                onClick={handleConfirm}
              >
                {alert.confirmText || 'Đồng ý'}
              </Button>
            </div>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
}

export default AlertContainer;
