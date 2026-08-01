import Center from "../layout/Center";
import React, { useState, useRef, useEffect, ReactNode } from "react";
import Title from "./Title";
import { AgGridReact } from "ag-grid-react";
import api from "../../lib/api";
import Button from "./Button";
import TooltipButton from "./TooltipButton";
import Input from "./Input";
import {
  themeQuartz,
  iconSetMaterial,
  colorSchemeDark,
} from "ag-grid-community";
import clsx from "clsx";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCopy,
  IconClipboard,
  IconRefresh,
  IconTrash,
  IconFileImport,
  IconEdit,
} from "@tabler/icons-react";
import useKeyPress from "../../utils/useKeyPress";
import Modal from "./Modal";
import Form from "./Form";
import { notify } from "./notify";
import Loader from "./Loader";



const theme = themeQuartz.withPart(colorSchemeDark).withParams({
  accentColor: "#FF764C",
  backgroundColor: "#332c29",
});

/**
 * Composant de bouton stylisé avec infobulle (tooltip) pour la barre d'outils du tableau.
 *
 * @param {Object} props - Les propriétés du composant.
 * @param {string} props.tooltip - Le texte à afficher dans l'infobulle au survol.
 * @param {React.ReactNode} props.children - Le contenu du bouton (généralement une icône).
 * @param {Function} [props.onClick] - Fonction déclenchée au clic sur le bouton.
 * @param {string} [props.className] - Classes CSS additionnelles pour personnaliser le style.
 * @returns {JSX.Element}
 */
