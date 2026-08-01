import React from "react";
import Modal, { ModalProps } from "../../components/ui/Modal";
import { useLanguage } from "../../utils/useLanguage";

export default function InDev({ ...props }: Partial<ModalProps>) {
  const { t } = useLanguage();

  return (
    <Modal {...props as ModalProps} title={t("feature_not_available")}>
      <p>{t("feature_in_development")}</p>
    </Modal>
  );
}
