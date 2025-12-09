from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.shortcuts import get_object_or_404
import logging

from backend.core.feature_flags import check_feature_flag, FeatureFlagService
from .models import (
    ProfessionalCategory,
    TrainingProgram,
    CandidateEnrollment,
    SkillAssessment,
    AssessmentResult
)
from .serializers import (
    ProfessionalCategorySerializer,
    TrainingProgramSerializer,
    CandidateEnrollmentSerializer,
    CandidateEnrollmentDetailSerializer,
    SkillAssessmentSerializer,
    AssessmentResultSerializer
)

logger = logging.getLogger(__name__)


class ProfessionalCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Listar categorias profissionais INEFOB
    GET /api/v2/certifications/categories/
    """
    queryset = ProfessionalCategory.objects.filter(is_active=True)
    serializer_class = ProfessionalCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'inefob_code', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def list(self, request, *args, **kwargs):
        """Listar categorias (com verificação de feature flag)"""
        if not FeatureFlagService.is_enabled('certifications', request.user):
            logger.warning(f"User {request.user} tentou acessar categories com feature desativada")
            return Response(
                {'error': 'Certificações não estão disponíveis'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """Detalhe de uma categoria"""
        if not FeatureFlagService.is_enabled('certifications', request.user):
            return Response(
                {'error': 'Certificações não estão disponíveis'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def programs(self, request, pk=None):
        """Listar programas de uma categoria"""
        category = self.get_object()
        programs = category.programs.filter(is_active=True)
        serializer = TrainingProgramSerializer(programs, many=True)
        return Response(serializer.data)


class TrainingProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Listar programas de formação disponíveis
    GET /api/v2/certifications/programs/
    """
    queryset = TrainingProgram.objects.filter(is_active=True).select_related('category')
    serializer_class = TrainingProgramSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_inefob_certified']
    search_fields = ['title', 'description', 'provider']
    ordering_fields = ['cost', 'duration_hours', 'created_at']
    ordering = ['-created_at']
    
    def list(self, request, *args, **kwargs):
        """Listar programas"""
        if not FeatureFlagService.is_enabled('certifications', request.user):
            logger.warning(f"User {request.user} tentou acessar programs com feature desativada")
            return Response(
                {'error': 'Certificações não estão disponíveis'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """Detalhe de um programa"""
        if not FeatureFlagService.is_enabled('certifications', request.user):
            return Response(
                {'error': 'Certificações não estão disponíveis'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def assessments(self, request, pk=None):
        """Listar avaliações de um programa"""
        program = self.get_object()
        assessments = program.assessments.all()
        serializer = SkillAssessmentSerializer(assessments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def enrollments_count(self, request, pk=None):
        """Estatísticas de inscrição"""
        program = self.get_object()
        return Response({
            'total_enrolled': program.enrollments.filter(status__in=['enrolled', 'in_progress']).count(),
            'completed': program.enrollments.filter(status='completed').count(),
            'certified': program.enrollments.filter(status='certified').count(),
            'failed': program.enrollments.filter(status='failed').count(),
        })


class CandidateEnrollmentViewSet(viewsets.ModelViewSet):
    """
    Gerir inscrições em programas de formação
    GET /api/v2/certifications/enrollments/  - Listar minhas inscrições
    POST /api/v2/certifications/enrollments/  - Inscrever em programa
    GET /api/v2/certifications/enrollments/{id}/  - Detalhe
    POST /api/v2/certifications/enrollments/{id}/start/  - Iniciar programa
    POST /api/v2/certifications/enrollments/{id}/complete/  - Completar
    POST /api/v2/certifications/enrollments/{id}/certify/  - Certificar (admin)
    """
    serializer_class = CandidateEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'program__category']
    ordering_fields = ['enrollment_date', 'completion_date']
    ordering = ['-enrollment_date']
    
    def get_queryset(self):
        """User vê apenas suas inscrições, admin vê todas"""
        if not FeatureFlagService.is_enabled('certifications', self.request.user):
            return CandidateEnrollment.objects.none()
        
        if self.request.user.is_staff:
            return CandidateEnrollment.objects.select_related('candidate', 'program').all()
        return CandidateEnrollment.objects.filter(
            candidate=self.request.user
        ).select_related('program', 'program__category')
    
    def get_serializer_class(self):
        """Usar serializer detalhado para retrieve"""
        if self.action == 'retrieve':
            return CandidateEnrollmentDetailSerializer
        return CandidateEnrollmentSerializer
    
    def list(self, request, *args, **kwargs):
        """Listar inscrições"""
        if not FeatureFlagService.is_enabled('certifications', request.user):
            return Response(
                {'error': 'Certificações não estão disponíveis'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """Inscrever em programa"""
        if not FeatureFlagService.is_enabled('certifications', request.user):
            return Response(
                {'error': 'Certificações não estão disponíveis'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        program_id = request.data.get('program')
        
        # Validar que programa existe
        try:
            program = TrainingProgram.objects.get(id=program_id, is_active=True)
        except TrainingProgram.DoesNotExist:
            return Response(
                {'error': 'Programa não encontrado ou está inativo'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar se já está inscrito
        if CandidateEnrollment.objects.filter(
            candidate=request.user,
            program=program
        ).exists():
            return Response(
                {'error': 'Já está inscrito neste programa'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar se programa está cheio
        if program.is_full:
            return Response(
                {'error': 'Programa está cheio no momento'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        logger.info(f"User {request.user} inscrito em programa {program.title}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def perform_create(self, serializer):
        """Salvar inscrição com user autenticado"""
        serializer.save(candidate=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def start(self, request, pk=None):
        """Iniciar programa"""
        if not FeatureFlagService.is_enabled('certifications', request.user):
            return Response(
                {'error': 'Certificações não estão disponíveis'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        enrollment = self.get_object()
        
        if enrollment.candidate != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Sem permissão'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if enrollment.start_program():
            logger.info(f"Programa iniciado para {enrollment.candidate}: {enrollment.program.title}")
            return Response({'status': 'Programa iniciado'})
        else:
            return Response(
                {'error': f'Não pode iniciar programa com status {enrollment.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        """Marcar programa como concluído"""
        if not FeatureFlagService.is_enabled('certifications', request.user):
            return Response(
                {'error': 'Certificações não estão disponíveis'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        enrollment = self.get_object()
        
        if enrollment.candidate != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Sem permissão'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if enrollment.complete_program():
            logger.info(f"Programa concluído para {enrollment.candidate}: {enrollment.program.title}")
            return Response({'status': 'Programa marcado como concluído'})
        else:
            return Response(
                {'error': f'Não pode completar programa com status {enrollment.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def certify(self, request, pk=None):
        """Emitir certificado (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Apenas administradores podem emitir certificados'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not FeatureFlagService.is_enabled('certifications', request.user):
            return Response(
                {'error': 'Certificações não estão disponíveis'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        enrollment = self.get_object()
        
        # Gerar código de certificado (exemplo simples)
        certificate_code = f"CERT-{enrollment.program.category.inefob_code}-{enrollment.candidate.id}-{timezone.now().strftime('%Y%m%d')}"
        
        if enrollment.certify(certificate_code=certificate_code):
            logger.info(f"Certificado emitido para {enrollment.candidate}: {certificate_code}")
            return Response({
                'status': 'Certificado emitido',
                'certificate_code': certificate_code
            })
        else:
            return Response(
                {'error': 'Programa ainda não foi concluído'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_stats(self, request):
        """Estatísticas de certificações do user"""
        if not FeatureFlagService.is_enabled('certifications', request.user):
            return Response(
                {'error': 'Certificações não estão disponíveis'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        enrollments = CandidateEnrollment.objects.filter(candidate=request.user)
        
        stats = {
            'total_enrolled': enrollments.count(),
            'in_progress': enrollments.filter(status='in_progress').count(),
            'completed': enrollments.filter(status='completed').count(),
            'certified': enrollments.filter(status='certified').count(),
            'failed': enrollments.filter(status='failed').count(),
            'by_category': {}
        }
        
        # Contar por categoria
        for enrollment in enrollments:
            category_name = enrollment.program.category.name
            if category_name not in stats['by_category']:
                stats['by_category'][category_name] = {'count': 0, 'certified': 0}
            stats['by_category'][category_name]['count'] += 1
            if enrollment.status == 'certified':
                stats['by_category'][category_name]['certified'] += 1
        
        return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@check_feature_flag('certifications')
def certification_feature_status(request):
    """Ver status da feature de certificações"""
    return Response({
        'certifications_enabled': True,
        'available_categories': ProfessionalCategory.objects.filter(is_active=True).count(),
        'available_programs': TrainingProgram.objects.filter(is_active=True).count(),
        'my_enrollments': CandidateEnrollment.objects.filter(candidate=request.user).count(),
    })
