import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from backend.certifications.models import (
    ProfessionalCategory,
    TrainingProgram,
    CandidateEnrollment,
    SkillAssessment,
    AssessmentResult
)

User = get_user_model()


@pytest.mark.django_db
class TestCertificationModels:
    """Testes dos models de certificações"""
    
    def test_create_professional_category(self):
        """Criar categoria profissional"""
        category = ProfessionalCategory.objects.create(
            name='Motoqueiro',
            inefob_code='MTQ001',
            description='Condutor profissional de motociclo'
        )
        assert category.name == 'Motoqueiro'
        assert category.inefob_code == 'MTQ001'
        assert category.is_active is True
        assert str(category) == 'Motoqueiro (MTQ001)'
    
    def test_category_unique_constraint(self):
        """Testar constraint único de categoria"""
        ProfessionalCategory.objects.create(
            name='Cat1',
            inefob_code='CODE1',
            description='Test'
        )
        
        # Tentar criar com mesmo código deve falhar
        with pytest.raises(Exception):
            ProfessionalCategory.objects.create(
                name='Cat2',
                inefob_code='CODE1',
                description='Test'
            )
    
    def test_create_training_program(self):
        """Criar programa de formação"""
        category = ProfessionalCategory.objects.create(
            name='Test Cat',
            inefob_code='TST',
            description='Test'
        )
        program = TrainingProgram.objects.create(
            category=category,
            title='Test Program',
            description='Test program',
            provider='Provider',
            duration_hours=40,
            cost=5000.00
        )
        assert program.title == 'Test Program'
        assert program.category == category
        assert program.is_active is True
        assert program.current_participants == 0
    
    def test_training_program_capacity(self):
        """Testar capacidade máxima de programa"""
        category = ProfessionalCategory.objects.create(
            name='Test', inefob_code='TST', description='Test'
        )
        program = TrainingProgram.objects.create(
            category=category,
            title='Limited Program',
            description='Test',
            provider='Test',
            duration_hours=40,
            cost=5000.00,
            max_participants=2
        )
        
        user1 = User.objects.create_user(username='user1', password='pass')
        user2 = User.objects.create_user(username='user2', password='pass')
        
        # Primeira inscrição
        CandidateEnrollment.objects.create(candidate=user1, program=program)
        assert program.current_participants == 1
        assert program.is_full is False
        
        # Segunda inscrição
        CandidateEnrollment.objects.create(candidate=user2, program=program)
        assert program.current_participants == 2
        assert program.is_full is True
    
    def test_candidate_enrollment_workflow(self):
        """Testar workflow completo de inscrição"""
        # Setup
        category = ProfessionalCategory.objects.create(
            name='Test', inefob_code='TST', description='Test'
        )
        program = TrainingProgram.objects.create(
            category=category,
            title='Test',
            description='Test',
            provider='Test',
            duration_hours=40,
            cost=5000.00
        )
        user = User.objects.create_user(username='test', password='test')
        
        # Criar inscrição
        enrollment = CandidateEnrollment.objects.create(
            candidate=user,
            program=program
        )
        assert enrollment.status == 'enrolled'
        assert enrollment.start_date is None
        
        # Iniciar programa
        assert enrollment.start_program() is True
        assert enrollment.status == 'in_progress'
        assert enrollment.start_date is not None
        
        # Completar programa
        assert enrollment.complete_program() is True
        assert enrollment.status == 'completed'
        assert enrollment.completion_date is not None
        
        # Certificar
        assert enrollment.certify(certificate_code='CERT123') is True
        assert enrollment.status == 'certified'
        assert enrollment.certificate_code == 'CERT123'


