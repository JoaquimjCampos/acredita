"""
Módulo Central MCP (Model Context Protocol) para o Sistema Acredita
Responsável pela comunicação estruturada entre frontend e backend
Comunicação formal em português angolano
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)


class MCPMessage:
    """Classe base para mensagens MCP do Sistema Acredita"""
    
    def __init__(self, message_type: str, content: Any, metadata: Optional[Dict] = None):
        self.id = self._generate_message_id()
        self.type = message_type
        self.content = content
        self.metadata = metadata or {}
        self.timestamp = datetime.now().isoformat()
        self.language = "pt-AO"  # Português de Angola
    
    def _generate_message_id(self) -> str:
        """Gera identificador único para a mensagem"""
        return f"acredita_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
    
    def to_dict(self) -> Dict:
        """Converte mensagem para dicionário"""
        return {
            "id": self.id,
            "type": self.type,
            "content": self.content,
            "metadata": self.metadata,
            "timestamp": self.timestamp,
            "language": self.language
        }
    
    def to_json(self) -> str:
        """Converte mensagem para JSON"""
        return json.dumps(self.to_dict(), ensure_ascii=False)


class MCPProtocol:
    """Protocolo MCP para comunicação formal do Sistema Acredita"""
    
    # Tipos de mensagem do sistema
    MESSAGE_TYPES = {
        'PARTICIPANT_REGISTRATION': 'registo_participante',
        'VOTING_SUBMISSION': 'submissao_voto',
        'DONATION_PROCESSING': 'processamento_doacao',
        'CONTENT_ACCESS': 'acesso_conteudo',
        'SEASON_MANAGEMENT': 'gestao_temporada',
        'NOTIFICATION': 'notificacao',
        'ERROR': 'erro',
        'SUCCESS': 'sucesso'
    }
    
    # Códigos de estado formais
    STATUS_CODES = {
        'PENDING': 'pendente',
        'APPROVED': 'aprovado',
        'REJECTED': 'rejeitado',
        'PROCESSING': 'em_processamento',
        'COMPLETED': 'concluido',
        'CANCELLED': 'cancelado'
    }
    
    @staticmethod
    def create_participant_message(participant_data: Dict) -> MCPMessage:
        """Cria mensagem formal para registo de participante"""
        content = {
            "accao": "Solicitação de Inscrição no Programa Acredita",
            "dados_participante": participant_data,
            "status": MCPProtocol.STATUS_CODES['PENDING'],
            "mensagem_formal": "Excelência, foi submetida uma nova candidatura ao programa."
        }
        return MCPMessage(
            message_type=MCPProtocol.MESSAGE_TYPES['PARTICIPANT_REGISTRATION'],
            content=content,
            metadata={"origem": "portal_inscricoes", "prioridade": "alta"}
        )
    
    @staticmethod
    def create_voting_message(voting_data: Dict) -> MCPMessage:
        """Cria mensagem formal para submissão de voto"""
        content = {
            "accao": "Registo de Voto do Público",
            "dados_voto": voting_data,
            "status": MCPProtocol.STATUS_CODES['PROCESSING'],
            "mensagem_formal": "Voto registado com sucesso no sistema de votação pública."
        }
        return MCPMessage(
            message_type=MCPProtocol.MESSAGE_TYPES['VOTING_SUBMISSION'],
            content=content,
            metadata={"origem": "portal_votacao", "prioridade": "media"}
        )
    
    @staticmethod
    def create_donation_message(donation_data: Dict) -> MCPMessage:
        """Cria mensagem formal para processamento de doação"""
        content = {
            "accao": "Processamento de Contribuição Financeira",
            "dados_doacao": donation_data,
            "status": MCPProtocol.STATUS_CODES['PROCESSING'],
            "mensagem_formal": "Contribuição financeira em processamento via sistema de crowdfunding."
        }
        return MCPMessage(
            message_type=MCPProtocol.MESSAGE_TYPES['DONATION_PROCESSING'],
            content=content,
            metadata={"origem": "portal_doacoes", "prioridade": "alta"}
        )
    
    @staticmethod
    def create_notification_message(notification_data: Dict) -> MCPMessage:
        """Cria mensagem de notificação formal"""
        content = {
            "accao": "Notificação do Sistema",
            "dados_notificacao": notification_data,
            "status": MCPProtocol.STATUS_CODES['PENDING'],
            "mensagem_formal": notification_data.get('mensagem', 'Notificação do sistema.')
        }
        return MCPMessage(
            message_type=MCPProtocol.MESSAGE_TYPES['NOTIFICATION'],
            content=content,
            metadata={"origem": "sistema", "prioridade": "baixa"}
        )
    
    @staticmethod
    def create_error_message(error_data: Dict) -> MCPMessage:
        """Cria mensagem formal de erro"""
        content = {
            "accao": "Notificação de Erro do Sistema",
            "dados_erro": error_data,
            "status": MCPProtocol.STATUS_CODES['REJECTED'],
            "mensagem_formal": f"Erro detectado: {error_data.get('descricao', 'Erro não especificado')}"
        }
        return MCPMessage(
            message_type=MCPProtocol.MESSAGE_TYPES['ERROR'],
            content=content,
            metadata={"origem": "sistema", "prioridade": "critica"}
        )


class MCPHandler:
    """Gestor central de mensagens MCP do Sistema Acredita"""
    
    def __init__(self):
        self.message_queue = []
        self.handlers = {}
        self._register_default_handlers()
    
    def _register_default_handlers(self):
        """Regista gestores padrão para tipos de mensagem"""
        self.handlers[MCPProtocol.MESSAGE_TYPES['PARTICIPANT_REGISTRATION']] = self._handle_participant_registration
        self.handlers[MCPProtocol.MESSAGE_TYPES['VOTING_SUBMISSION']] = self._handle_voting_submission
        self.handlers[MCPProtocol.MESSAGE_TYPES['DONATION_PROCESSING']] = self._handle_donation_processing
        self.handlers[MCPProtocol.MESSAGE_TYPES['NOTIFICATION']] = self._handle_notification
        self.handlers[MCPProtocol.MESSAGE_TYPES['ERROR']] = self._handle_error
    
    def process_message(self, message: MCPMessage) -> Dict:
        """Processa mensagem MCP através do gestor apropriado"""
        try:
            if message.type in self.handlers:
                result = self.handlers[message.type](message)
                logger.info(f"Mensagem MCP processada: {message.id}")
                return result
            else:
                error_msg = f"Tipo de mensagem não reconhecido: {message.type}"
                logger.error(error_msg)
                return {"sucesso": False, "erro": error_msg}
        except Exception as e:
            error_msg = f"Erro ao processar mensagem MCP: {str(e)}"
            logger.error(error_msg)
            return {"sucesso": False, "erro": error_msg}
    
    def _handle_participant_registration(self, message: MCPMessage) -> Dict:
        """Gere registo de participante"""
        # Lógica específica para processamento de inscrições
        return {
            "sucesso": True,
            "mensagem": "Candidatura submetida com sucesso para análise.",
            "dados": message.content
        }
    
    def _handle_voting_submission(self, message: MCPMessage) -> Dict:
        """Gere submissão de voto"""
        # Lógica específica para processamento de votos
        return {
            "sucesso": True,
            "mensagem": "Voto registado com sucesso no sistema.",
            "dados": message.content
        }
    
    def _handle_donation_processing(self, message: MCPMessage) -> Dict:
        """Gere processamento de doação"""
        # Lógica específica para processamento de contribuições
        return {
            "sucesso": True,
            "mensagem": "Contribuição em processamento. Receberá confirmação em breve.",
            "dados": message.content
        }
    
    def _handle_notification(self, message: MCPMessage) -> Dict:
        """Gere notificações do sistema"""
        # Lógica específica para envio de notificações
        return {
            "sucesso": True,
            "mensagem": "Notificação enviada com sucesso.",
            "dados": message.content
        }
    
    def _handle_error(self, message: MCPMessage) -> Dict:
        """Gere erros do sistema"""
        # Lógica específica para tratamento de erros
        return {
            "sucesso": False,
            "mensagem": "Erro processado e registado no sistema.",
            "dados": message.content
        }
    
    def add_to_queue(self, message: MCPMessage):
        """Adiciona mensagem à fila de processamento"""
        self.message_queue.append(message)
    
    def process_queue(self) -> List[Dict]:
        """Processa todas as mensagens na fila"""
        results = []
        while self.message_queue:
            message = self.message_queue.pop(0)
            result = self.process_message(message)
            results.append(result)
        return results


# Instância global do gestor MCP
mcp_handler = MCPHandler()
