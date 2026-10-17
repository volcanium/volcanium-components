import { useState } from "react";
import { uuid } from "../../utils/uuid";
import Modal from "./Modal";
import Form, { FormField } from "./Form";
import { notify } from "./notify";
import { useLanguage } from "../../utils/useLanguage";

/**
 * Configuration for `Table`'s "add row" flow.
 */
export interface NewRowConfig {
  /** Creates the row; call `close()` to dismiss the modal. Any thrown error's `message` is shown via `notify.error`. */
  method: (values: Record<string, unknown>, close: () => void) => Promise<void>;
  button?: { name?: string };
  modal: { title: string; fields: FormField[] };
}

export interface TableNewRowModalProps {
  newRow: NewRowConfig;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  reloadTable: () => void;
}

export function TableNewRowModal({
  newRow,
  showModal,
  setShowModal,
  reloadTable,
}: TableNewRowModalProps) {
  const id = uuid();
  const [loaderBtn, setLoaderBtn] = useState(false);
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={showModal}
      btn={{ confirm: { loading: loaderBtn } }}
      onClose={() => setShowModal(false)}
      title={newRow.modal.title}
    >
      <Form
        id={id}
        btn={null}
        onSubmit={async (values: Record<string, unknown>) => {
          setLoaderBtn(true);
          try {
            await newRow.method(values, () => setShowModal(false));
            reloadTable();
          } catch (err) {
            notify.error(err instanceof Error ? err.message : t("table_unexpected_error"));
          } finally {
            setLoaderBtn(false);
          }
        }}
        fields={newRow.modal.fields}
      />
    </Modal>
  );
}

export default TableNewRowModal;
