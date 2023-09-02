import { useEffect, useRef, useState } from "react";
import dateFormat from "dateformat";
import "./index.css";
import BadgeDataService from "../../services/badge";
import BadgeTable from "../BadgeTable";
import Clock from "../Clock";
import FormButtons from "../FormButtons";
import OspitiPopup from "../OspitiPopup";
import {
  TUser,
  TInStruttTableContent,
  TBadgeFormState,
  TPostazione,
  STATI_BADGE,
  TBadgeResp,
  TBadgeStato,
  TBadgeTipo,
  TDOCS,
  TIPI_BADGE,
  TTDoc,
  TInStruttDataReq,
  TAssegnazione,
  TTimbraResp,
  TimbraDoc,
} from "../../types";
import { axiosErrHandl } from "../../utils/axiosErrHandl";
import { TableContentMapper } from "../../utils/tableContentMapper";
import useBool from "../../hooks/useBool";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useImage from "../../hooks/useImage";
import useReadonlyForm from "../../hooks/useReadonlyForm";
import { toast } from "react-hot-toast";

export default function Badge({
  scannedValue,
  clearScannedValue,
  currPostazione,
  user,
  ...props
}: {
  user: TUser;
  scannedValue: string;
  clearScannedValue: () => void;
  tipoBadge: TBadgeTipo;
  currPostazione: TPostazione | undefined;
}) {
  const barcodeRef = useRef<HTMLInputElement>(null);
  const descrizioneRef = useRef<HTMLInputElement>(null);
  const tipoRef = useRef<HTMLSelectElement>(null);
  const assegnazioneRef = useRef<HTMLSelectElement>(null);
  const statoRef = useRef<HTMLSelectElement>(null);
  const ubicazioneRef = useRef<HTMLInputElement>(null);
  const clienteRef = useRef<HTMLSelectElement>(null);
  const nomeRef = useRef<HTMLInputElement>(null);
  const cognomeRef = useRef<HTMLInputElement>(null);
  const telefonoRef = useRef<HTMLInputElement>(null);
  const dittaRef = useRef<HTMLInputElement>(null);
  const tdocRef = useRef<HTMLSelectElement>(null);
  const ndocRef = useRef<HTMLInputElement>(null);
  const pfpRef = useRef<HTMLInputElement>(null);
  const scadenzaRef = useRef<HTMLInputElement>(null);
  const targa1Ref = useRef<HTMLInputElement>(null);
  const targa2Ref = useRef<HTMLInputElement>(null);
  const targa3Ref = useRef<HTMLInputElement>(null);
  const targa4Ref = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const assegnazioni = useQuery({
    queryKey: ["assegnazioni"],
    queryFn: () =>
      BadgeDataService.getAssegnazioni().then((response) => {
        console.log("queryAssegnazioni | response:", response);
        const result = response.data.data as TAssegnazione[];
        return result;
      }),
  });

  const clienti = useQuery({
    queryKey: ["clienti"],
    queryFn: () =>
      BadgeDataService.getClienti().then((response) => {
        console.log("queryClienti | response:", response);
        const result = response.data.data as string[];
        return result;
      }),
  });

  const queryInStrutt = useQuery({
    queryKey: [
      "inStrutt",
      {
        tipi: [props.tipoBadge, "PROVVISORIO"],
        postazioniIds: currPostazione
          ? [currPostazione?._id]
          : user.admin
          ? undefined
          : user.postazioni,
      },
    ],
    queryFn: (context) =>
      BadgeDataService.getInStrutt(
        context.queryKey[1] as TInStruttDataReq
      ).then((response) => {
        console.log("queryInStrutt | response:", response);
        const result = response.data.data as TInStruttTableContent[];
        TableContentMapper.parseDate(result);
        return result;
      }),
  });

  const mutateInStrutt = useMutation({
    mutationFn: (data: TimbraDoc) => BadgeDataService.timbra(data),
    onSuccess: async (response) => {
      console.log("timbra | response:", response);

      if (timeoutRunning.current === true) return;
      timeoutRunning.current = true;

      await queryClient.invalidateQueries({ queryKey: ["inStrutt"] });

      const rowTimbra = response.data.data as TTimbraResp;

      if (response.data.msg.includes("Esce")) setDeletedRow(rowTimbra.timbra);
      else setDeletedRow(undefined);

      if (readonlyForm === true) {
        setForm(TableContentMapper.mapToAutoComplBadge(rowTimbra.badge));

        updateImage(rowTimbra.timbra.codice);
      }

      const badgeTable = document.getElementById("badge-table");
      const firstRow = badgeTable
        ? (badgeTable as HTMLTableElement).tBodies[0].rows[0]
        : null;
      if (firstRow) {
        switch (response.data.msg) {
          case "Timbra Entra":
            firstRow.style.backgroundColor = "green";
            break;
          case "Timbra Esce":
            firstRow.style.backgroundColor = "red";
            break;
        }
      }

      setTimeout(() => {
        if (firstRow) firstRow.style.backgroundColor = "white";
        if (readonlyForm === true) {
          clearForm();
          setNoImage();
        }

        setDeletedRow(undefined);
      }, 1000);
    },
    onError: async (err) => {
      setDeletedRow(undefined);
      axiosErrHandl(err, "timbra");
    },
    onSettled: async () => (timeoutRunning.current = false),
  });

  const [deletedRow, setDeletedRow] = useState<TInStruttTableContent>();
  const [isShown, setIsShown] = useBool(false);
  const [readonlyForm, setReadonlyForm] = useReadonlyForm((condition) => {
    refreshPage({
      image: condition,
      form: condition,
      refetch: false,
    });
    console.log("home | readonlyForm:", condition);
  });
  const timeoutRunning = useRef(false);

  const [pfpUrl, { updateImage, setNoImage }] = useImage((data) =>
    data ? `/api/v1/public/foto-profilo/USER_${data}.jpg` : ""
  );

  function createFormData() {
    const formData = new FormData();
    barcodeRef.current?.value &&
      formData.append("barcode", barcodeRef.current.value);
    descrizioneRef.current?.value &&
      formData.append("descrizione", descrizioneRef.current!.value);
    tipoRef.current?.value && formData.append("tipo", tipoRef.current.value);
    assegnazioneRef.current?.value &&
      formData.append("assegnazione", assegnazioneRef.current.value);
    statoRef.current?.value && formData.append("stato", statoRef.current.value);
    ubicazioneRef.current?.value &&
      formData.append("ubicazione", ubicazioneRef.current.value);
    clienteRef.current?.value &&
      formData.append("cliente", clienteRef.current.value);
    nomeRef.current?.value && formData.append("nome", nomeRef.current.value);
    cognomeRef.current?.value &&
      formData.append("cognome", cognomeRef.current.value);
    telefonoRef.current?.value &&
      formData.append("telefono", telefonoRef.current.value);
    dittaRef.current?.value && formData.append("ditta", dittaRef.current.value);
    tdocRef.current?.value && formData.append("tdoc", tdocRef.current.value);
    ndocRef.current?.value && formData.append("ndoc", ndocRef.current.value);
    pfpRef.current?.files?.item(0) &&
      formData.append("pfp", pfpRef.current.files.item(0)!);
    scadenzaRef.current?.value &&
      formData.append("scadenza", scadenzaRef.current.value);
    targa1Ref.current?.value &&
      formData.append("targa1", targa1Ref.current.value);
    targa2Ref.current?.value &&
      formData.append("targa2", targa2Ref.current.value);
    targa3Ref.current?.value &&
      formData.append("targa3", targa3Ref.current.value);
    targa4Ref.current?.value &&
      formData.append("targa4", targa4Ref.current.value);
    return formData;
  }

  function setForm(obj?: TBadgeFormState) {
    barcodeRef.current!.value =
      obj?.barcode || barcodeRef.current!.defaultValue;
    descrizioneRef.current!.value =
      obj?.descrizione || descrizioneRef.current!.defaultValue;
    tipoRef.current!.value =
      obj?.tipo || tipoRef.current!.options.item(0)!.value;
    assegnazioneRef.current!.value =
      obj?.assegnazione || assegnazioneRef.current!.options.item(0)!.value;
    statoRef.current!.value =
      obj?.stato || statoRef.current!.options.item(0)!.value;
    ubicazioneRef.current!.value =
      obj?.ubicazione || ubicazioneRef.current!.defaultValue;
    clienteRef.current!.value =
      obj?.stato || clienteRef.current!.options.item(0)!.value;
    nomeRef.current!.value = obj?.nome || nomeRef.current!.defaultValue;
    cognomeRef.current!.value =
      obj?.cognome || cognomeRef.current!.defaultValue;
    telefonoRef.current!.value =
      obj?.telefono || telefonoRef.current!.defaultValue;
    dittaRef.current!.value = obj?.ditta || dittaRef.current!.defaultValue;
    tdocRef.current!.value =
      obj?.tdoc || tdocRef.current!.options.item(0)!.value;
    ndocRef.current!.value = obj?.ndoc || ndocRef.current!.defaultValue;
    pfpRef.current!.files = null;
    pfpRef.current!.value = pfpRef.current!.defaultValue;
    scadenzaRef.current &&
      (scadenzaRef.current!.value =
        obj?.scadenza || scadenzaRef.current!.defaultValue);
    targa1Ref.current &&
      (targa1Ref.current.value = obj?.targa1 || targa1Ref.current.defaultValue);
    targa2Ref.current &&
      (targa2Ref.current.value = obj?.targa2 || targa2Ref.current.defaultValue);
    targa3Ref.current &&
      (targa3Ref.current.value = obj?.targa3 || targa3Ref.current.defaultValue);
    targa4Ref.current &&
      (targa4Ref.current.value = obj?.targa4 || targa4Ref.current.defaultValue);
  }

  function clearForm() {
    setForm();
  }

  function formToObj(): TBadgeFormState {
    return {
      barcode: barcodeRef.current?.value || undefined,
      descrizione: descrizioneRef.current?.value || undefined,
      tipo: (tipoRef.current?.value as TBadgeTipo) || undefined,
      assegnazione: assegnazioneRef.current?.value || undefined,
      stato: (statoRef.current?.value as TBadgeStato) || undefined,
      ubicazione: ubicazioneRef.current?.value || undefined,
      cliente: clienteRef.current?.value || undefined,
      nome: nomeRef.current?.value || undefined,
      cognome: cognomeRef.current?.value || undefined,
      telefono: telefonoRef.current?.value || undefined,
      ditta: dittaRef.current?.value || undefined,
      tdoc: (tdocRef.current?.value as TTDoc) || undefined,
      ndoc: ndocRef.current?.value || undefined,
      pfp: pfpRef.current?.value || undefined,
      scadenza: scadenzaRef.current?.value || undefined,
      targa1: targa1Ref.current?.value || undefined,
      targa2: targa2Ref.current?.value || undefined,
      targa3: targa3Ref.current?.value || undefined,
      targa4: targa4Ref.current?.value || undefined,
    };
  }

  const findBadges = useQuery({
    queryKey: ["badges", formToObj()],
    queryFn: async (context) => {
      const response = await BadgeDataService.find({
        ...(context.queryKey[1] as TBadgeFormState),
        pfp: "",
        postazione: "",
      });
      console.log("findBadges | response:", response);

      const result = response.data.data as TBadgeResp[];

      if (result.length === 1) {
        setForm(TableContentMapper.mapToAutoComplBadge(result[0]));

        updateImage(result[0].barcode);
      }

      return TableContentMapper.mapBadgesToTableContent(result);
    },
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const insertBadge = useMutation({
    mutationFn: (data: FormData) => BadgeDataService.insertBadge(data),
    onSuccess: async (response) => {
      console.log("insertBadge | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["badges"] });
      await queryClient.invalidateQueries({ queryKey: ["inStrutt"] });
      toast.success(response.data.msg);
    },
    onError: async (err) => axiosErrHandl(err, "insertBadge"),
    onSettled: async () => refreshPage({ image: false, refetch: false }),
  });

  const updateBadge = useMutation({
    mutationFn: (data: FormData) => BadgeDataService.updateBadge(data),
    onSuccess: async (response) => {
      console.log("updateBadge | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["badges"] });
      await queryClient.invalidateQueries({ queryKey: ["inStrutt"] });
      toast.success(response.data.msg);
    },
    onError: async (err) => axiosErrHandl(err, "updateBadge"),
    onSettled: async () => refreshPage({ image: false, refetch: false }),
  });

  const deleteBadge = useMutation({
    mutationFn: (data: string) => BadgeDataService.deleteBadge(data),
    onSuccess: async (response) => {
      console.log("deleteBadge | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["badges"] });
      await queryClient.invalidateQueries({ queryKey: ["inStrutt"] });
      toast.success(response.data.msg);
    },
    onError: async (err) => axiosErrHandl(err, "deleteBadge"),
    onSettled: async () => refreshPage({ image: false, refetch: false }),
  });

  function refreshPage({ form = true, image = true, refetch = true }) {
    form && clearForm();
    image && setNoImage();
    refetch && queryInStrutt.refetch();
  }

  useEffect(() => {
    if (!scannedValue || !currPostazione) return;

    console.log("Scanner accessi | scannedValue:", scannedValue);
    mutateInStrutt.mutate({
      barcode: scannedValue,
      postazione: currPostazione._id,
    });
    clearScannedValue();
  }, [scannedValue]);

  return (
    <div id="home-wrapper">
      <div className="container-fluid mb-1 home-container">
        <div className="row mt-2 justify-content-start align-items-start submit-form">
          <div className="col-8 badge-form">
            <div className="row mb-2">
              <div className="form-floating col-sm-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="barcode"
                  placeholder="barcode"
                  autoComplete="off"
                  ref={barcodeRef}
                  defaultValue=""
                />
                <label htmlFor="barcode">barcode</label>
              </div>
              <div className="form-floating col-sm-5">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="descrizione"
                  placeholder="descrizione"
                  readOnly={readonlyForm === true}
                  autoComplete="off"
                  ref={descrizioneRef}
                  defaultValue=""
                />
                <label htmlFor="descrizione">descrizione</label>
              </div>
              <div className="w-100"></div>
              <div className="form-floating col-sm-2">
                <select
                  className="form-select form-select-sm"
                  id="tipo"
                  placeholder="tipo"
                  ref={tipoRef}
                  defaultValue={props.tipoBadge}
                >
                  {TIPI_BADGE.map((tipo, index) => (
                    <option
                      value={tipo}
                      key={index}
                      disabled={readonlyForm === true}
                    >
                      {tipo}
                    </option>
                  ))}
                  <option value="" key="-1" disabled={readonlyForm === true} />
                </select>
                <label htmlFor="tipo">tipo</label>
              </div>
              <div className="form-floating col-sm-2">
                <select
                  className="form-select form-select-sm"
                  id="assegnazione"
                  placeholder="assegnazione"
                  ref={assegnazioneRef}
                  defaultValue=""
                >
                  <option value="" key="-1" disabled={readonlyForm === true} />
                  {assegnazioni.data
                    ?.filter(({ name }) => name)
                    .map(({ name }, index) => (
                      <option
                        value={name}
                        key={index}
                        disabled={readonlyForm === true}
                      >
                        {name}
                      </option>
                    ))}
                </select>
                <label htmlFor="assegnazione">assegnazione</label>
              </div>
              <div className="w-100" />
              <div className="form-floating col-sm-2">
                <select
                  className="form-select form-select-sm"
                  id="stato"
                  placeholder="stato"
                  ref={statoRef}
                  defaultValue=""
                >
                  <option value="" key="-1" disabled={readonlyForm === true} />
                  {STATI_BADGE.map((stato, index) => (
                    <option
                      value={stato}
                      key={index}
                      disabled={readonlyForm === true}
                    >
                      {stato}
                    </option>
                  ))}
                </select>
                <label htmlFor="stato">stato</label>
              </div>
              <div className="form-floating col-sm-5">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="ubicazione"
                  placeholder="ubicazione"
                  readOnly={readonlyForm === true}
                  autoComplete="off"
                  ref={ubicazioneRef}
                  defaultValue=""
                />
                <label htmlFor="ubicazione">ubicazione</label>
              </div>
              <div className="w-100" />
              {clienti.isSuccess && (
                <div className="form-floating col-sm-2">
                  <select
                    className="form-select form-select-sm"
                    id="cliente"
                    placeholder="cliente"
                    ref={clienteRef}
                    defaultValue=""
                  >
                    <option
                      value=""
                      key="-1"
                      disabled={readonlyForm === true}
                    />
                    {clienti.data.map((cliente) => (
                      <option
                        value={cliente}
                        key={cliente}
                        disabled={readonlyForm === true}
                      >
                        {cliente}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="cliente">cliente</label>
                </div>
              )}
            </div>
            <div className="row mt-2">
              <div className="col-2">
                <div
                  className="pfp-container"
                  style={{
                    backgroundImage: `url(${pfpUrl})`,
                  }}
                />
                <div className="input-group input-group-sm">
                  <input
                    accept="image/*"
                    type="file"
                    className="custom-file-input"
                    id="pfp"
                    disabled={readonlyForm === true || user.admin === false}
                    autoComplete="off"
                    ref={pfpRef}
                    defaultValue=""
                    onChange={(e) => {
                      const file = e.target.files?.item(0);
                      if (file) updateImage(file);
                      else setNoImage();
                    }}
                  />
                </div>
              </div>
              <div className="col-10">
                <div className="row">
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="nome"
                      placeholder="nome"
                      readOnly={readonlyForm === true}
                      autoComplete="off"
                      ref={nomeRef}
                      defaultValue=""
                    />
                    <label htmlFor="nome">nome</label>
                  </div>
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="cognome"
                      placeholder="cognome"
                      readOnly={readonlyForm === true}
                      autoComplete="off"
                      ref={cognomeRef}
                      defaultValue=""
                    />
                    <label htmlFor="cognome">cognome</label>
                  </div>
                  <div className="w-100" />
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="ditta"
                      placeholder="ditta"
                      readOnly={readonlyForm === true}
                      autoComplete="off"
                      ref={dittaRef}
                      defaultValue=""
                    />
                    <label htmlFor="ditta">ditta</label>
                  </div>
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="telefono"
                      placeholder="telefono"
                      readOnly={readonlyForm === true}
                      autoComplete="off"
                      ref={telefonoRef}
                      defaultValue=""
                    />
                    <label htmlFor="telefono">telefono</label>
                  </div>
                  <div className="w-100" />
                  <div className="form-floating col-sm-3">
                    <select
                      className="form-select form-select-sm"
                      id="tdoc"
                      placeholder="tipo documento"
                      ref={tdocRef}
                      defaultValue=""
                    >
                      <option
                        value=""
                        key="-1"
                        disabled={readonlyForm === true}
                      />
                      {TDOCS.filter((tipoDoc) => tipoDoc).map(
                        (tipoDoc, index) => (
                          <option
                            value={tipoDoc}
                            key={index}
                            disabled={readonlyForm === true}
                          >
                            {tipoDoc}
                          </option>
                        )
                      )}
                    </select>
                    <label htmlFor="tdoc">tipo documento</label>
                  </div>
                  <div className="form-floating col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="ndoc"
                      placeholder="num documento"
                      readOnly={readonlyForm === true}
                      autoComplete="off"
                      ref={ndocRef}
                      defaultValue=""
                    />
                    <label htmlFor="ndoc">num documento</label>
                  </div>
                  <div className="w-100" />
                  {props.tipoBadge === "BADGE" ? (
                    <>
                      <div className="form-floating col-sm-3">
                        <input
                          type="date"
                          min={dateFormat(new Date(), "yyyy-mm-dd")}
                          className="form-control form-control-sm"
                          id="scadenza"
                          readOnly={
                            readonlyForm === true || user.admin === false
                          }
                          autoComplete="off"
                          ref={scadenzaRef}
                          defaultValue=""
                        />
                        <label htmlFor="scadenza">scadenza</label>
                      </div>
                      <div className="w-100" />
                    </>
                  ) : (
                    props.tipoBadge === "VEICOLO" && (
                      <>
                        <div className="form-floating col-sm-3">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            id="targa1"
                            placeholder="targa1"
                            readOnly={readonlyForm === true}
                            autoComplete="off"
                            ref={targa1Ref}
                            defaultValue=""
                          />
                          <label htmlFor="targa1">targa1</label>
                        </div>
                        <div className="form-floating col-sm-3">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            id="targa2"
                            placeholder="targa2"
                            readOnly={readonlyForm === true}
                            ref={targa2Ref}
                            defaultValue=""
                          />
                          <label htmlFor="targa2">targa2</label>
                        </div>
                        <div className="w-100" />
                        <div className="form-floating col-sm-3">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            id="targa3"
                            placeholder="targa3"
                            readOnly={readonlyForm === true}
                            autoComplete="off"
                            ref={targa3Ref}
                            defaultValue=""
                          />
                          <label htmlFor="targa3">targa3</label>
                        </div>
                        <div className="form-floating col-sm-3">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            id="targa4"
                            placeholder="targa4"
                            readOnly={readonlyForm === true}
                            autoComplete="off"
                            ref={targa4Ref}
                            defaultValue=""
                          />
                          <label htmlFor="targa4">targa4</label>
                        </div>
                      </>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          <FormButtons
            findBadges={() => findBadges.refetch()}
            timbra={() => {
              if (!currPostazione) {
                toast.error("Campo Postazione mancante");
                return;
              }

              mutateInStrutt.mutate({
                barcode: barcodeRef.current!.value,
                postazione: currPostazione._id,
              });
            }}
            insertBadge={() => insertBadge.mutate(createFormData())}
            updateBadge={() => {
              const confirmed = window.confirm(
                "Procedere alla modifica del badge?"
              );
              if (!confirmed) return;
              updateBadge.mutate(createFormData());
            }}
            deleteBadge={() => {
              const confirmed = window.confirm(
                "Procedere alla rimozione del badge?"
              );
              if (!confirmed) return;
              deleteBadge.mutate(barcodeRef.current!.value);
            }}
            openPopup={setIsShown.setTrue}
            readonlyForm={readonlyForm}
            toggleReadOnlyForm={setReadonlyForm.setToggle}
            admin={user.admin}
            excel={user.excel}
            provvisori={user.provvisori}
            badges={findBadges.data || []}
          />
          <div className="col-4">
            <Clock />
          </div>
          <div className="in-strutt-count">
            <b># in struttura:</b> {queryInStrutt.data?.length || 0}
          </div>
        </div>
      </div>
      <OspitiPopup
        isShown={isShown}
        closePopup={setIsShown.setFalse}
        insertOsp={insertBadge.mutate}
        isVeicolo={props.tipoBadge === "VEICOLO"}
      />
      <div className="badge-table-wrapper">
        {queryInStrutt.isSuccess && (
          <BadgeTable
            content={
              deletedRow
                ? [deletedRow, ...queryInStrutt.data]
                : queryInStrutt.data
            }
            tableId="badge-table"
            omitedParams={["_id", "id"]}
            // obfuscatedParams={
            //   props.user.admin === true ? undefined : ["codice", "entrata"]
            // }
          />
        )}
      </div>
    </div>
  );
}