export interface ButtonTableProps {
  tooltip: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

function ButtonTable({ tooltip, children, onClick, className }: ButtonTableProps) {
  return (
    <TooltipButton tooltip={tooltip}>
      <div
        className={clsx(
          `bg-back-2 rounded-2xl p-1 transition-transform w-7 h-7 flex items-center justify-center`,
          className,
        )}
        onClick={onClick}
      >
        {children}
      </div>
    </TooltipButton>
  );
}

/**
 * Modale permettant d'ajouter une nouvelle ligne via un formulaire.
 *
 * @param {Object} props - Les propriétés de la modale.
 * @param {Object} props.newRow - Configuration de création d'une nouvelle ligne.
 * @param {Function} [props.newRow.method] - Méthode personnalisée pour gérer la création.
 * @param {string} [props.newRow.route] - Route d'API spécifique pour la création (remplace `fetchUrl`).
 * @param {Object} props.newRow.modal - Configuration du formulaire et de la modale.
 * @param {string} props.newRow.modal.title - Titre de la modale.
 * @param {Array} props.newRow.modal.fields - Les champs du formulaire.
 * @param {boolean} props.showModal - État d'ouverture de la modale.
 * @param {Function} props.setShowModal - Setter pour modifier l'état d'ouverture de la modale.
 * @param {Function} props.reloadTable - Fonction pour recharger les données du tableau après création.
 * @param {string} props.fetchUrl - L'URL de base de l'API (utilisée par défaut si `newRow.route` n'est pas fourni).
 * @returns {JSX.Element}
 */
export interface NewRowModalProps {
  newRow: any;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  reloadTable: () => void;
  fetchUrl?: string;
  [key: string]: any;
}

function NewRowModal({
  newRow,
  showModal,
  setShowModal,
  reloadTable,
  fetchUrl,
  ...props
}: NewRowModalProps) {
  const id = crypto.randomUUID();
  const [loaderBtn, setLoaderBtn] = useState(false);

  return (
    <Modal
      isOpen={showModal}
      btn={{ confirm: { loading: loaderBtn } }}
      onClose={() => setShowModal(false)}
      title={newRow.modal.title}
      {...props}
    >
      <Form
        id={id}
        btn={<Button type="submit">Submit</Button>}
        onSubmit={async (values: any) => {
          setLoaderBtn(true);
          if (!newRow.method) {
            try {
              const res = await api.post(newRow.route || fetchUrl, values);

              if (res?.data?.ok) {
                reloadTable();
                setShowModal(false);
              } else if (res?.data?.msg) {
                notify.error(res.data.msg);
              } else {
                notify.error("Une erreur inconnue est survenue.");
              }
            } catch (err: any) {
              if (err.response?.data?.msg) {
                notify.error(err.response.data.msg);
              } else if (err.message) {
                notify.error(`Erreur réseau ou serveur : ${err.message}`);
              } else {
                notify.error("Une erreur inattendue est survenue.");
              }
            } finally {
              setLoaderBtn(false);
            }
          } else {
            setLoaderBtn(true);
            await newRow.method(values, () => setShowModal(false));
            setLoaderBtn(false);
            reloadTable();
          }
        }}
        fields={newRow.modal.fields}
      />
    </Modal>
  );
}

/**
 * Modale de confirmation pour la suppression automatique de lignes sélectionnées.
 *
 * @param {Object} props - Les propriétés du composant.
 * @param {Array<Object>} props.selectedRows - Les données des lignes actuellement sélectionnées.
 * @param {string} props.fetchUrl - L'URL de l'API pour effectuer la requête DELETE.
 * @param {Function} props.reloadTable - Fonction pour recharger les données après suppression.
 * @param {boolean} props.modalDelete - État d'ouverture de la modale de suppression.
 * @param {Function} props.setModalDelete - Setter pour fermer/ouvrir la modale.
 * @returns {JSX.Element}
 */
export interface DeleteRowModalProps {
  selectedRows: any[];
  fetchUrl?: string;
  reloadTable: () => void;
  modalDelete: boolean;
  setModalDelete: (show: boolean) => void;
}

function DeleteRowModal({
  selectedRows,
  fetchUrl,
  reloadTable,
  modalDelete,
  setModalDelete,
}: DeleteRowModalProps) {
  const [loaderBtnD, setLoaderBtnD] = useState(false);

  const deleteRows = async () => {
    const selectedIds = selectedRows.map((node: any) => node.id);
    setLoaderBtnD(true);
    setTimeout(async () => {
      try {
        const response = await api.delete(fetchUrl || "", {
          data: selectedIds,
        });
        if (response.data.ok) {
          notify.success(response.data.msg);
          reloadTable();
        } else {
          response.data.msg
            ? notify.error(response.data.msg)
            : notify.error("Erreur interne");
        }
      } catch (error) {
        notify.error("Erreur interne");
      }
      setLoaderBtnD(false);
      setModalDelete(false);
    }, 500);
  };

  return (
    <Modal
      title={"Confirmation"}
      btn={{ confirm: { onClick: () => deleteRows(), loading: loaderBtnD } }}
      onClose={() => setModalDelete(false)}
      isOpen={modalDelete}
    >
      <p>
        Etes vous sur de vouloir supprimer {selectedRows.length}{" "}
        {selectedRows.length === 1 ? "ligne" : "lignes"} ?
      </p>
    </Modal>
  );
}

/**
 * @typedef {Object} NewRowConfig
 * @property {string} [route] - Route d'API custom pour le POST. Si non spécifiée, utilise `fetchUrl`.
 * @property {Function} [method] - Fonction personnalisée `(values, closeCallback) => Promise<void>` pour remplacer l'appel API par défaut.
 * @property {Object} [button] - Configuration du bouton déclencheur d'ajout.
 * @property {string} [button.name] - Texte du bouton d'ajout en bas de tableau.
 * @property {Object} modal - Configuration de la modale d'ajout.
 * @property {string} modal.title - Titre de la modale.
 * @property {Array} modal.fields - Liste des champs passés au composant Form.
 */

/**
 * Composant de tableau de données avancé basé sur **AG Grid**.
 * Gère la recherche rapide, la sélection, l'édition de cellules, ainsi que les opérations CRUD via API.
 *
 * @param {Object} props - Les propriétés du tableau.
 * @param {string} [props.fetchUrl] - L'URL de base pour récupérer (GET), modifier (PATCH) ou supprimer (DELETE) des données.
 * @param {Array<Object>} props.colsDefs - Définition des colonnes AG Grid (`ColDef[]`).
 * @param {string} props.title - Titre du tableau affiché dans le header.
 * @param {Object|string} [props.rowSelection] - Configuration de sélection des lignes (ex: `'multiple'` ou `{ mode: 'multiRow' }`).
 * @param {string|number} [props.realodKey] - Clé externe qui force le rechargement des données lorsqu'elle change.
 * @param {boolean} [props.loading=true] - Indique si le tableau est initialement en état de chargement.
 * @param {Function} [props.onSelect] - Callback déclenchée lorsque la sélection de lignes change. Reçoit le tableau des lignes sélectionnées `(selectedRows) => void`.
 * @param {Function} [props.deleteRequest] - Fonction personnalisée de suppression appelée à la place de l'API automatique. Reçoit `(selectedRows) => Promise<void>`.
 * @param {NewRowConfig} [props.newRow] - Configuration pour activer l'ajout de nouvelles lignes via une modale.
 * @param {boolean} [props.deleteRow=false] - Si `true`, gère automatiquement la suppression via une modale de confirmation.
 * @param {Function} [props.openRequest] - Callback déclenchée lors d'un double-clic sur une ligne ou via le bouton d'import/ouverture. Reçoit `(selectedRows) => void`.
 * @param {Function} [props.fetchMethod] - Fonction de récupération de données personnalisée remplaçant l'appel GET par défaut. Doit retourner une Promise avec les données.
 * @param {Function} [props.modifMethod] - Callback personnalisée lors de l'édition d'une cellule remplaçant le PATCH API par défaut. Reçoit les événements AG Grid `(params) => void`.
 * @param {boolean} [props.copyButton=false] - Affiche ou non les boutons de copie/colle dans la barre d'outils.
 * @returns {JSX.Element} Composant Table complet.
 */

export interface TableProps {
  fetchUrl?: string;
  colsDefs: any[];
  title: string;
  rowSelection?: any;
  realodKey?: string | number;
  loading?: boolean;
  onSelect?: (selectedRows: any[]) => void;
  deleteRequest?: (selectedRows: any[]) => Promise<void>;
  newRow?: any;
  deleteRow?: boolean;
  openRequest?: (selectedRows: any[]) => void;
  fetchMethod?: () => Promise<any>;
  modifMethod?: (params: any) => void;
  copyButton?: boolean;
}

export default function Table({
  fetchUrl,
  colsDefs,
  title,
  rowSelection,
  realodKey,
  loading = true,
  onSelect,
  deleteRequest,
  newRow,
  deleteRow,
  openRequest,
  fetchMethod,
  modifMethod,
  copyButton = false,
}: TableProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const gridRef = useRef<any>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [rowData, setRowData] = useState<any>();
  const [quickFilter, setQuickFilter] = useState("");
  const [RotateBtnReload, setRotateBtnReload] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedCell, setSelectedCell] = useState<any>(null);

