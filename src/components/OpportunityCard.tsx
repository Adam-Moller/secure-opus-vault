import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronDown, ChevronUp, Edit, Trash2, MessageSquarePlus, Mail, Phone, User } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import { format } from "date-fns";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onEdit: (opportunity: Opportunity) => void;
  onDelete: (id: string) => void;
  onAddInteraction: (opportunity: Opportunity) => void;
}

const statusColors: Record<Opportunity["status"], string> = {
  Lead: "bg-slate-500",
  Qualificado: "bg-blue-500",
  Proposta: "bg-yellow-500",
  Negociação: "bg-orange-500",
  Fechado: "bg-green-500",
  Perdido: "bg-red-500",
};

export const OpportunityCard = ({ opportunity, onEdit, onDelete, onAddInteraction }: OpportunityCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold">{opportunity.nomeEmpresa}</h3>
              <Badge className={statusColors[opportunity.status]}>
                {opportunity.status}
              </Badge>
            </div>
            <div className="text-sm">
              <span className="font-medium text-foreground">
                R$ {opportunity.valorPotencial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <Table className="mt-3">
              <TableHeader>
                <TableRow>
                  <TableHead className="h-8 text-xs">Primeiro Contato</TableHead>
                  <TableHead className="h-8 text-xs">Último Contato</TableHead>
                  <TableHead className="h-8 text-xs">Próximo Contato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="py-2 text-sm">
                    {format(new Date(opportunity.primeiroContatoData), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="py-2 text-sm">
                    {format(new Date(opportunity.ultimoContatoData), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="py-2 text-sm">
                    {format(new Date(opportunity.proximoContatoData), "dd/MM/yyyy")}
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
                Contato Principal
              </h4>
              <div className="text-sm space-y-1 pl-6">
                <p className="font-medium">{opportunity.contatoPrincipal.nome}</p>
                <p className="text-muted-foreground">{opportunity.contatoPrincipal.cargo}</p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  {opportunity.contatoPrincipal.email}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  {opportunity.contatoPrincipal.telefone}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Informações</h4>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  Criado em: {format(new Date(opportunity.dataCriacao), "dd/MM/yyyy")}
                </p>
              </div>
            </div>
          </div>

          {opportunity.notasGerais && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Notas Gerais</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {opportunity.notasGerais}
              </p>
            </div>
          )}

          {opportunity.historicoInteracoes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Histórico de Interações</h4>
              <div className="space-y-2">
                {opportunity.historicoInteracoes.map((interaction, idx) => (
                  <div key={idx} className="bg-muted/50 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{interaction.tipo}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(interaction.data), "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{interaction.resumo}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" onClick={() => onEdit(opportunity)}>
              <Edit className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Editar</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAddInteraction(opportunity)}>
              <MessageSquarePlus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Nova Interação</span>
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
                  <AlertDialogTitle>Excluir Oportunidade</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esta oportunidade? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(opportunity.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