@pytest.mark.django_db
class TestCertificationAPIs:
    """Testes das APIs REST"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup para cada teste"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        
        # Criar dados de teste
        self.category = ProfessionalCategory.objects.create(
            name='Test Category',
            inefob_code='TST001',
            description='Test category'
        )
        self.program = TrainingProgram.objects.create(
            category=self.category,
            title='Test Program',
            description='Test program',
            provider='Test Provider',
            duration_hours=40,
            cost=5000.00
        )
    
    def test_list_categories_unauthenticated(self):
        """Acessar categorias sem autenticação deve falhar"""
        response = self.client.get('/api/v2/certifications/categories/')
        assert response.status_code == 401
    
    def test_list_categories_authenticated(self):
        """Listar categorias autenticado"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v2/certifications/categories/')
        
        assert response.status_code == 200
        assert 'results' in response.data
        assert len(response.data['results']) >= 1
        assert response.data['results'][0]['name'] == 'Test Category'
    
    def test_list_programs_authenticated(self):
        """Listar programas"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v2/certifications/programs/')
        
        assert response.status_code == 200
        assert 'results' in response.data
        assert len(response.data['results']) >= 1
    
    def test_enroll_in_program(self):
        """Inscrever em programa"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(
            '/api/v2/certifications/enrollments/',
            {'program': self.program.id}
        )
        
        assert response.status_code == 201
        assert response.data['status'] == 'enrolled'
        
        # Verificar inscrição no BD
        enrollment = CandidateEnrollment.objects.get(
            candidate=self.user,
            program=self.program
        )
        assert enrollment is not None
    
    def test_duplicate_enrollment(self):
        """Não permitir inscrição duplicada"""
        self.client.force_authenticate(user=self.user)
        
        # Primeira inscrição
        response1 = self.client.post(
            '/api/v2/certifications/enrollments/',
            {'program': self.program.id}
        )
        assert response1.status_code == 201
        
        # Segunda inscrição deve falhar
        response2 = self.client.post(
            '/api/v2/certifications/enrollments/',
            {'program': self.program.id}
        )
        assert response2.status_code == 400
        assert 'já está inscrito' in response2.data['error'].lower()
    
    def test_list_my_enrollments(self):
        """User vê apenas suas inscrições"""
        # Criar inscrição
        CandidateEnrollment.objects.create(
            candidate=self.user,
            program=self.program
        )
        
        # Autenticar e listar
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v2/certifications/enrollments/')
        
        assert response.status_code == 200
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['candidate'] == self.user.id
    
    def test_start_program(self):
        """Iniciar programa"""
        enrollment = CandidateEnrollment.objects.create(
            candidate=self.user,
            program=self.program
        )
        
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            f'/api/v2/certifications/enrollments/{enrollment.id}/start/'
        )
        
        assert response.status_code == 200
        
        # Verificar status mudou
        enrollment.refresh_from_db()
        assert enrollment.status == 'in_progress'
        assert enrollment.start_date is not None
    
    def test_complete_program(self):
        """Completar programa"""
        enrollment = CandidateEnrollment.objects.create(
            candidate=self.user,
            program=self.program,
            status='in_progress'
        )
        
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            f'/api/v2/certifications/enrollments/{enrollment.id}/complete/'
        )
        
        assert response.status_code == 200
        
        enrollment.refresh_from_db()
        assert enrollment.status == 'completed'
        assert enrollment.completion_date is not None
    
    def test_certify_program_admin_only(self):
        """Apenas admin pode certificar"""
        enrollment = CandidateEnrollment.objects.create(
            candidate=self.user,
            program=self.program,
            status='completed'
        )
        
        # User normal tenta certificar
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            f'/api/v2/certifications/enrollments/{enrollment.id}/certify/'
        )
        assert response.status_code == 403
        
        # Admin certifica
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(
            f'/api/v2/certifications/enrollments/{enrollment.id}/certify/'
        )
        assert response.status_code == 200
        
        enrollment.refresh_from_db()
        assert enrollment.status == 'certified'
        assert enrollment.certificate_code is not None
    
    def test_my_stats(self):
        """Ver estatísticas do user"""
        # Criar múltiplas inscrições
        CandidateEnrollment.objects.create(
            candidate=self.user,
            program=self.program,
            status='certified'
        )
        
        other_program = TrainingProgram.objects.create(
            category=self.category,
            title='Other Program',
            description='Test',
            provider='Test',
            duration_hours=40,
            cost=3000.00
        )
        CandidateEnrollment.objects.create(
            candidate=self.user,
            program=other_program,
            status='in_progress'
        )
        
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v2/certifications/enrollments/my_stats/')
        
        assert response.status_code == 200
        assert response.data['total_enrolled'] == 2
        assert response.data['certified'] == 1
        assert response.data['in_progress'] == 1