  useKeyPress("Delete", () => {
    if (selectedRows.length > 0)
      deleteRow ? deleteRowAuto() : deleteRowMethod();
  });

  useEffect(() => {
    setLoadingTable(loading);
  }, [loading]);

  const updateSelectedRows = () => {
    const selectedNodes = gridRef.current?.api?.getSelectedNodes() || [];
    const selectedData = selectedNodes.map((node: any) => node.data);
    setSelectedRows(selectedData);
  };

  const handleCellClicked = (e: any) => {
    setSelectedCell(e);
  };

  const handleCellFocusChanged = (e: any) => {
    if (!e.rowIndex && e.rowIndex !== 0) {
      setSelectedCell(null);
    }
  };

  const handleGridClick = () => {
    setSelectedCell(null);
  };

  useEffect(() => {
    onSelect?.(selectedRows);
  }, [selectedRows]);

  const handleClickBtnReload = () => {
    setRotateBtnReload(false);
    setTimeout(() => {
      setRotateBtnReload(true);
    }, 600);
  };

  const fethData = async () => {
    const res = fetchMethod ? await fetchMethod() : await api.get(fetchUrl || "");
    setRowData(fetchMethod ? res : res.data.data);
    setLoadingTable(false);
  };

  const deleteRowMethod = async () => {
    //setSelectedCell(null);
    if (deleteRow) {
      deleteRowAuto();
    } else {
      setLoadingTable(true);
      await deleteRequest?.(selectedRows);
      await reloadTable();
      setLoadingTable(false);
    }
  };

