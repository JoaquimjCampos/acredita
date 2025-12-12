/**
 * CertificationsService
 * Gerencia todas as operações relacionadas com Certifications
 */

import { apiClient } from '../api/client';
import {
  ProfessionalCategoryDTO,
  TrainingProgramDTO,
  CandidateEnrollmentDTO,
  CertificateIssuedDTO,
  PaginatedResponse,
} from '../../types/api';

export class CertificationsService {
  private static readonly BASE_URL = '/certifications';

  /**
   * Get all professional categories
   */
  static async getCategories(): Promise<ProfessionalCategoryDTO[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<ProfessionalCategoryDTO>>(
        `${this.BASE_URL}/categories/`
      );
      return response.results;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get all training programs with optional filters
   */
  static async getPrograms(filters?: {
    category_id?: number;
    search?: string;
    status?: string;
    page?: number;
  }): Promise<PaginatedResponse<TrainingProgramDTO>> {
    try {
      const response = await apiClient.get<PaginatedResponse<TrainingProgramDTO>>(
        `${this.BASE_URL}/programs/`,
        { params: filters }
      );
      return response;
    } catch (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }
  }

  /**
   * Get single program details
   */
  static async getProgram(programId: number): Promise<TrainingProgramDTO> {
    try {
      return await apiClient.get<TrainingProgramDTO>(
        `${this.BASE_URL}/programs/${programId}/`
      );
    } catch (error) {
      console.error(`Error fetching program ${programId}:`, error);
      throw error;
    }
  }

  /**
   * Enroll user in a program
   */
  static async enrollProgram(programId: number): Promise<CandidateEnrollmentDTO> {
    try {
      return await apiClient.post<CandidateEnrollmentDTO>(
        `${this.BASE_URL}/enrollments/`,
        { program_id: programId }
      );
    } catch (error) {
      console.error(`Error enrolling in program ${programId}:`, error);
      throw error;
    }
  }

  /**
   * Get current user's enrollments
   */
  static async getMyEnrollments(): Promise<CandidateEnrollmentDTO[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<CandidateEnrollmentDTO>>(
        `${this.BASE_URL}/enrollments/my_enrollments/`
      );
      return response.results;
    } catch (error) {
      console.error('Error fetching my enrollments:', error);
      throw error;
    }
  }

  /**
   * Get single enrollment details
   */
  static async getEnrollment(enrollmentId: number): Promise<CandidateEnrollmentDTO> {
    try {
      return await apiClient.get<CandidateEnrollmentDTO>(
        `${this.BASE_URL}/enrollments/${enrollmentId}/`
      );
    } catch (error) {
      console.error(`Error fetching enrollment ${enrollmentId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's certificate
   */
  static async getCertificate(enrollmentId: number): Promise<CertificateIssuedDTO> {
    try {
      return await apiClient.get<CertificateIssuedDTO>(
        `${this.BASE_URL}/certificates/${enrollmentId}/`
      );
    } catch (error) {
      console.error(`Error fetching certificate for enrollment ${enrollmentId}:`, error);
      throw error;
    }
  }

  /**
   * Download certificate PDF
   */
  static async downloadCertificate(certificateId: number): Promise<Blob> {
    try {
      const response = await apiClient.get<Blob>(
        `${this.BASE_URL}/certificates/${certificateId}/download/`,
        { skipErrorHandler: false }
      );
      return response;
    } catch (error) {
      console.error(`Error downloading certificate ${certificateId}:`, error);
      throw error;
    }
  }

  /**
   * Get certification stats (admin)
   */
  static async getStats(): Promise<{
    total_programs: number;
    total_enrollments: number;
    total_certificates: number;
    completion_rate: number;
  }> {
    try {
      return await apiClient.get(`${this.BASE_URL}/stats/`);
    } catch (error) {
      console.error('Error fetching certification stats:', error);
      throw error;
    }
  }
}

export default CertificationsService;
