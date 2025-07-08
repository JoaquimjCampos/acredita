"""
Middleware MCP para integração com Django REST Framework
Processa todas as requisições através do protocolo MCP
"""

from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework import status
from datetime import datetime
import json
import logging
from . import MCPMessage, MCPProtocol, mcp_handler

logger = logging.getLogger(__name__)


class MCPMiddleware(MiddlewareMixin):
    """Middleware para processamento automático via MCP"""
    
    def process_request(self, request):
        """Processa requisições de entrada através do MCP"""
        # Adiciona cabeçalhos MCP
        request.META['MCP_PROCESSED'] = True
        request.META['MCP_LANGUAGE'] = 'pt-AO'
        
        # Log formal da requisição
        logger.info(f"Requisição MCP recebida: {request.method} {request.path}")
        
        return None
    
    def process_response(self, request, response):
        """Processa respostas de saída através do MCP"""
        # Adiciona cabeçalhos MCP na resposta
        response['X-MCP-Protocol'] = 'acredita-v1.0'
        response['X-MCP-Language'] = 'pt-AO'
        response['X-MCP-Timestamp'] = datetime.now().isoformat()
        
        return response
    
    def process_exception(self, request, exception):
        """Processa excepções através do protocolo MCP"""
        error_data = {
            "tipo": "erro_servidor",
            "descricao": str(exception),
            "path": request.path,
            "method": request.method
        }
        
        error_message = MCPProtocol.create_error_message(error_data)
        mcp_handler.add_to_queue(error_message)
        
        logger.error(f"Erro MCP processado: {exception}")
        
        return JsonResponse({
            "sucesso": False,
            "mensagem": "Erro interno do servidor. A equipa técnica foi notificada.",
            "codigo_erro": error_message.id
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def mcp_endpoint(message_type: str):
    """Decorador para endpoints que utilizam MCP"""
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            try:
                # Processa a requisição através do MCP
                if request.method == 'POST':
                    data = json.loads(request.body) if request.body else {}
                    
                    # Cria mensagem MCP baseada no tipo
                    if message_type == 'participant_registration':
                        message = MCPProtocol.create_participant_message(data)
                    elif message_type == 'voting':
                        message = MCPProtocol.create_voting_message(data)
                    elif message_type == 'donation':
                        message = MCPProtocol.create_donation_message(data)
                    else:
                        message = MCPMessage(message_type, data)
                    
                    # Processa através do gestor MCP
                    result = mcp_handler.process_message(message)
                    
                    # Executa a view original
                    response = view_func(request, *args, **kwargs)
                    
                    # Adiciona informações MCP na resposta
                    if hasattr(response, 'data'):
                        response.data['mcp_message_id'] = message.id
                        response.data['mcp_result'] = result
                    
                    return response
                else:
                    return view_func(request, *args, **kwargs)
                    
            except Exception as e:
                error_data = {
                    "tipo": "erro_decorador_mcp",
                    "descricao": str(e),
                    "endpoint": request.path
                }
                error_message = MCPProtocol.create_error_message(error_data)
                mcp_handler.add_to_queue(error_message)
                
                return JsonResponse({
                    "sucesso": False,
                    "mensagem": "Erro no processamento MCP",
                    "codigo_erro": error_message.id
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return wrapper
    return decorator