  const onFilterChanged = (params: any) => {
    const count = params.api.getDisplayedRowCount();

    if (count === 0) {
      params.api.showNoRowsOverlay();
    } else {
      params.api.hideOverlay();
    }
  };

  const reloadTable = async () => {
    setLoadingTable(true);
    handleClickBtnReload();
    setRowData(undefined);
    if (!fetchMethod) {
      const res = await api.get(fetchUrl || "");
      setRowData(res.data.data);
      setLoadingTable(false);
    } else {
      await fethData();
    }
  };

  const deleteRowAuto = () => {
    setModalDelete(true);
  };

  useEffect(() => {
    fethData();
  }, [fetchUrl, realodKey]);

  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.sizeColumnsToFit();
    }
  }, [rowData, quickFilter]);

  useEffect(() => {
    const handlePageClick = (e: any) => {
      const cellClicked = e.target.closest(".ag-cell");

      const toolbarClicked = e.target.closest('[class*="bg-back-2"]');

      if (!cellClicked && !toolbarClicked) {
        setSelectedCell(null);
      }
    };

    document.addEventListener("click", handlePageClick, true);
    return () => document.removeEventListener("click", handlePageClick, true);
  }, []);

  const [colDefs, setColDefs] = useState(colsDefs);

  return (
    <div className="flex flex-col gap-2">
      <Center className="p-5 flex flex-col text-left gap-5">
        <Title>{title}</Title>
        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-1 justify-between">
            <div className="flex flex-1 flex-row items-center gap-2">
              <Input
                variant="secondary"
                className="w-100! py-0.5!"
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
              >
                Rechercher...
              </Input>
              <p
                className={`flex-row flex-1 gap-1  text-left  text-nowrap ${selectedRows.length > 0 ? "flex" : "hidden"}`}
              >
                {selectedRows.length}{" "}
                {selectedRows.length === 1 ? "sélectionné" : "sélectionnés"}
              </p>
            </div>
            <div className="flex flex-row gap-1 items-center">
              <div
                className={`flex-row gap-1 items-center ${selectedRows.length > 0 ? "flex" : "hidden"}`}
              >
                <ButtonTable
                  tooltip="Ouvrir"
                  className={selectedRows.length === 1 ? "flex" : "hidden"}
                  onClick={() => {
                    setSelectedCell(null);
                    openRequest?.(selectedRows);
                  }}
                >
                  <IconFileImport />
                </ButtonTable>
                <ButtonTable
                  tooltip="Supprimer la sélection"
                  onClick={deleteRowMethod}
                >
                  <IconTrash />
                </ButtonTable>
                {copyButton && (
                  <ButtonTable
                    tooltip={"Copié la sélection"}
                    onClick={() => setSelectedCell(null)}
                  >
                    <IconCopy />
                  </ButtonTable>
                )}
              </div>
              <div
                className={`flex-row gap-1 items-center ${selectedCell ? "flex" : "hidden"}`}
              >
                <ButtonTable
                  tooltip="Éditer la cellule"
                  onClick={() => {
                    if (selectedCell) {
                      gridRef.current.api.startEditingCell({
                        rowIndex: selectedCell.rowIndex,
                        colKey: selectedCell.colDef.field,
                      });
                    }
                  }}
                >
                  <IconEdit />
                </ButtonTable>
              </div>
              <div
                className={`h-5 w-0.5 mx-2 rounded-5xl bg-white/20 ${selectedCell || selectedRows.length > 0 ? "flex" : "hidden"}`}
              ></div>
              {copyButton && (
                <ButtonTable
                  tooltip={"Collé la sélection"}
                  onClick={() => setSelectedCell(null)}
                >
                  <IconClipboard />
                </ButtonTable>
              )}
              <ButtonTable
                className={
                  RotateBtnReload ? "-rotate-180 duration-0" : "duration-500"
                }
                tooltip={"Recharger"}
                onClick={() => {
                  setSelectedCell(null);
                  reloadTable();
                }}
              >
                <IconRefresh />
              </ButtonTable>
              <ButtonTable
                tooltip="Annuler"
                onClick={() => {
                  setSelectedCell(null);
                  gridRef.current.api.undoCellEditing();
                }}
              >
                <IconArrowBackUp />
              </ButtonTable>
              <ButtonTable
                tooltip="Rétablir"
                onClick={() => {
                  setSelectedCell(null);
                  gridRef.current.api.redoCellEditing();
                }}
              >
                <IconArrowForwardUp />
              </ButtonTable>
            </div>
          </div>
          <div>
            <div
              className="ag-theme-alpine"
              style={{ width: 1000 }}
              ref={gridContainerRef}
            >
              <AgGridReact
                onFilterChanged={onFilterChanged}
                loadingOverlayComponent={Loader}
                theme={theme}
                onSelectionChanged={updateSelectedRows}
                onCellClicked={handleCellClicked}
                onCellFocused={(e: any) => {
                  if (e.rowIndex !== null && e.rowIndex !== undefined) {
                    const colId = e.column?.getColId?.() || "";
                    setSelectedCell({
                      rowIndex: e.rowIndex,
                      colDef: { field: colId },
                    });
                  } else {
                    setSelectedCell(null);
                  }
                }}
                onRowDoubleClicked={(e: any) => openRequest?.([e.data])}
                ref={gridRef}
                suppressClickEdit={true}
                defaultColDef={{
                  resizable: false,
                }}
                noRowsOverlayComponent={() => <div>Aucun résultat</div>}
                loading={loadingTable}
                domLayout="autoHeight"
                quickFilterText={quickFilter}
                rowSelection={rowSelection}
                undoRedoCellEditing={true}
                onCellValueChanged={async (params: any) => {
                  if (!modifMethod) {
                    const loadingTime = setTimeout(() => {
                      setLoadingTable(true);
                    }, 250);
                    const res = await api.patch(
                      `${fetchUrl}${params.data.id}`,
                      params.data,
                    );
                    clearTimeout(loadingTime);
                    setLoadingTable(false);

                    if (!res.data.ok) {
                      notify.error(res.data.msg);
                      reloadTable();
                    }
                  } else {
                    modifMethod(params);
                  }
                }}
                rowData={rowData}
                columnDefs={colDefs}
                onGridReady={(params: any) => params.api.sizeColumnsToFit()}
              />
            </div>
          </div>
        </div>
      </Center>
      {newRow && (
        <NewRowModal
          fetchUrl={fetchUrl}
          setShowModal={setShowModal}
          showModal={showModal}
          reloadTable={reloadTable}
          newRow={newRow}
          {...newRow.modal}
        />
      )}
      {newRow && (
        <Center>
          <Button onClick={() => setShowModal(true)}>
            {newRow.button?.name || newRow.modal.title}
          </Button>
        </Center>
      )}
      {deleteRow && (
        <DeleteRowModal
          modalDelete={modalDelete}
          setModalDelete={setModalDelete}
          fetchUrl={fetchUrl}
          reloadTable={reloadTable}
          selectedRows={selectedRows}
        />
      )}
    </div>
  );
}
