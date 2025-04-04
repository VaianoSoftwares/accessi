import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import ClientiDataService from "../../services/clienti";
import useError from "../../hooks/useError";

export default function Clienti() {
  const queryClient = useQueryClient();
  const { handleError } = useError();

  const queryClienti = useQuery({
    queryKey: ["clienti"],
    queryFn: async () => {
      try {
        const response = await ClientiDataService.getAll();
        if (response.data.success === false) {
          throw response.data.error;
        }
        console.log("queryClienti | response:", response);
        return response.data.result;
      } catch (e) {
        handleError(e);
        return [];
      }
    },
  });

  const addCliente = useMutation({
    mutationFn: (data: { name: string }) => ClientiDataService.insert(data),
    onSuccess: async (response) => {
      console.log("addCliente | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["clienti"] });
      await queryClient.invalidateQueries({ queryKey: ["postazioni"] });
      clienteRef.current!.value = clienteRef.current!.defaultValue;
    },
    onError: async (err) => handleError(err, "addCliente"),
  });

  const deleteCliente = useMutation({
    mutationFn: (cliente: string) => ClientiDataService.delete(cliente),
    onSuccess: async (response) => {
      console.log("deleteCliente | response:", response);
      await queryClient.invalidateQueries({ queryKey: ["clienti"] });
      await queryClient.invalidateQueries({ queryKey: ["postazioni"] });
    },
    onError: async (err) => handleError(err, "deleteCliente"),
  });

  const clienteRef = useRef<HTMLInputElement>(null);

  return (
    <div className="container-fluid">
      <h2>Menù Clienti</h2>
      <div className="row mb-1">
        <div className="form-floating col-sm-2">
          <input
            type="text"
            className="form-control form-control-sm"
            id="cliente"
            placeholder="cliente"
            autoComplete="off"
            ref={clienteRef}
            defaultValue=""
          />
          <label htmlFor="cliente">cliente</label>
        </div>
        <div className="col-sm-3 align-self-center">
          <button
            onClick={() =>
              addCliente.mutate({
                name: clienteRef.current!.value,
              })
            }
            className="btn btn-success"
          >
            Aggiungi
          </button>
        </div>
        <div className="w-100 mb-3" />
        <div className="list-group list-clienti col-sm-3 clienti-list mx-3">
          {queryClienti.data?.map((cliente) => (
            <div
              id={`list-clienti-entry-${cliente}`}
              className="list-group-item"
              key={cliente}
            >
              <div className="row justify-content-between align-items-center">
                <div className="col-10">
                  <p>{cliente}</p>
                </div>
                <div className="col">
                  <button
                    value={cliente}
                    type="button"
                    className="close btn-del-clienti"
                    aria-label="Close"
                    onClick={(e) => {
                      const confirmed = confirm(
                        "Procede all'eliminazione del cliente?"
                      );
                      if (!confirmed) return;

                      deleteCliente.mutate(e.currentTarget.value);
                    }}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
