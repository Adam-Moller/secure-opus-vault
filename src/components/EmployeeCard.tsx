import { User, Pencil, Trash2, Calendar, Phone, Mail, Award, AlertTriangle, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as LucideIcons from "lucide-react";
import type { Employee, BadgeTemplate } from "@/types/store";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  badgeTemplates?: BadgeTemplate[];
}

const getIcon = (iconName: string) => {
  const iconKey = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[iconKey];
  return IconComponent || LucideIcons.Award;
};

export const EmployeeCard = ({ employee, onEdit, onDelete, badgeTemplates = [] }: EmployeeCardProps) => {
  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "Ativo":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "Afastado":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "Ferias":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "Desligado":
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  const getTipoColor = (tipo: Employee["tipo"]) => {
    switch (tipo) {
      case "Gerente":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20";
      case "Senior":
        return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20";
      case "Consultor":
        return "bg-teal-500/10 text-teal-700 border-teal-500/20";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const employeeBadges = employee.badges
    ?.map(b => badgeTemplates.find(t => t.id === b.badgeTemplateId))
    .filter(Boolean) || [];

  const absencesCount = employee.logAfastamentos?.length || 0;
  const achievementsCount = employee.conquistas?.length || 0;
  
  // Recent absences (last 30 days)
  const recentAbsences = employee.logAfastamentos?.filter(a => {
    const absenceDate = new Date(a.data);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return absenceDate >= thirtyDaysAgo;
  }) || [];
  
  const getAbsenceTypeLabel = (tipo: string) => {
    switch (tipo) {
      case "Falta": return "Falta";
      case "Atestado": return "Atestado";
      case "Afastamento": return "Afastamento";
      case "Licenca": return "Licença";
      default: return tipo;
    }
  };

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{employee.nome}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <Badge className={getTipoColor(employee.tipo)} variant="outline">
                  {employee.tipo === "Senior" ? "Sênior" : employee.tipo}
                </Badge>
                <span className="text-sm text-muted-foreground truncate">{employee.cargo}</span>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(employee.status)} variant="outline">
            {employee.status === "Ferias" ? "Férias" : employee.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="truncate">Admissão: {formatDate(employee.dataAdmissao)}</span>
          </div>
          {employee.telefone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 shrink-0" />
              <span className="truncate">{employee.telefone}</span>
            </div>
          )}
          {employee.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4 shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>
          )}
        </div>

        {/* Badges display */}
        {employeeBadges.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <TooltipProvider>
              {employeeBadges.slice(0, 5).map((template) => {
                if (!template) return null;
                const IconComp = getIcon(template.icone);
                return (
                  <Tooltip key={template.id}>
                    <TooltipTrigger asChild>
                      <div 
                        className="p-1.5 rounded-md cursor-default"
                        style={{ backgroundColor: `${template.cor}20` }}
                      >
                        <IconComp className="w-3.5 h-3.5" style={{ color: template.cor }} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{template.nome}</p>
                      {template.descricao && (
                        <p className="text-xs text-muted-foreground">{template.descricao}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              {employeeBadges.length > 5 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="px-1.5 py-0.5 rounded-md bg-muted text-xs font-medium">
                      +{employeeBadges.length - 5}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{employeeBadges.length - 5} badges adicionais</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        )}

        {/* Indicators row: Observations, Absences, Achievements */}
        {((employee.observacoes?.length || 0) > 0 || absencesCount > 0 || achievementsCount > 0) && (
          <TooltipProvider>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Observations counter */}
              {(employee.observacoes?.length || 0) > 0 && (
                <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  {employee.observacoes.length} {employee.observacoes.length === 1 ? "nota" : "notas"}
                </span>
              )}
              
              {/* Absences indicator */}
              {absencesCount > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                      recentAbsences.length > 0 
                        ? "bg-orange-500/10 text-orange-700" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <AlertTriangle className="w-3 h-3" />
                      <span>{absencesCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{absencesCount} afastamento{absencesCount !== 1 ? "s" : ""}</p>
                    {recentAbsences.length > 0 && (
                      <p className="text-xs text-orange-400">{recentAbsences.length} nos últimos 30 dias</p>
                    )}
                    {recentAbsences.slice(0, 3).map((a, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        • {getAbsenceTypeLabel(a.tipo)}: {a.motivo}
                      </p>
                    ))}
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Achievements indicator */}
              {achievementsCount > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700">
                      <Trophy className="w-3 h-3" />
                      <span>{achievementsCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{achievementsCount} conquista{achievementsCount !== 1 ? "s" : ""}</p>
                    {employee.conquistas?.slice(0, 3).map((c, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        • {c.tipo}: {c.titulo}
                      </p>
                    ))}
                    {achievementsCount > 3 && (
                      <p className="text-xs text-muted-foreground">+{achievementsCount - 3} mais</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(employee)}
            className="flex-1"
          >
            <Pencil className="w-3 h-3 mr-1" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(employee.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
