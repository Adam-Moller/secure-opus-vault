import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileSpreadsheet, Store, Users, ClipboardList, UserCog } from "lucide-react";
import { toast } from "sonner";
import type { Store as StoreType } from "@/types/store";
import { format } from "date-fns";

interface ExportDataModalProps {
  open: boolean;
  onClose: () => void;
  stores: StoreType[];
}

type ExportType = "stores" | "employees" | "visits" | "hrLogs";

export const ExportDataModal = ({
  open,
  onClose,
  stores,
}: ExportDataModalProps) => {
  const [selectedExports, setSelectedExports] = useState<ExportType[]>([]);

  const toggleExport = (type: ExportType) => {
    setSelectedExports((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const generateCSV = (headers: string[], rows: string[][]): string => {
    const escapeCsv = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const headerLine = headers.map(escapeCsv).join(",");
    const dataLines = rows.map((row) => row.map(escapeCsv).join(","));
    return [headerLine, ...dataLines].join("\n");
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportStores = () => {
    const headers = [
      "Nome",
      "Endereço",
      "Região",
      "Status",
      "Gerente",
      "Telefone Gerente",
      "Email Gerente",
      "Meta Mensal",
      "Vendas Realizadas",
      "% Meta",
      "Funcionários",
      "Última Visita",
      "Próxima Visita",
    ];

    const rows = stores.map((store) => [
      store.nome,
      store.endereco,
      store.regiao,
      store.status,
      store.gerenteNome,
      store.gerenteTelefone,
      store.gerenteEmail,
      store.metaVendasMensal.toString(),
      store.vendasRealizadas.toString(),
      store.metaVendasMensal > 0
        ? ((store.vendasRealizadas / store.metaVendasMensal) * 100).toFixed(1) + "%"
        : "0%",
      store.funcionarios.length.toString(),
      store.ultimaVisitaData || "-",
      store.proximaVisitaData || "-",
    ]);

    const csv = generateCSV(headers, rows);
    downloadFile(csv, `lojas_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const exportEmployees = () => {
    const headers = [
      "Loja",
      "Nome",
      "Cargo",
      "Status",
      "Data Admissão",
      "Telefone",
      "Email",
    ];

    const rows: string[][] = [];
    stores.forEach((store) => {
      store.funcionarios.forEach((emp) => {
        rows.push([
          store.nome,
          emp.nome,
          emp.cargo,
          emp.status,
          emp.dataAdmissao,
          emp.telefone,
          emp.email,
        ]);
      });
    });

    const csv = generateCSV(headers, rows);
    downloadFile(csv, `funcionarios_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const exportVisits = () => {
    const headers = [
      "Loja",
      "Data",
      "Hora Início",
      "Hora Fim",
      "Tipo",
      "Limpeza",
      "Organização",
      "Atendimento",
      "Estoque",
      "Média",
      "Observações Positivas",
      "Problemas Identificados",
      "Pessoas Presentes",
      "Ações Pendentes",
    ];

    const rows: string[][] = [];
    stores.forEach((store) => {
      store.logsVisitas.forEach((visit) => {
        const avg =
          (visit.avaliacoes.limpeza +
            visit.avaliacoes.organizacao +
            visit.avaliacoes.atendimento +
            visit.avaliacoes.estoque) /
          4;
        rows.push([
          store.nome,
          visit.data,
          visit.horaInicio,
          visit.horaFim,
          visit.tipo,
          visit.avaliacoes.limpeza.toString(),
          visit.avaliacoes.organizacao.toString(),
          visit.avaliacoes.atendimento.toString(),
          visit.avaliacoes.estoque.toString(),
          avg.toFixed(1),
          visit.observacoesPositivas,
          visit.problemasIdentificados,
          visit.pessoasPresentes.join("; "),
          visit.acoesPendentes.map((a) => a.descricao).join("; "),
        ]);
      });
    });

    const csv = generateCSV(headers, rows);
    downloadFile(csv, `visitas_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const exportHRLogs = () => {
    const headers = [
      "Loja",
      "Data",
      "Tipo",
      "Funcionário",
      "Descrição",
      "Ações Pendentes",
    ];

    const rows: string[][] = [];
    stores.forEach((store) => {
      store.logsRH.forEach((log) => {
        rows.push([
          store.nome,
          log.data,
          log.tipo,
          log.funcionarioNome,
          log.descricao,
          log.acoesPendentes.map((a) => a.descricao).join("; "),
        ]);
      });
    });

    const csv = generateCSV(headers, rows);
    downloadFile(csv, `logs_rh_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const handleExport = () => {
    if (selectedExports.length === 0) {
      toast.error("Selecione pelo menos um tipo de dado para exportar");
      return;
    }

    let exported = 0;
    if (selectedExports.includes("stores")) {
      exportStores();
      exported++;
    }
    if (selectedExports.includes("employees")) {
      exportEmployees();
      exported++;
    }
    if (selectedExports.includes("visits")) {
      exportVisits();
      exported++;
    }
    if (selectedExports.includes("hrLogs")) {
      exportHRLogs();
      exported++;
    }

    toast.success(`${exported} arquivo(s) exportado(s) com sucesso`);
    onClose();
  };

  const exportOptions = [
    {
      id: "stores" as ExportType,
      label: "Lojas",
      description: `${stores.length} lojas com dados gerais`,
      icon: Store,
    },
    {
      id: "employees" as ExportType,
      label: "Funcionários",
      description: `${stores.reduce((acc, s) => acc + s.funcionarios.length, 0)} funcionários de todas as lojas`,
      icon: Users,
    },
    {
      id: "visits" as ExportType,
      label: "Logs de Visitas",
      description: `${stores.reduce((acc, s) => acc + s.logsVisitas.length, 0)} registros de visitas`,
      icon: ClipboardList,
    },
    {
      id: "hrLogs" as ExportType,
      label: "Logs de RH",
      description: `${stores.reduce((acc, s) => acc + s.logsRH.length, 0)} eventos de RH`,
      icon: UserCog,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Dados
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione os dados que deseja exportar em formato CSV:
          </p>

          <div className="space-y-3">
            {exportOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors cursor-pointer"
                onClick={() => toggleExport(option.id)}
              >
                <Checkbox
                  id={option.id}
                  checked={selectedExports.includes(option.id)}
                  onCheckedChange={() => toggleExport(option.id)}
                />
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={option.id}
                    className="flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <option.icon className="w-4 h-4 text-primary" />
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={selectedExports.length === 0}
              className="flex-1"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
