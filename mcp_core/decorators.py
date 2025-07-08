"""
MCP Decorators - Model Context Protocol Integration
Sistema Acredita em Ti, Acredita em Angola
"""

import functools
import json
import uuid
from datetime import datetime
from django.utils import timezone
from django.http import JsonResponse
from django.conf import settings
import logging

# Configure MCP logger
mcp_logger = logging.getLogger('mcp')


def mcp_endpoint(view_func):
    """
    Decorator para endpoints que integram com MCP (Model Context Protocol)
    Gera mensagens MCP para todas as requisições e respostas
    """
    @functools.wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        # Generate MCP message ID
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        message_id = f"acredita_{timestamp}_{uuid.uuid4().hex[:8]}"
        
        # MCP Request logging
        mcp_request_data = {
            'message_id': message_id,
            'timestamp': timezone.now().isoformat(),
            'endpoint': f"{request.method} {request.path}",
            'user': str(request.user) if request.user.is_authenticated else 'anonymous',
            'ip_address': get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'request_data': get_safe_request_data(request),
            'mcp_version': '1.0',
            'sistema': 'Acredita em Ti, Acredita em Angola'
        }
        
        # Log MCP request
        mcp_logger.info(f"MCP_REQUEST: {json.dumps(mcp_request_data, default=str)}")
        
        try:
            # Execute the view function
            response = view_func(self, request, *args, **kwargs)
            
            # Add MCP message ID to response if it's a DRF Response
            if hasattr(response, 'data') and isinstance(response.data, dict):
                response.data['mcp_message_id'] = message_id
            
            # MCP Response logging
            mcp_response_data = {
                'message_id': message_id,
                'timestamp': timezone.now().isoformat(),
                'status_code': response.status_code,
                'success': 200 <= response.status_code < 300,
                'response_size': len(str(response.data)) if hasattr(response, 'data') else 0,
                'processing_time': (timezone.now() - datetime.fromisoformat(mcp_request_data['timestamp'].replace('Z', '+00:00'))).total_seconds()
            }
            
            # Log MCP response
            mcp_logger.info(f"MCP_RESPONSE: {json.dumps(mcp_response_data, default=str)}")
            
            return response
            
        except Exception as e:
            # MCP Error logging
            mcp_error_data = {
                'message_id': message_id,
                'timestamp': timezone.now().isoformat(),
                'error_type': type(e).__name__,
                'error_message': str(e),
                'status_code': 500
            }
            
            # Log MCP error
            mcp_logger.error(f"MCP_ERROR: {json.dumps(mcp_error_data, default=str)}")
            
            # Re-raise the exception
            raise
    
    return wrapper


def mcp_background_task(task_func):
    """
    Decorator para tarefas em background que integram com MCP
    """
    @functools.wraps(task_func)
    def wrapper(*args, **kwargs):
        # Generate MCP task ID
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        task_id = f"task_acredita_{timestamp}_{uuid.uuid4().hex[:8]}"
        
        # MCP Task start logging
        mcp_task_data = {
            'task_id': task_id,
            'task_name': task_func.__name__,
            'timestamp': timezone.now().isoformat(),
            'args': str(args),
            'kwargs': str(kwargs),
            'mcp_version': '1.0',
            'sistema': 'Acredita em Ti, Acredita em Angola'
        }
        
        # Log MCP task start
        mcp_logger.info(f"MCP_TASK_START: {json.dumps(mcp_task_data, default=str)}")
        
        try:
            # Execute the task
            result = task_func(*args, **kwargs)
            
            # MCP Task completion logging
            mcp_completion_data = {
                'task_id': task_id,
                'timestamp': timezone.now().isoformat(),
                'success': True,
                'result': str(result)[:500] if result else None  # Limit result size
            }
            
            # Log MCP task completion
            mcp_logger.info(f"MCP_TASK_COMPLETE: {json.dumps(mcp_completion_data, default=str)}")
            
            return result
            
        except Exception as e:
            # MCP Task error logging
            mcp_error_data = {
                'task_id': task_id,
                'timestamp': timezone.now().isoformat(),
                'success': False,
                'error_type': type(e).__name__,
                'error_message': str(e)
            }
            
            # Log MCP task error
            mcp_logger.error(f"MCP_TASK_ERROR: {json.dumps(mcp_error_data, default=str)}")
            
            # Re-raise the exception
            raise
    
    return wrapper


def update_mcp_metadata(user=None, action=None, resource=None, metadata=None):
    """
    Função para atualizar metadados MCP
    """
    timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
    metadata_id = f"metadata_acredita_{timestamp}_{uuid.uuid4().hex[:8]}"
    
    mcp_metadata = {
        'metadata_id': metadata_id,
        'timestamp': timezone.now().isoformat(),
        'user': str(user) if user else 'system',
        'action': action,
        'resource': resource,
        'metadata': metadata,
        'mcp_version': '1.0',
        'sistema': 'Acredita em Ti, Acredita em Angola'
    }
    
    # Log MCP metadata
    mcp_logger.info(f"MCP_METADATA: {json.dumps(mcp_metadata, default=str)}")
    
    return metadata_id


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_safe_request_data(request):
    """Get safe request data for logging (excluding sensitive info)"""
    sensitive_fields = ['password', 'token', 'secret', 'key', 'csrf']
    
    data = {}
    
    # GET parameters
    if request.GET:
        data['GET'] = {k: v for k, v in request.GET.items() 
                      if not any(field in k.lower() for field in sensitive_fields)}
    
    # POST data (for form data)
    if hasattr(request, 'POST') and request.POST:
        data['POST'] = {k: v for k, v in request.POST.items() 
                       if not any(field in k.lower() for field in sensitive_fields)}
    
    # For DRF requests, get data from request.data
    if hasattr(request, 'data') and request.data:
        if isinstance(request.data, dict):
            data['DATA'] = {k: v for k, v in request.data.items() 
                           if not any(field in k.lower() for field in sensitive_fields)}
        else:
            data['DATA'] = str(request.data)[:500]  # Limit size
    
    return data
