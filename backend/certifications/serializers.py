from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    ProfessionalCategory,
    TrainingProgram,
    CandidateEnrollment,
    SkillAssessment,
    AssessmentResult
)

User = get_user_model()


class ProfessionalCategorySerializer(serializers.ModelSerializer):
    """Serializer para categorias profissionais"""
    programs_count = serializers.SerializerMethodField()
    active_programs_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ProfessionalCategory
        fields = [
            'id',
            'name',
            'inefob_code',
            'description',
            'icon_url',
            'is_active',
            'programs_count',
            'active_programs_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_programs_count(self, obj):
        """Total de programas na categoria"""
        return obj.programs.count()
    
    def get_active_programs_count(self, obj):
        """Programas ativos na categoria"""
        return obj.programs.filter(is_active=True).count()


class TrainingProgramSerializer(serializers.ModelSerializer):
    """Serializer para programas de formação"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_code = serializers.CharField(source='category.inefob_code', read_only=True)
    current_participants = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingProgram
        fields = [
            'id',
            'category',
            'category_name',
            'category_code',
            'title',
            'description',
            'provider',
            'duration_hours',
            'cost',
            'is_inefob_certified',
            'is_active',
            'max_participants',
            'current_participants',
            'is_full',
            'start_date',
            'end_date',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'current_participants', 'is_full']
    
    def get_current_participants(self, obj):
        """Número atual de participantes"""
        return obj.current_participants
    
    def get_is_full(self, obj):
        """Verificar se programa está cheio"""
        return obj.is_full


class SkillAssessmentSerializer(serializers.ModelSerializer):
    """Serializer para avaliações"""
    class Meta:
        model = SkillAssessment
        fields = [
            'id',
            'program',
            'title',
            'description',
            'weight',
            'is_required',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AssessmentResultSerializer(serializers.ModelSerializer):
    """Serializer para resultados de avaliação"""
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)
    evaluated_by_username = serializers.CharField(source='evaluated_by.username', read_only=True)
    
    class Meta:
        model = AssessmentResult
        fields = [
            'id',
            'enrollment',
            'assessment',
            'assessment_title',
            'result',
            'score',
            'notes',
            'evaluated_by',
            'evaluated_by_username',
            'evaluated_at'
        ]
        read_only_fields = ['id', 'evaluated_at']


class CandidateEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer para inscrições de candidatos"""
    program_title = serializers.CharField(source='program.title', read_only=True)
    program_category = serializers.CharField(source='program.category.name', read_only=True)
    candidate_username = serializers.CharField(source='candidate.username', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    assessment_results = AssessmentResultSerializer(many=True, read_only=True)
    
    class Meta:
        model = CandidateEnrollment
        fields = [
            'id',
            'candidate',
            'candidate_username',
            'candidate_email',
            'program',
            'program_title',
            'program_category',
            'status',
            'enrollment_date',
            'start_date',
            'completion_date',
            'certificate_url',
            'certificate_code',
            'notes',
            'assessment_results',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'candidate',
            'candidate_username',
            'candidate_email',
            'program_title',
            'program_category',
            'enrollment_date',
            'start_date',
            'completion_date',
            'certificate_url',
            'certificate_code',
            'assessment_results'
        ]
    
    def create(self, validated_data):
        """Criar inscrição para user autenticado"""
        user = self.context['request'].user
        validated_data['candidate'] = user
        return super().create(validated_data)


class CandidateEnrollmentDetailSerializer(serializers.ModelSerializer):
    """Serializer detalhado para visualização individual"""
    program = TrainingProgramSerializer(read_only=True)
    candidate = serializers.SerializerMethodField()
    assessment_results = AssessmentResultSerializer(many=True, read_only=True)
    
    class Meta:
        model = CandidateEnrollment
        fields = [
            'id',
            'candidate',
            'program',
            'status',
            'enrollment_date',
            'start_date',
            'completion_date',
            'certificate_url',
            'certificate_code',
            'notes',
            'assessment_results'
        ]
        read_only_fields = fields
    
    def get_candidate(self, obj):
        return {
            'id': obj.candidate.id,
            'username': obj.candidate.username,
            'email': obj.candidate.email,
            'first_name': obj.candidate.first_name,
            'last_name': obj.candidate.last_name
        }
