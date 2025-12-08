import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Store, Users, Calendar, ClipboardList, Building2, 
  Download, TrendingUp, UserSearch, Shield, HardDrive 
} from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Guia do Sistema</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 pb-4">
            <p className="text-muted-foreground">
              Sistema de gestão de lojas e funcionários com armazenamento local criptografado.
            </p>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="stores">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    <span>Gerenciamento de Lojas</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• <strong>Nova Loja:</strong> Cadastre lojas com nome, endereço, gerente, contato e metas de vendas.</p>
                  <p>• <strong>Status:</strong> Ativa, Em Reforma ou Fechada.</p>
                  <p>• <strong>Vendas:</strong> Registre vendas realizadas vs. metas estabelecidas.</p>
                  <p>• <strong>Pesquisa:</strong> Busque por nome, endereço ou gerente.</p>
                  <p>• <strong>Filtros:</strong> Filtre por status da loja.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="employees">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Funcionários</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• <strong>Cadastro:</strong> Nome, cargo, data de admissão, email, telefone.</p>
                  <p>• <strong>Status:</strong> Ativo, Férias, Afastado ou Desligado.</p>
                  <p>• <strong>Avaliações:</strong> Registre avaliações de desempenho (1-5).</p>
                  <p>• <strong>Diretório:</strong> Pesquise funcionários de todas as lojas em um só lugar.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="hrlog">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    <span>Eventos de RH</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• <strong>Tipos:</strong> Admissão, Demissão, Promoção, Treinamento, Avaliação, Advertência, Férias, Afastamento.</p>
                  <p>• <strong>Timeline:</strong> Visualize histórico completo de eventos por funcionário.</p>
                  <p>• <strong>Notas:</strong> Adicione observações detalhadas a cada evento.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="visits">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Visitas e Diário</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• <strong>Registro:</strong> Data, tipo (rotina, auditoria, treinamento, etc.).</p>
                  <p>• <strong>Avaliações:</strong> Limpeza, organização, atendimento e estoque (1-5).</p>
                  <p>• <strong>Observações:</strong> Pontos positivos, problemas encontrados.</p>
                  <p>• <strong>Ações:</strong> Itens de ação com prazos e responsáveis.</p>
                  <p>• <strong>Calendário:</strong> Visualize todas as visitas e eventos em formato de calendário.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="management">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>Hierarquia e Gerência</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• <strong>Níveis:</strong> Adicione níveis hierárquicos ilimitados (+ botão).</p>
                  <p>• <strong>Contatos:</strong> Nome, cargo, email e telefone de cada gestor.</p>
                  <p>• <strong>Interações:</strong> Registre reuniões, ligações, emails com gestores.</p>
                  <p>• <strong>Hub:</strong> Visualize todos os contatos de gerência de todas as lojas.</p>
                  <p>• <strong>Follow-ups:</strong> Acompanhe pendências com cada contato.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="actions">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    <span>Ações Pendentes</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• <strong>Consolidação:</strong> Todas as ações de visitas e RH em um só lugar.</p>
                  <p>• <strong>Filtros:</strong> Por loja, status (pendente/concluído), prioridade.</p>
                  <p>• <strong>Prazos:</strong> Visualize itens atrasados em destaque.</p>
                  <p>• <strong>Conclusão:</strong> Marque ações como concluídas.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="directory">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <UserSearch className="h-4 w-4 text-primary" />
                    <span>Diretório de Funcionários</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• <strong>Busca Global:</strong> Pesquise em todas as lojas simultaneamente.</p>
                  <p>• <strong>Filtros:</strong> Por status, loja e cargo.</p>
                  <p>• <strong>Estatísticas:</strong> Total de funcionários, ativos, em férias, afastados.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="analytics">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>Análises e Relatórios</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• <strong>Funcionários:</strong> Distribuição por tempo de casa, status e cargo.</p>
                  <p>• <strong>Visitas:</strong> Tendências, médias de avaliação, tipos de visita.</p>
                  <p>• <strong>Vendas:</strong> Ranking de lojas por desempenho.</p>
                  <p>• <strong>RH:</strong> Volume de eventos por loja.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="export">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                    <span>Exportação de Dados</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• <strong>Formatos:</strong> Exportação para CSV.</p>
                  <p>• <strong>Dados:</strong> Lojas, funcionários, visitas e eventos de RH.</p>
                  <p>• <strong>Uso:</strong> Backup externo ou análise em planilhas.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="security">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Segurança e Privacidade</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• <strong>Criptografia:</strong> Dados criptografados com AES-GCM.</p>
                  <p>• <strong>Senha:</strong> Cada arquivo tem sua própria senha mestra.</p>
                  <p>• <strong>Local:</strong> Dados ficam apenas no seu dispositivo.</p>
                  <p>• <strong>Offline:</strong> Funciona 100% sem internet.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="storage">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-primary" />
                    <span>Armazenamento</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• <strong>Desktop:</strong> Arquivos salvos diretamente no sistema de arquivos.</p>
                  <p>• <strong>Mobile:</strong> Dados no IndexedDB do navegador.</p>
                  <p>• <strong>Auto-save:</strong> Salvamento automático a cada alteração (2s delay).</p>
                  <p>• <strong>Backup:</strong> Exporte manualmente para backup externo.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Dicas Rápidas</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Clique no card da loja para expandir/recolher detalhes</li>
                <li>• Use o Dashboard para visão geral de todas as lojas</li>
                <li>• Verifique Ações Pendentes regularmente</li>
                <li>• Exporte dados periodicamente como backup</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;
