import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronDown, ChevronUp, Edit, Trash2, ClipboardList, Mail, Phone, User, MapPin, Users, TrendingUp, FileText, History } from "lucide-react";
import type { Store } from "@/types/store";
import { format } from "date-fns";

interface StoreCardProps {
  store: Store;
  onEdit: (store: Store) => void;
  onDelete: (id: string) => void;
  onAddVisit: (store: Store) => void;
  onManageEmployees: (store: Store) => void;
  onAddHRLog: (store: Store) => void;
  onViewHRTimeline: (store: Store) => void;
}

const statusColors: Record<Store["status"], string> = {
  "Operando": "bg-green-500",
  "Reforma": "bg-yellow-500",
  "Fechada Temporariamente": "bg-orange-500",
  "Fechada Definitivamente": "bg-red-500",
};

export const StoreCard = ({ store, onEdit, onDelete, onAddVisit, onManageEmployees, onAddHRLog, onViewHRTimeline }: StoreCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const salesProgress = store.metaVendasMensal > 0 
    ? (store.vendasRealizadas / store.metaVendasMensal) * 100 
    : 0;

  const progressColor = salesProgress >= 100 
    ? "text-green-600" 
    : salesProgress >= 70 
    ? "text-yellow-600" 
    : "text-red-600";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold">{store.nome}</h3>
              <Badge className={statusColors[store.status]}>
                {store.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {store.regiao}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className={`font-medium ${progressColor}`}>
                R$ {store.vendasRealizadas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-muted-foreground">
                / R$ {store.metaVendasMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-xs ${progressColor}`}>
                ({salesProgress.toFixed(0)}%)
              </span>
            </div>
            <Table className="mt-3">
              <TableHeader>
                <TableRow>
                  <TableHead className="h-8 text-xs">Última Visita</TableHead>
                  <TableHead className="h-8 text-xs">Próxima Visita</TableHead>
                  <TableHead className="h-8 text-xs">Funcionários</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="py-2 text-sm">
                    {store.ultimaVisitaData 
                      ? format(new Date(store.ultimaVisitaData), "dd/MM/yyyy")
                      : "Nunca"}
                  </TableCell>
                  <TableCell className="py-2 text-sm">
                    {store.proximaVisitaData
                      ? format(new Date(store.proximaVisitaData), "dd/MM/yyyy")
                      : "Não agendada"}
                  </TableCell>
                  <TableCell className="py-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {store.funcionarios.length}
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="shrink-0 flex items-center justify-center w-8 h-8">
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 border-t pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Gerente
              </h4>
              <div className="text-sm space-y-1 pl-6">
                <p className="font-medium">{store.gerenteNome}</p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  {store.gerenteEmail}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  {store.gerenteTelefone}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localização
              </h4>
              <div className="text-sm space-y-1 pl-6">
                <p className="text-muted-foreground">{store.endereco}</p>
                <p className="text-muted-foreground">Região: {store.regiao}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Equipe</h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onManageEmployees(store);
                }}
              >
                <Users className="w-4 h-4 mr-1" />
                Gerenciar
              </Button>
            </div>
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">
                Total de funcionários: {store.funcionarios.length}
              </p>
              <p className="text-muted-foreground">
                Ativos: {store.funcionarios.filter(f => f.status === "Ativo").length}
              </p>
            </div>
          </div>

          {store.notasGerais && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Notas Gerais</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {store.notasGerais}
              </p>
            </div>
          )}

          {store.logsVisitas.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Últimas Visitas</h4>
              <div className="space-y-2">
                {store.logsVisitas.slice(-3).reverse().map((visit, idx) => (
                  <div key={idx} className="bg-muted/50 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{visit.tipo}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(visit.data), "dd/MM/yyyy")}
                      </span>
                    </div>
                    {visit.problemasIdentificados && (
                      <p className="text-muted-foreground text-xs mt-1">
                        {visit.problemasIdentificados.substring(0, 100)}
                        {visit.problemasIdentificados.length > 100 ? "..." : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" onClick={() => onEdit(store)}>
              <Edit className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Editar</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAddVisit(store)}>
              <ClipboardList className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Nova Visita</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAddHRLog(store)}>
              <FileText className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Evento RH</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => onViewHRTimeline(store)}>
              <History className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Linha RH</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Loja</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esta loja? Esta ação não pode ser desfeita e removerá todos os funcionários, visitas e registros de RH associados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(store.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
