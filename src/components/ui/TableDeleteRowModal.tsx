import { useState } from "react";
import Modal from "./Modal";
import { notify } from "./notify";
import { useLanguage } from "../../utils/useLanguage";

export interface TableDeleteRowModalProps<Row> {
  selectedRows: Row[];
  deleteRequest: (selectedRows: Row[]) => Promise<void>;
  reloadTable: () => void;
  modalDelete: boolean;
  setModalDelete: (show: boolean) => void;
}

export function TableDeleteRowModal<Row>({
  selectedRows,
  deleteRequest,
  reloadTable,
  modalDelete,
  setModalDelete,
}: TableDeleteRowModalProps<Row>) {
  const [loaderBtnD, setLoaderBtnD] = useState(false);
  const { t } = useLanguage();

  const deleteRows = async () => {
    setLoaderBtnD(true);
    try {
      await deleteRequest(selectedRows);
      reloadTable();
    } catch {
      notify.error(t("table_internal_error"));
    } finally {
      setLoaderBtnD(false);
      setModalDelete(false);
    }
  };

  return (
    <Modal
      title={t("table_confirmation")}
      btn={{ confirm: { onClick: () => deleteRows(), loading: loaderBtnD } }}
      onClose={() => setModalDelete(false)}
      isOpen={modalDelete}
    >
      <p>
        {selectedRows.length === 1
          ? t("table_delete_confirm_one", { count: selectedRows.length })
          : t("table_delete_confirm_many", { count: selectedRows.length })}
      </p>
    </Modal>
  );
}

export default TableDeleteRowModal;
